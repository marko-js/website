import { expect, test } from "vitest";
import { buildStatic } from "./node.ts";

test("renders a static example without a browser", async () => {
  const { html, js } = await buildStatic([
    { path: "index.marko", content: "<h1>Hello ${'world'}</h1>" },
  ]);
  expect(html).toContain("<h1>Hello world</h1>");
  expect(js).toBe("");
});

test("emits client js for an interactive example", async () => {
  const { html, js } = await buildStatic([
    {
      path: "index.marko",
      content: "<let/count=0>\n<button onClick() { count++ }>${count}</button>",
    },
  ]);
  expect(html).toContain("<button");
  expect(js.length).toBeGreaterThan(0);
});

test("collects component styles", async () => {
  const { css } = await buildStatic([
    {
      path: "index.marko",
      content: "<h1>hi</h1>\n<style>\n  h1 { color: red }\n</style>",
    },
  ]);
  expect(css).toContain("red");
});

test("highlights the source with classes instead of inline styles", async () => {
  const { sources, sourceCSS } = await buildStatic([
    { path: "index.marko", content: "<h1>hi</h1>" },
  ]);
  expect(sources[0].html).toMatch(/class="[^"]*lp-/);
  expect(sources[0].html).not.toContain("style=");
  expect(sourceCSS).toMatch(/\.lp-\w+\{/);
});
