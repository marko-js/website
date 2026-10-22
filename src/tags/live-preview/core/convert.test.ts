import { expect, test } from "vitest";
import { convertMarko } from "./convert.ts";

const ts = `export interface Input {\n  name: string;\n}\n\n<h1>Hello, \${input.name}</h1>`;

test("strips types and rewrites to concise syntax", async () => {
  const out = await convertMarko(ts, "hello.marko", {
    concise: true,
    ts: false,
  });
  expect(out).not.toContain("interface");
  expect(out).toContain("h1");
  expect(out).not.toContain("<h1>");
});

test("keeps types when TypeScript is asked for", async () => {
  const out = await convertMarko(ts, "hello.marko", {
    concise: false,
    ts: true,
  });
  expect(out).toContain("interface Input");
  expect(out).toContain("<h1>");
});

test("rejects source that does not parse", async () => {
  await expect(
    convertMarko("<div", "broken.marko", { concise: false, ts: false }),
  ).rejects.toThrow();
});
