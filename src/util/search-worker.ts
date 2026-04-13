import flexsearch, { type Index } from "flexsearch";

// ── Types ────────────────────────────────────────────────────────────

export interface SearchBlock {
  href: string;
  breadcrumbs: string[];
  title: string;
  content: string;
  weight: number;
}

export interface SearchHit {
  href: string;
  breadcrumbs: string[];
  category: string;
  title: string;
  snippet?: string;
  score: number;
}

// ── FlexSearch engine ────────────────────────────────────────────────

let index: Index;
const blockMap = new Map<string, SearchBlock>();
function init(blocks: SearchBlock[]) {
  blockMap.clear();
  index = new flexsearch.Index({ tokenize: "forward" });
  for (const block of blocks) {
    blockMap.set(block.href, block);
    index.add(
      block.href,
      `${block.title} ${block.breadcrumbs.join(" ")} ${block.content}`,
    );
  }
}

// ── Scoring helpers ──────────────────────────────────────────────────

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchBoost(
  text: string,
  q: string,
  qEscaped: string,
  [exact, word, substring]: [number, number, number],
): number {
  if (text === q) return exact;
  if (new RegExp(`\\b${qEscaped}\\b`).test(text)) return word;
  if (text.includes(q)) return substring;
  return 0;
}

function contentScore(content: string, q: string): number {
  const firstPos = content.indexOf(q);
  if (firstPos < 0) return 0;

  let score = firstPos < 200 ? 10 : firstPos < 500 ? 5 : 0;

  let count = 0;
  let from = 0;
  while (count < 10) {
    const pos = content.indexOf(q, from);
    if (pos < 0) break;
    count++;
    from = pos + q.length;
  }
  return score + count * 2;
}

// ── Snippet builder ─────────────────────────────────────────────────

function buildSnippet(content: string, query: string): string | undefined {
  const pos = content.toLowerCase().indexOf(query);
  if (pos < 0) return undefined;

  const radius = 60;
  let start = Math.max(0, pos - radius);
  let end = Math.min(content.length, pos + query.length + radius);

  if (start > 0) start = content.lastIndexOf(" ", start) + 1 || start;
  if (end < content.length) end = content.indexOf(" ", end) || end;

  return (
    (start > 0 ? "\u2026" : "") +
    content.slice(start, end) +
    (end < content.length ? "\u2026" : "")
  );
}

// ── Search ───────────────────────────────────────────────────────────

function search(query: string, limit = 25): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const qEscaped = escapeRegex(q);
  const scored: SearchHit[] = [];

  for (const id of index.search(query, { limit: 200 })) {
    const href = String(id);
    const block = blockMap.get(href);
    if (!block) continue;

    scored.push({
      href,
      breadcrumbs: block.breadcrumbs,
      category: block.breadcrumbs[0] || "Other",
      title: block.title,
      snippet: buildSnippet(block.content, q),
      score:
        block.weight +
        matchBoost(block.title.toLowerCase(), q, qEscaped, [50, 30, 15]) +
        matchBoost(
          block.breadcrumbs.join(" ").toLowerCase(),
          q,
          qEscaped,
          [25, 15, 8],
        ) +
        contentScore(block.content.toLowerCase(), q) -
        (href.includes("#") ? 0.5 : 0),
    });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

function lookup(hrefs: string[]): SearchHit[] {
  return hrefs.flatMap((href) => {
    const block = blockMap.get(href);
    return block
      ? [
          {
            href: block.href,
            breadcrumbs: block.breadcrumbs,
            category: block.breadcrumbs[0] || "Other",
            title: block.title,
            score: 0,
          },
        ]
      : [];
  });
}

// ── Worker message handler ───────────────────────────────────────────

self.onmessage = async (e: MessageEvent) => {
  const { type, query, hrefs } = e.data;

  switch (type) {
    case "init": {
      const res = await fetch("/search-index.json");
      const blocks: SearchBlock[] = await res.json();
      init(blocks);
      self.postMessage({ type: "ready" });
      break;
    }

    case "query": {
      const results = search(query);
      self.postMessage({ type: "results", results, query });
      break;
    }

    case "recents": {
      const hits = lookup(hrefs);
      self.postMessage({ type: "results", results: hits, query: "" });
      break;
    }
  }
};
