import fs from "fs";
import path from "path";
import { expect, test } from "vitest";

import { fitTitle, renderDocsBanner } from "./og-banner";

const docs = path.join(process.cwd(), "docs");
const pages = fs
  .readdirSync(docs, { recursive: true })
  .map(String)
  .filter((file) => file.endsWith(".md"))
  .map((file) => ({
    section: file.includes(path.sep)
      ? file.slice(0, file.indexOf(path.sep))
      : file.replace(".md", ""),
    title: fs
      .readFileSync(path.join(docs, file), "utf8")
      .match(/^# (.+)$/m)![1]
      .replace(/`/g, ""),
  }));

test("wraps every docs title without dropping words", () => {
  for (const { section, title } of pages) {
    const { lines } = fitTitle(title, section);
    expect(lines.join(" ")).toBe(title);
    expect(lines.length).toBeLessThanOrEqual(5);
  }
});

test("sets every newsletter title at the same size", () => {
  const sizes = pages
    .filter(({ section }) => section === "newsletter")
    .map(({ title }) => fitTitle(title, "newsletter").size);
  expect(sizes.length).toBeGreaterThan(1);
  expect(new Set(sizes).size).toBe(1);
});

test("renders a banner for every section and for an unknown one", async () => {
  const sections = new Set([...pages.map(({ section }) => section), "unknown"]);
  for (const section of sections) {
    const png = await renderDocsBanner("Getting Started", section);
    // The IHDR chunk follows the 8 byte signature and the chunk header.
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);
  }
});
