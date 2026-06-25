// Snapshot a Marko version's playground toolchain (compiler + translator +
// runtime) into a single self-contained, browser-ready file at
// public/playground/versions/<version>/index.js, and record it in the
// manifests the playground reads.
//
// With no argument it snapshots the *currently installed* `marko` and is a
// no-op if that version was already snapshotted — so it can run on every
// build/dev (see the prebuild/predev scripts): each release checks whether the
// current version exists and reuses it, otherwise builds and commits it. Past
// versions are never rebuilt; they're just the committed snapshots from when
// they were current. Pass an explicit version (installed under an
// `marko-<v_with_underscores>` npm alias) to backfill an additional one.
//
// The build mirrors the browser config in vite.config.ts so the bundle resolves
// and tree-shakes exactly like the toolchain the site itself ships.

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { build } from "vite";

const require = createRequire(import.meta.url);
const root = process.cwd();
const requested = process.argv[2];

// Resolve the package to snapshot: the installed `marko` by default, or an
// `marko-<v>` alias when backfilling a specific version.
let pkg, version;
if (requested) {
  if (!/^\d+\.\d+\.\d+/.test(requested)) {
    console.error(
      "usage: node scripts/build-playground-version.mjs [marko-version]",
    );
    process.exit(1);
  }
  version = requested;
  pkg = "marko-" + version.replace(/\./g, "_");
  if (!isInstalled(pkg, version)) {
    console.error(
      `Missing dependency '${pkg}'. Add "${pkg}": "npm:marko@${version}" to ` +
        `devDependencies, run npm install, then retry.`,
    );
    process.exit(1);
  }
} else {
  pkg = "marko";
  version = require(
    require.resolve("marko/package.json", { paths: [root] }),
  ).version;
}

const versionDir = path.join(root, "public/playground/versions", version);

// Idempotent: if this version is already snapshotted, just make sure it's in the
// manifests and stop. This is the "reuse if it exists" path.
if (fs.existsSync(path.join(versionDir, "index.js"))) {
  writeManifests(updateManifest(version));
  console.log(`Marko ${version} already snapshotted — reusing.`);
  process.exit(0);
}

const pkgDir = path.dirname(
  require.resolve(`${pkg}/package.json`, { paths: [root] }),
);
// Pin the @marko/compiler that ships with this exact Marko version so each
// artifact is self-contained and correct across major versions.
const compilerMain = require.resolve("@marko/compiler", { paths: [pkgDir] });
const compilerDir = path.dirname(
  require.resolve("@marko/compiler/package.json", { paths: [pkgDir] }),
);

// `@marko/compiler` exposes a browser-safe babel build under its `browser`
// export condition, but a bare `require("@marko/compiler/internal/babel")`
// doesn't pick that up — so we alias it explicitly. Without this the node
// babel's file-config (gensync) path is bundled and throws at load in browsers.
const babelWeb = path.join(compilerDir, "dist/babel.web.js");
if (!fs.existsSync(babelWeb)) {
  console.error(
    `Expected a browser babel build at ${babelWeb} (does this Marko version ship one?).`,
  );
  process.exit(1);
}

const tmpDir = path.join(root, ".playground-version-tmp");
fs.mkdirSync(tmpDir, { recursive: true });
const entry = path.join(tmpDir, "entry.js");
fs.writeFileSync(
  entry,
  `import * as compiler from "@marko/compiler";
import * as translator from "${pkg}/translator";
import runtimeDOM from "${pkg}/dom?raw";
import runtimeHTML from "${pkg}/html?raw";
import runtimeDebugDOM from "${pkg}/debug/dom?raw";
import runtimeDebugHTML from "${pkg}/debug/html?raw";
export default {
  compiler,
  translator,
  runtimeModules: {
    "marko/dom": runtimeDOM,
    "marko/html": runtimeHTML,
    "marko/debug/dom": runtimeDebugDOM,
    "marko/debug/html": runtimeDebugHTML,
  },
};
`,
);

try {
  const result = await build({
    configFile: false,
    logLevel: "warn",
    root,
    // Mirror vite.config.ts's client environment exactly (define values are raw
    // replacement expressions). The browser resolve conditions + babel.web alias
    // are what make @marko/compiler bundle for the browser.
    define: {
      __dirname: "'/'",
      global: "globalThis",
      "process.browser": "true",
      "process.env": "{}",
      "process.env.BUNDLE": "true",
      "process.env.BABEL_TYPES_8_BREAKING": "false",
      "process.env.NODE_ENV": JSON.stringify("production"),
    },
    resolve: {
      conditions: ["browser", "import", "module", "default"],
      mainFields: ["browser", "module", "jsnext:main", "jsnext", "main"],
      // Array form so order is preserved: the internal/babel override must be
      // tried before the bare @marko/compiler alias.
      alias: [
        { find: "@marko/compiler/internal/babel", replacement: babelWeb },
        { find: /^@marko\/compiler$/, replacement: compilerMain },
        {
          find: "node:path",
          replacement: path.resolve(root, "shim/path/browser.js"),
        },
      ],
    },
    build: {
      write: false,
      // Library mode preserves the entry's `export default` (a plain rollup
      // input drops it) and inlines to a single referenceable file per version.
      lib: { entry, formats: ["es"], fileName: () => "index" },
      // Don't run a second esbuild minify pass: it dead-code-eliminates
      // @marko/compiler's CJS exports (taglib/compileSync) since nothing reads
      // them statically. Vite's own minify renders the whole bundle and is safe.
      minify: true,
      target: "es2022",
      rollupOptions: {
        // Same as the app: browserslist is only reached by a dead autoprefix
        // path, so it's left external (a never-executed `require`).
        external: ["browserslist"],
      },
    },
  });

  const output = (Array.isArray(result) ? result[0] : result).output;
  const chunk = output.find((o) => o.type === "chunk" && o.isEntry);
  if (!chunk) throw new Error("vite build produced no entry chunk");
  const code = chunk.code;

  // ESM `import`s are resolved at load time, so any residual bare node import
  // would break the artifact in the browser. (A dead `require("browserslist")`
  // is fine — `require` only errors if executed.)
  const residual = [
    ...code.matchAll(
      /(?:^|[^.\w])from\s*["'](fs|path|module|url|node:[^"']+|browserslist)["']/g,
    ),
  ].map((m) => m[1]);
  if (residual.length) {
    throw new Error(
      `artifact has unresolved imports: ${[...new Set(residual)].join(", ")}`,
    );
  }

  fs.mkdirSync(versionDir, { recursive: true });
  fs.writeFileSync(path.join(versionDir, "index.js"), code);
  writeManifests(updateManifest(version));

  console.log(
    `Snapshotted Marko ${version} -> public/playground/versions/${version}/index.js ` +
      `(${Math.round(code.length / 1024)} KB). Commit it to publish the version.`,
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

function isInstalled(name, expected) {
  try {
    return (
      require(require.resolve(`${name}/package.json`, { paths: [root] }))
        .version === expected
    );
  } catch {
    return false;
  }
}

function updateManifest(v) {
  const manifestPath = path.join(
    root,
    "src/util/workspace/playground-versions.json",
  );
  const list = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, "utf8"))
    : [];
  if (!list.includes(v)) list.push(v);
  return list.sort((a, b) => {
    const pa = a.split(".").map(Number);
    const pb = b.split(".").map(Number);
    return pa[0] - pb[0] || pa[1] - pb[1] || pa[2] - pb[2];
  });
}

function writeManifests(list) {
  const json = JSON.stringify(list, null, 2) + "\n";
  fs.writeFileSync(
    path.join(root, "src/util/workspace/playground-versions.json"),
    json,
  );
  fs.mkdirSync(path.join(root, "public/playground/versions"), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(root, "public/playground/versions/versions.json"),
    json,
  );
}
