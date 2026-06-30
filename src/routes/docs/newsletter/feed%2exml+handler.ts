import fs from "node:fs";
import path from "node:path";
import { Marked } from "marked";

const newsletterDir = path.join(process.cwd(), "docs", "newsletter");

// `public/CNAME` is the GitHub Pages custom-domain file: it ships verbatim in
// the build and is what Pages itself reads to serve the site, making it the
// canonical source for the production origin.
const site = `https://${fs
  .readFileSync(path.join(process.cwd(), "public", "CNAME"), "utf-8")
  .trim()}`;

// GitHub-style alert markers, mirroring the labels the site renders for them.
const alertLabels: Record<string, string> = {
  note: "Note",
  tip: "Tip",
  important: "Important",
  warning: "Warning",
  caution: "Caution",
  tldr: "TL;DR",
};

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

// Render a newsletter's markdown body to standalone HTML for <content:encoded>,
// turning the docs-relative links (which drop the `.md` extension on the site)
// into absolute URLs that resolve from inside a feed reader.
function renderContent(markdown: string, articleUrl: string) {
  const withLabels = markdown.replace(
    /^>\s*\[!(\w+)]/gm,
    (_, name) => `> **${alertLabels[name.toLowerCase()] ?? name}**`,
  );
  return new Marked({ gfm: true })
    .use({
      walkTokens(token) {
        if (token.type === "link" || token.type === "image") {
          const href = token.href.replace(/\.md(?=#|$)/, "");
          try {
            token.href = new URL(href, articleUrl).href;
          } catch {
            // Leave anything that isn't a resolvable URL untouched.
          }
        }
      },
    })
    .parse(withLabels) as string;
}

export const GET = (() => {
  const items = fs
    .readdirSync(newsletterDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const slug = file.slice(0, -".md".length);
      const url = `${site}/docs/newsletter/${slug}`;
      const content = fs.readFileSync(path.join(newsletterDir, file), "utf-8");
      return {
        url,
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
        // Drop the leading `# Title` so it isn't repeated inside the content.
        content: renderContent(content.replace(/^#\s+.+$/m, ""), url),
      };
    })
    .filter((item) => !Number.isNaN(+item.date))
    .sort((a, b) => +b.date - +a.date);

  // The channel last changed when the most recent issue was published.
  const lastBuildDate = (items[0]?.date ?? new Date()).toUTCString();

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
<title>Marko Newsletter</title>
<link>${site}</link>
<description>Monthly updates from the Marko team.</description>
<language>en</language>
<lastBuildDate>${lastBuildDate}</lastBuildDate>
<atom:link href="${site}/docs/newsletter/feed.xml" rel="self" type="application/rss+xml"/>
${items
  .map(
    ({ url, date, title, summary, content }) => `<item>
<title>${escapeXml(title)}</title>
<link>${url}</link>
<guid>${url}</guid>
<pubDate>${date.toUTCString()}</pubDate>
<description>${escapeXml(summary)}</description>
<content:encoded><![CDATA[${content.replace(/]]>/g, "]]]]><![CDATA[>")}]]></content:encoded>
</item>`,
  )
  .join("\n")}
</channel>
</rss>
`;

  return new Response(feed, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}) satisfies MarkoRun.Handler;
