import maxSatisfying from "semver/ranges/max-satisfying";
import validRange from "semver/ranges/valid";

const REGISTRY_URL = "https://registry.npmjs.org/";
const ABBREVIATED = "application/vnd.npm.install-v1+json";
const MAX_PACKAGES = 32;
const MAX_FILE_SIZE = 1024 * 1024;
const MAX_PACKAGE_SIZE = 12 * 1024 * 1024;
const MAX_DEPTH = 4;

const providedPackages = new Set(["marko", "@marko/compiler", "@marko/run"]);
const validPackageName =
  /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
const includedFile = /(?<!\.d)\.(marko|[cm]?[jt]s|json|css|html)$/;
const styleFile = /^\/package\.json$|\.css$/;

interface Packument {
  "dist-tags"?: Record<string, string>;
  versions: Record<string, VersionMeta>;
}
interface VersionMeta {
  version: string;
  dist: { tarball: string };
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

const decoder = new TextDecoder();
const packumentCache = new Map<string, Promise<Packument>>();
const tarballCache = new Map<string, Promise<Record<string, string>>>();

export async function fetchNodeModules(
  packageJsonSource: string,
): Promise<Record<string, string>> {
  let pkg: {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
  };
  try {
    pkg = JSON.parse(packageJsonSource);
  } catch (err) {
    throw new Error(`Could not parse package.json: ${(err as Error).message}`);
  }

  const entries: Record<string, string> = {};
  const seen = new Set<string>();
  const deps = {
    ...pkg.peerDependencies,
    ...pkg.devDependencies,
    ...pkg.dependencies,
  };

  await Promise.all(
    Object.entries(deps).map(([name, range]) =>
      materialize(entries, seen, name, range),
    ),
  );

  return entries;
}

async function materialize(
  entries: Record<string, string>,
  seen: Set<string>,
  name: string,
  range: string,
  depth = 0,
  markoOnly = false,
): Promise<void> {
  if (providedPackages.has(name) || seen.has(name)) return;
  if (!validPackageName.test(name)) {
    throw new Error(`Invalid package name in package.json: "${name}"`);
  }

  const packument = await loadPackument(name);
  const meta = packument.versions[pickVersion(name, range, packument)];
  const isMarko = dependsOnMarko(meta);
  if (markoOnly && !isMarko) return;

  seen.add(name);
  if (seen.size > MAX_PACKAGES) {
    throw new Error(
      `Too many packages (the playground supports up to ${MAX_PACKAGES}).`,
    );
  }

  if (isMarko) {
    const files = await loadTarball(name, meta, includedFile);
    if ("/marko.json" in files) {
      for (const file in files) {
        entries[`/node_modules/${name}${file}`] ??= files[file];
      }

      if (depth < MAX_DEPTH) {
        await Promise.all([
          ...Object.entries(meta.dependencies || {}).map(
            ([depName, depRange]) =>
              materialize(
                entries,
                seen,
                depName,
                depRange,
                depth + 1,
                true,
              ).catch(() => {}),
          ),
          ...Object.entries(meta.peerDependencies || {}).map(
            ([depName, depRange]) =>
              materialize(entries, seen, depName, depRange, depth + 1).catch(
                () => {},
              ),
          ),
        ]);
      }
    }

    return;
  }

  try {
    const files = await loadTarball(name, meta, styleFile);
    if (Object.keys(files).some((file) => file !== "/package.json")) {
      for (const file in files) {
        entries[`/node_modules/${name}${file}`] ??= files[file];
      }
    }
  } catch {}
}

function dependsOnMarko(meta: VersionMeta) {
  return !!(meta.peerDependencies?.marko || meta.dependencies?.marko);
}

function pickVersion(name: string, range: string, packument: Packument) {
  const distTags = packument["dist-tags"] || {};
  const wanted = range || "latest";

  if (distTags[wanted]) return distTags[wanted];

  if (validRange(wanted, { loose: true })) {
    const version = maxSatisfying(Object.keys(packument.versions), wanted, {
      loose: true,
    });
    if (version) return version;
  }

  throw new Error(`No version of ${name} satisfies "${range}"`);
}

function loadPackument(name: string) {
  let promise = packumentCache.get(name);
  if (!promise) {
    promise = (async () => {
      const res = await fetch(`${REGISTRY_URL}${name.replace("/", "%2f")}`, {
        headers: { accept: ABBREVIATED },
      });
      if (!res.ok) {
        throw new Error(`Could not find npm package "${name}"`);
      }
      return (await res.json()) as Packument;
    })();
    packumentCache.set(name, promise);
    promise.catch(() => packumentCache.delete(name));
  }
  return promise;
}

function loadTarball(name: string, meta: VersionMeta, filter: RegExp) {
  const key = `${name}@${meta.version}`;
  let promise = tarballCache.get(key);
  if (!promise) {
    promise = (async () => {
      const res = await fetch(meta.dist.tarball);
      if (!res.ok) {
        throw new Error(`Could not download npm package ${key}`);
      }
      const gzipped = res.body!.pipeThrough(new DecompressionStream("gzip"));
      const tar = new Uint8Array(await new Response(gzipped).arrayBuffer());
      return untar(key, tar, filter);
    })();
    tarballCache.set(key, promise);
    promise.catch(() => tarballCache.delete(key));
  }
  return promise;
}

function untar(
  key: string,
  bytes: Uint8Array,
  filter: RegExp,
): Record<string, string> {
  const files: Record<string, string> = {};
  let totalSize = 0;
  let offset = 0;
  let paxPath: string | undefined;

  while (offset + 512 <= bytes.length) {
    const header = bytes.subarray(offset, offset + 512);
    if (header.every((b) => b === 0)) break;

    const size = parseInt(readField(bytes, offset + 124, 12), 8) || 0;
    const type = String.fromCharCode(bytes[offset + 156] || 0);
    const name = readField(bytes, offset, 100);
    const prefix = readField(bytes, offset + 345, 155);
    offset += 512;
    const body = bytes.subarray(offset, offset + size);
    offset += Math.ceil(size / 512) * 512;

    if (type === "x" || type === "g") {
      const match = /(?:^|\n)\d+ path=([^\n]*)\n/.exec(decoder.decode(body));
      if (match) paxPath = match[1];
      continue;
    }

    if (type !== "0" && type !== "\0" && type !== "") {
      paxPath = undefined;
      continue;
    }

    const raw = paxPath ?? (prefix ? `${prefix}/${name}` : name);
    paxPath = undefined;

    const path = raw.replace(/^[^/]*\//, "/");
    if (!path.startsWith("/") || !filter.test(path)) continue;
    if (size > MAX_FILE_SIZE) continue;

    totalSize += size;
    if (totalSize > MAX_PACKAGE_SIZE) {
      throw new Error(`npm package ${key} is too large for the playground.`);
    }

    files[path] = decoder.decode(body);
  }

  return files;
}

function readField(bytes: Uint8Array, offset: number, length: number) {
  let end = offset;
  const limit = offset + length;
  while (end < limit && bytes[end] !== 0) end++;
  return decoder.decode(bytes.subarray(offset, end)).trim();
}
