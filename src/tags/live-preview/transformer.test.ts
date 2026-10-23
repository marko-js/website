import path from "node:path";
import { fileURLToPath } from "node:url";
import * as compiler from "@marko/compiler";
import * as translator from "marko/translator";
import { expect, test } from "vitest";

const dir = path.dirname(fileURLToPath(import.meta.url));
const filename = path.join(dir, "page.marko");
const compile = (source: string) =>
  compiler.compileSync(source, filename, {
    translator,
    output: "html",
    sourceMaps: false,
  });

test("pre-compiles a directory of files", () => {
  const { code, meta } = compile('<live-preview dir="./examples/hello"/>');
  expect(code).toContain("Hello world");
  expect(code).toContain("index.marko");
  expect(code).not.toContain("examples/hello");
  expect(meta.watchFiles).toContain(
    path.join(dir, "examples/hello/index.marko"),
  );
});

test("pre-compiles literal files", () => {
  const { code } = compile(
    `<live-preview files=[{ path: "index.marko", content: "<p>Inline</p>" }]/>`,
  );
  expect(code).toContain("<p>Inline</p>");
});

test("leaves dynamic input to the browser", () => {
  const { code } = compile("<live-preview files=input.files/>");
  expect(code).toContain("files: input.files");
});

test("reports a missing directory", () => {
  expect(() => compile('<live-preview dir="./nope"/>')).toThrow(
    /Could not read directory/,
  );
});
