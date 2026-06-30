// Injects the deploy base path into root-absolute links in the built HTML.
//
// Vite's `base` already rewrites bundled assets (JS/CSS/images) and JS-internal
// dynamic imports, but it leaves author-written root-absolute URLs (e.g. `/docs`,
// `/fav.png`, `/assets/logo.svg`) untouched. Rather than wrapping every such link in
// the source, this pass prefixes them automatically after the build so contributors
// can keep writing plain root-absolute paths.
//
// Runs only when BASE_URL points to a subdirectory (PR previews); it is a no-op for
// the production deploy where the base is "/". Only `href`/`src`/`srcset` attribute
// values are touched, so hydration markers and inline scripts are left byte-for-byte.

import fs from "node:fs/promises";
import path from "node:path";

const base = (process.env.BASE_URL || "/").replace(/\/$/, "");
const dir = path.resolve("dist/public");

if (!base) {
  // Production deploy (BASE_URL unset or "/"): nothing to rebase.
  process.exit(0);
}

/** Prefix a single root-absolute URL with the base, skipping anything already based. */
function rebaseUrl(url) {
  if (!url.startsWith("/") || url.startsWith("//")) return url; // relative/protocol-relative/external
  if (url === base || url.startsWith(base + "/")) return url; // already based (e.g. Vite assets)
  return base + url;
}

/** A srcset value is a comma-separated list of `url [descriptor]` candidates. */
function rebaseSrcset(value) {
  return value
    .split(",")
    .map((candidate) => {
      const trimmed = candidate.trim();
      const space = trimmed.indexOf(" ");
      return space === -1
        ? rebaseUrl(trimmed)
        : rebaseUrl(trimmed.slice(0, space)) + trimmed.slice(space);
    })
    .join(", ");
}

/**
 * A meta-refresh redirect (`<meta http-equiv="refresh" content="0;url=/path">`)
 * carries its target inside the content attribute. Server redirects (e.g. /docs)
 * are emitted this way by the static adapter, so the url must be based too. The
 * `<digits>;url=/` shape is unique to refresh redirects, so other content
 * attributes (description, viewport, og:*) are left untouched.
 */
function rebaseMetaRefresh(value) {
  return value.replace(
    /^(\s*\d+\s*;\s*url=)(\/(?!\/)\S*)/i,
    (_m, prefix, url) => prefix + rebaseUrl(url),
  );
}

const ATTR = /\b(href|src|srcset|content)=("([^"]*)"|'([^']*)'|([^\s"'`=<>]+))/g;

function rebaseHtml(html) {
  return html.replace(ATTR, (match, name, _raw, dq, sq, unq) => {
    const value = dq ?? sq ?? unq;
    const next =
      name === "srcset"
        ? rebaseSrcset(value)
        : name === "content"
          ? rebaseMetaRefresh(value)
          : rebaseUrl(value);
    if (next === value) return match;
    const quote = dq !== undefined ? '"' : sq !== undefined ? "'" : "";
    return `${name}=${quote}${next}${quote}`;
  });
}

async function* htmlFiles(root) {
  for (const entry of await fs.readdir(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(full);
    else if (entry.name.endsWith(".html")) yield full;
  }
}

let changed = 0;
for await (const file of htmlFiles(dir)) {
  const html = await fs.readFile(file, "utf8");
  const next = rebaseHtml(html);
  if (next !== html) {
    await fs.writeFile(file, next);
    changed++;
  }
}

console.log(`rebase-html: prefixed root-absolute links with "${base}" in ${changed} file(s).`);
