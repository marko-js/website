import fs from "fs/promises";
import path from "path";
import { glob } from "glob";
import GithubSlugger from "github-slugger";
import { marked, type Token, type Tokens } from "marked";
import type { SearchBlock } from "./search-worker";

/**
 * Category metadata: weight (base search score) + display label.
 */
const CATEGORIES: Record<string, { weight: number; label: string }> = {
  reference: { weight: 100, label: "Reference" },
  introduction: { weight: 75, label: "Introduction" },
  explanation: { weight: 50, label: "Explanation" },
  guide: { weight: 50, label: "Guides" },
  tutorial: { weight: 25, label: "Tutorial" },
  "marko-run": { weight: 25, label: "Marko Run" },
};

/**
 * Read all markdown docs, parse with marked.lexer(), split at h2/h3
 * boundaries, extract plaintext, and write `public/search-index.json`.
 */
export async function buildSearchIndex(docsPath: string): Promise<void> {
  const mdFiles = glob.sync("**/*.md", { cwd: docsPath });
  const blocks: SearchBlock[] = [];

  for (const file of mdFiles) {
    const raw = await fs.readFile(path.join(docsPath, file), "utf-8");
    const category = file.split("/")[0];
    const slug = file.replace(/\.md$/, "");
    const href = `/docs/${slug}`;
    const { weight, label: categoryLabel } = CATEGORIES[category] ?? {
      weight: 25,
      label: category,
    };

    const tokens = marked.lexer(raw);

    // Extract page title from the first h1
    const h1 = tokens.find(
      (t): t is Tokens.Heading => t.type === "heading" && t.depth === 1,
    );
    const pageTitle = h1 ? extractText(h1.tokens) : slug.split("/").pop()!;

    // Split tokens into sections at h2/h3 boundaries
    const sections = splitAtHeadings(tokens);

    // GithubSlugger handles deduplication automatically
    const slugger = new GithubSlugger();

    for (const section of sections) {
      const content = section.body.trim();
      // Filter out tiny blocks that add noise without useful content
      if (!content || content.length < 30) continue;

      const breadcrumbs = [categoryLabel, pageTitle];
      const title = section.heading ?? pageTitle;
      if (section.heading) {
        breadcrumbs.push(section.heading);
      }

      const sectionHref = section.heading
        ? `${href}#${slugger.slug(section.heading)}`
        : href;

      blocks.push({ href: sectionHref, breadcrumbs, title, content, weight });
    }
  }

  const outPath = path.join(process.cwd(), "public", "search-index.json");
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(blocks));
}

interface Section {
  /** The h2/h3 heading text (plaintext), or undefined for the intro section. */
  heading: string | undefined;
  /** Plaintext body content below the heading. */
  body: string;
}

/**
 * Split a flat token list into sections at h2/h3 boundaries.
 * The first section (before any h2/h3) is the intro with no heading.
 */
function splitAtHeadings(tokens: Token[]): Section[] {
  const sections: Section[] = [];
  let currentHeading: string | undefined;
  let currentParts: string[] = [];

  for (const token of tokens) {
    if (token.type === "heading" && (token.depth === 2 || token.depth === 3)) {
      // Flush the previous section
      if (currentParts.length > 0 || currentHeading !== undefined) {
        sections.push({
          heading: currentHeading,
          body: currentParts.join(" "),
        });
      }
      currentHeading = extractText((token as Tokens.Heading).tokens);
      currentParts = [];
    } else if (token.type === "heading") {
      // h1 or h4+ headings — just extract their text into the current section
      currentParts.push(extractText((token as Tokens.Heading).tokens));
    } else {
      const text = extractBlockText(token);
      if (text) currentParts.push(text);
    }
  }

  // Flush the last section
  if (currentParts.length > 0 || currentHeading !== undefined) {
    sections.push({
      heading: currentHeading,
      body: currentParts.join(" "),
    });
  }

  return sections;
}

/**
 * Extract plaintext from a block-level token.
 * Skips code blocks entirely (they're not useful for search plaintext).
 */
function extractBlockText(token: Token): string {
  switch (token.type) {
    case "paragraph":
    case "text":
      return extractText((token as Tokens.Paragraph | Tokens.Text).tokens);

    case "blockquote":
      // Block quotes contain nested block tokens (paragraphs, etc.)
      return (token as Tokens.Blockquote).tokens
        .map(extractBlockText)
        .filter(Boolean)
        .join(" ");

    case "list":
      return (token as Tokens.List).items
        .map((item) =>
          item.tokens.map(extractBlockText).filter(Boolean).join(" "),
        )
        .join(" ");

    case "table": {
      const table = token as Tokens.Table;
      const parts: string[] = [];
      // Header cells
      for (const cell of table.header) {
        parts.push(extractText(cell.tokens));
      }
      // Body rows
      for (const row of table.rows) {
        for (const cell of row) {
          parts.push(extractText(cell.tokens));
        }
      }
      return parts.filter(Boolean).join(" ");
    }

    case "code":
      // Skip code blocks — they add noise, not useful search plaintext
      return "";

    case "space":
    case "hr":
      return "";

    case "html":
      // Strip HTML tags, keep any text content
      return (token as Tokens.HTML).text.replace(/<[^>]+>/g, "").trim();

    default:
      // For any other token types, try to extract text if it has tokens
      if ("tokens" in token && Array.isArray(token.tokens)) {
        return (token.tokens as Token[])
          .map(extractBlockText)
          .filter(Boolean)
          .join(" ");
      }
      return "";
  }
}

/**
 * Extract plaintext from an array of inline tokens.
 * For codespan tokens, strips angle brackets so `<lifecycle>` becomes `lifecycle`.
 */
function extractText(tokens: Token[] | undefined): string {
  if (!tokens) return "";

  const parts: string[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case "text":
      case "strong":
      case "em":
      case "del":
        // These may have nested inline tokens
        if ("tokens" in token && Array.isArray(token.tokens)) {
          parts.push(extractText(token.tokens as Token[]));
        } else {
          parts.push((token as Tokens.Text).text);
        }
        break;

      case "codespan":
        parts.push((token as Tokens.Codespan).text);
        break;

      case "link":
        // Use the link's display text, not the URL
        parts.push(extractText((token as Tokens.Link).tokens));
        break;

      case "image":
        // Use alt text if available
        if ((token as Tokens.Image).text) {
          parts.push((token as Tokens.Image).text);
        }
        break;

      case "br":
        parts.push(" ");
        break;

      case "escape":
        parts.push((token as Tokens.Escape).text);
        break;

      default:
        // Fallback: try .text property
        if ("text" in token && typeof token.text === "string") {
          parts.push(token.text);
        }
        break;
    }
  }

  return parts.join("");
}
