import fs from "node:fs";
import path from "node:path";
import { glob } from "glob";

const docsDir = path.join(process.cwd(), "docs");
const site = `https://${fs
  .readFileSync(path.join(process.cwd(), "public", "CNAME"), "utf-8")
  .trim()}`;

// Pages that are not generated from a markdown file. Kept explicit so a new
// top-level route has to be considered rather than silently left out.
const staticPaths = ["/", "/brand", "/playground"];

export const GET = Run.GET(() => {
  const paths = staticPaths.concat(
    glob
      .sync("**/*.md", { cwd: docsDir, posix: true })
      .map((file) => `/docs/${file.slice(0, -".md".length)}`)
      .sort(),
  );

  // No `lastmod`: the build has no reliable per-page modification date, since a
  // CI checkout stamps every file with the time it was cloned. An invented one
  // is worse than none.
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map((urlPath) => `<url><loc>${escapeUrl(site + urlPath)}</loc></url>`)
  .join("\n")}
</urlset>
`;

  return new Response(sitemap, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
});

function escapeUrl(url: string) {
  return encodeURI(url).replace(/&/g, "&amp;");
}
