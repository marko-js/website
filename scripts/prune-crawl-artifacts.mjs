// Deletes 404 pages the static adapter emits at URLs that do not exist.
//
// `@marko/run-adapter-static` discovers pages by crawling, and resolves every
// href it finds against the *origin* rather than the page it found them on
// (`resolvePath(href, origin)` in its `visit`). A relative link is therefore
// stripped of its directory: `./concise-syntax` on `/docs/reference/language`
// becomes `/concise-syntax`. That path 404s, and the crawler writes the 404
// body out as `concise-syntax.html`, which a static host then serves at 200.
//
// The result is dozens of thin, identical, indexable pages sitting beside the
// real docs, all titled "Marko", none carrying `noindex`. Until the adapter
// resolves against the current page, they are pruned here.
//
// A page is one of these when it is byte-for-byte the 404 page apart from the
// URL baked into its resume payload, which every page carries a copy of.

import fs from "node:fs/promises";
import path from "node:path";

const dir = path.resolve("dist/public");
const notFound = path.join(dir, "404.html");

const canonical = await read(notFound);
if (canonical === undefined) {
  console.error("prune: no 404.html to compare against; skipping.");
  process.exit(0);
}

const pages = await htmlFiles(dir);
const bogus = [];
for (const file of pages) {
  if (file === notFound) continue;
  if (normalize(await read(file)) === normalize(canonical)) bogus.push(file);
}

// The crawler always finds the real pages through the nav, so a run that wants
// to delete everything means the comparison, not the site, is wrong.
if (bogus.length === pages.length - 1) {
  console.error("prune: every page matched the 404; refusing to delete.");
  process.exit(1);
}

await Promise.all(bogus.map((file) => fs.rm(file)));
await pruneEmptyDirs(dir);

console.log(
  bogus.length
    ? `prune: removed ${bogus.length} crawler-emitted 404 page(s); ${pages.length - bogus.length} real page(s) remain.`
    : "prune: no crawler-emitted 404 pages found.",
);

/** Every page embeds its own URL, and that is the only legitimate difference. */
function normalize(html) {
  return html.replace(/new URL\("[^"]*"\)/g, 'new URL("")');
}

async function read(file) {
  try {
    return await fs.readFile(file, "utf8");
  } catch {
    return undefined;
  }
}

async function htmlFiles(from) {
  const found = [];
  for (const entry of await fs.readdir(from, { withFileTypes: true })) {
    const full = path.join(from, entry.name);
    if (entry.isDirectory()) found.push(...(await htmlFiles(full)));
    else if (entry.name.endsWith(".html")) found.push(full);
  }
  return found;
}

async function pruneEmptyDirs(from) {
  for (const entry of await fs.readdir(from, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(from, entry.name);
    await pruneEmptyDirs(full);
    if ((await fs.readdir(full)).length === 0) await fs.rmdir(full);
  }
}
