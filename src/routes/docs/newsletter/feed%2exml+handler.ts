import fs from "node:fs";
import path from "node:path";

const newsletterDir = path.join(process.cwd(), "docs", "newsletter");

// The production domain is defined once, by the `--cname` flag in the
// `deploy` script, so read it from there to keep the feed in lockstep with
// wherever the site is actually published. Falls back for local dev/preview.
const pkg = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8"),
);
const site = `https://${
  pkg.scripts?.deploy?.match(/--cname (\S+)/)?.[1] ?? "markojs.com"
}`;

function escapeXml(value: string) {
  return value.replace(
    /[<>&'"]/g,
    (char) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[char]!,
  );
}

// Reduce the inline markdown found in TLDR bullets (code spans and links) to
// plain text so feed readers don't show literal backticks and `[text](url)`.
function stripMarkdown(value: string) {
  return value.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/`/g, "");
}

export const GET = (() => {
  const items = fs
    .readdirSync(newsletterDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const slug = file.slice(0, -".md".length);
      const content = fs.readFileSync(path.join(newsletterDir, file), "utf-8");
      return {
        slug,
        // Filenames are `month-year`; Date already parses the English month
        // name, so no lookup table is needed.
        date: new Date(`${slug.replace("-", " ")} 1 UTC`),
        title: (content.match(/^#\s+(.+)$/m)?.[1] ?? slug).trim(),
        summary: stripMarkdown(
          content
            .split("\n")
            .filter((line) => line.startsWith("> - "))
            .map((line) => line.slice("> - ".length).trim())
            .join(" "),
        ),
      };
    })
    .filter((item) => !Number.isNaN(+item.date))
    .sort((a, b) => +b.date - +a.date);

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>Marko Newsletter</title>
<link>${site}</link>
<description>Monthly updates from the Marko team.</description>
<atom:link href="${site}/docs/newsletter/feed.xml" rel="self" type="application/rss+xml"/>
${items
  .map(({ slug, date, title, summary }) => {
    const url = `${site}/docs/newsletter/${slug}`;
    return `<item>
<title>${escapeXml(title)}</title>
<link>${url}</link>
<guid>${url}</guid>
<pubDate>${date.toUTCString()}</pubDate>${
      summary ? `\n<description>${escapeXml(summary)}</description>` : ""
    }
</item>`;
  })
  .join("\n")}
</channel>
</rss>
`;

  return new Response(feed, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}) satisfies MarkoRun.Handler;
