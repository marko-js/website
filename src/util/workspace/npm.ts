import maxSatisfying from "semver/ranges/max-satisfying";
import validRange from "semver/ranges/valid";

const MAX_PACKAGES = 32;
const MAX_FILE_SIZE = 1024 * 1024;
const MAX_PACKAGE_SIZE = 12 * 1024 * 1024;
const MAX_TARBALL_SIZE = 32 * 1024 * 1024;

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

interface Materialization {
  files: Record<string, string>;
  versions: Record<string, string>;
  seen: Set<string>;
  declared: Set<string>;
}

export async function fetchNodeModules(packageJsonSource: string): Promise<{
  files: Record<string, string>;
  versions: Record<string, string>;
}> {
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

  const deps = {
    ...pkg.peerDependencies,
    ...pkg.devDependencies,
    ...pkg.dependencies,
  };
  const ctx: Materialization = {
    files: {},
    versions: {},
    seen: new Set(),
    declared: new Set(Object.keys(deps)),
  };

  await Promise.all(
    Object.entries(deps).map(([name, range]) => materialize(ctx, name, range)),
  );

  return ctx;
}

async function materialize(
  ctx: Materialization,
  name: string,
  range: string,
  markoOnly = false,
): Promise<void> {
  const { files, versions, seen } = ctx;
  if (providedPackages.has(name) || seen.has(name)) return;
  if (!validPackageName.test(name)) {
    throw new Error(`Invalid package name in package.json: "${name}"`);
  }

  const packument = await loadPackument(name);
  const meta = packument.versions[pickVersion(name, range, packument)];
  versions[name] ??= meta.version;
  const isMarko = !!(meta.peerDependencies?.marko || meta.dependencies?.marko);
  if (markoOnly && !isMarko) return;

  // Rechecked after the await: a concurrent branch may have claimed this
  // package while the packument was loading.
  if (seen.has(name)) return;
  seen.add(name);
  if (seen.size > MAX_PACKAGES) {
    throw new Error(
      `Too many packages (the playground supports up to ${MAX_PACKAGES}).`,
    );
  }

  if (isMarko) {
    for (const depName in meta.peerDependencies) {
      if (!providedPackages.has(depName) && !ctx.declared.has(depName)) {
        throw new Error(
          `${name} requires the peer dependency "${depName}", add it to package.json`,
        );
      }
    }

    const [pkgFiles] = await Promise.all([
      loadTarball(name, meta, includedFile),
      ...Object.entries(meta.dependencies || {}).map(([depName, depRange]) =>
        materialize(ctx, depName, depRange, true).catch(() => {}),
      ),
    ]);

    if ("/marko.json" in pkgFiles) {
      for (const file in pkgFiles) {
        files[`/node_modules/${name}${file}`] = pkgFiles[file];
      }
    }

    return;
  }

  try {
    const pkgFiles = await loadTarball(name, meta, styleFile);
    if (Object.keys(pkgFiles).some((file) => file !== "/package.json")) {
      for (const file in pkgFiles) {
        files[`/node_modules/${name}${file}`] = pkgFiles[file];
      }
    }
  } catch {}
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
  return cached(packumentCache, name, async () => {
    const res = await fetch(
      `https://registry.npmjs.org/${name.replace("/", "%2f")}`,
      { headers: { accept: "application/vnd.npm.install-v1+json" } },
    );
    if (!res.ok) {
      throw new Error(`Could not find npm package "${name}"`);
    }
    return (await res.json()) as Packument;
  });
}

function loadTarball(name: string, meta: VersionMeta, filter: RegExp) {
  const key = `${name}@${meta.version}`;
  return cached(tarballCache, key, async () => {
    const res = await fetch(meta.dist.tarball);
    if (!res.ok) {
      throw new Error(`Could not download npm package ${key}`);
    }
    if (+(res.headers.get("content-length") || 0) > MAX_TARBALL_SIZE) {
      throw new Error(`npm package ${key} is too large for the playground.`);
    }
    const gzipped = res.body!.pipeThrough(new DecompressionStream("gzip"));
    const tar = new Uint8Array(await new Response(gzipped).arrayBuffer());
    return untar(key, tar, filter);
  });
}

function cached<T>(
  cache: Map<string, Promise<T>>,
  key: string,
  load: () => Promise<T>,
) {
  let promise = cache.get(key);
  if (!promise) {
    promise = load();
    cache.set(key, promise);
    promise.catch(() => cache.delete(key));
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
