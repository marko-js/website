import fs from "node:fs";
import path from "node:path";

const site = "https://markojs.com";
const newsletterDir = path.join(process.cwd(), "docs", "newsletter");
const months = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

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

const items = fs
  .readdirSync(newsletterDir)
  .filter((file) => file.endsWith(".md"))
  .map((file) => {
    const slug = file.slice(0, -".md".length);
    const [month, year] = slug.split("-");
    const content = fs.readFileSync(path.join(newsletterDir, file), "utf-8");
    return {
      slug,
      date: new Date(Date.UTC(Number(year), months.indexOf(month), 1)),
      title: (content.match(/^#\s+(.+)$/m)?.[1] ?? slug).trim(),
      summary: content
        .split("\n")
        .filter((line) => line.startsWith("> - "))
        .map((line) => line.slice("> - ".length).trim())
        .join(" "),
    };
  })
  .sort((a, b) => b.date.getTime() - a.date.getTime());

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>Marko Newsletter</title>
<link>${site}/docs/newsletter/${items[0]?.slug ?? ""}</link>
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

export const GET = (() => {
  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml",
    },
  });
}) satisfies MarkoRun.Handler;
