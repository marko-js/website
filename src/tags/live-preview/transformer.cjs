// Marko compile-time hook for <live-preview>. When the example is known at
// build time (`dir` or a literal `files`), it is compiled, rendered and
// highlighted here, and the results are handed to the tag as `precompiled`.
// Nothing about the example is then compiled in the browser until it is edited.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");

const cli = path.join(__dirname, "core", "cli.ts");
const cache = new Map();

module.exports = function transform(tag, t) {
  const attrs = tag.get("attributes");
  const find = (name) =>
    attrs.find(
      (attr) => attr.node.type === "MarkoAttribute" && attr.node.name === name,
    );
  const dirAttr = find("dir");
  const filesAttr = find("files");
  if (!dirAttr && !filesAttr) return;
  if (dirAttr && filesAttr) {
    throw tag.buildCodeFrameError(
      "<live-preview> takes `dir` or `files`, not both.",
    );
  }

  const source = dirAttr || filesAttr;
  const evaluated = source.get("value").evaluate();
  if (!evaluated.confident) return; // dynamic input is compiled in the browser

  const file = tag.hub.file;
  let files;
  if (dirAttr) {
    if (typeof evaluated.value !== "string") {
      throw dirAttr.buildCodeFrameError("`dir` must be a string.");
    }
    const root = path.resolve(
      path.dirname(file.opts.filename),
      evaluated.value,
    );
    files = readDir(root, tag, dirAttr);
    const { watchFiles } = file.metadata.marko;
    for (const { path: rel } of files) watchFiles.push(path.join(root, rel));
  } else {
    files = evaluated.value;
    if (
      !Array.isArray(files) ||
      !files.every(
        (f) => f && typeof f.path === "string" && typeof f.content === "string",
      )
    ) {
      throw filesAttr.buildCodeFrameError(
        "`files` must be an array of { path, content }.",
      );
    }
  }

  const options = {};
  for (const name of ["csr"]) {
    const attr = find(name);
    if (attr) {
      const value = attr.get("value").evaluate();
      if (!value.confident) return;
      options[name] = !!value.value;
    }
  }

  let precompiled;
  try {
    precompiled = build({ files, ...options });
  } catch (err) {
    throw source.buildCodeFrameError(
      `Could not pre-compile example: ${err.message}`,
    );
  }

  tag.node.attributes = tag.node.attributes
    .filter((attr) => attr !== source.node)
    .concat(
      t.markoAttribute("precompiled", t.valueToNode({ files, ...precompiled })),
    );
};

function build(input) {
  const json = JSON.stringify(input);
  const key = crypto.createHash("sha1").update(json).digest("hex");
  let result = cache.get(key);
  if (!result) {
    // The build is async (rollup, wasm) and transformers are not, so it runs
    // in a child process that is waited on.
    const stdout = execFileSync(process.execPath, [cli], {
      input: json,
      maxBuffer: 256 * 1024 * 1024,
      stdio: ["pipe", "pipe", "pipe"],
    });
    cache.set(key, (result = JSON.parse(stdout.toString())));
  }
  return result;
}

function readDir(root, tag, attr) {
  let entries;
  try {
    entries = fs.readdirSync(root, { recursive: true, withFileTypes: true });
  } catch {
    throw attr.buildCodeFrameError(`Could not read directory "${root}".`);
  }
  const files = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const abs = path.join(entry.parentPath, entry.name);
    const rel = path.relative(root, abs).split(path.sep).join("/");
    if (
      rel
        .split("/")
        .some((part) => part.startsWith(".") || part === "node_modules")
    )
      continue;
    files.push({ path: rel, content: fs.readFileSync(abs, "utf8") });
  }
  if (!files.length)
    throw attr.buildCodeFrameError(`No files found in "${root}".`);
  // The entry first, then the rest alphabetically, so tabs are stable.
  return files.sort(
    (a, b) => rank(a.path) - rank(b.path) || (a.path < b.path ? -1 : 1),
  );
}

function rank(file) {
  return file === "index.marko" ? 0 : 1;
}
