import { expect, test } from "vitest";

import { attachErrorFile, normalizeErrors, parseError } from "./compile-error";

/** Shaped like the `CompileError` the Marko compiler raises. */
function compileError(
  label: string,
  loc: {
    start: { line: number; column: number };
    end?: { line: number; column: number };
  },
  message = "",
) {
  return Object.assign(new Error(message), {
    name: "CompileError",
    label,
    loc,
  });
}

const FILE = "/index.marko";

test("reads position and message off the error rather than its frame text", () => {
  const files = { [FILE]: "<div>\n<span>\n" };
  const err = attachErrorFile(
    compileError('Missing ending "span" tag', {
      start: { line: 2, column: 0 },
      end: { line: 2, column: 6 },
    }),
    FILE,
  );

  const [parsed] = normalizeErrors([err], files);
  expect(parsed.message).toBe('Missing ending "span" tag');
  expect(parsed.frame?.file).toBe("index.marko");
  expect(parsed.frame?.line).toBe(2);
  expect(parsed.frame?.col).toBe(1);

  const errorRow = parsed.frame?.rows.find((row) => row.isError);
  expect(errorRow?.code).toBe("<span>");
  expect(errorRow?.marker).toEqual({ start: 0, width: 6 });
});

test("keeps the diagnostic when the source is indented with tabs", () => {
  // The frame text Babel emits preserves tabs in the caret row, which the
  // string parser could not match -- message and caret were both dropped.
  const files = { [FILE]: "\t\t<log/>\n" };
  const err = attachErrorFile(
    compileError("Line has extra indentation at the beginning", {
      start: { line: 1, column: 2 },
      end: { line: 1, column: 2 },
    }),
    FILE,
  );

  const [parsed] = normalizeErrors([err], files);
  expect(parsed.message).toBe("Line has extra indentation at the beginning");

  const errorRow = parsed.frame?.rows.find((row) => row.isError);
  // Tabs are expanded, so the caret offset indexes the same grid as the code.
  expect(errorRow?.code).toBe("    <log/>");
  expect(errorRow?.marker?.start).toBe(4);
  expect(errorRow?.code[errorRow.marker!.start]).toBe("<");
});

test("gives each error in an aggregate its own entry", () => {
  const files = { [FILE]: "<input content=x>\n<textarea content=y/>\n" };
  const aggregate = Object.assign(new Error(""), {
    name: "CompileErrors",
    errors: [
      compileError("input cannot have content", {
        start: { line: 1, column: 7 },
      }),
      compileError("textarea takes content from its body", {
        start: { line: 2, column: 10 },
      }),
    ],
  });
  attachErrorFile(aggregate, FILE);

  const parsed = normalizeErrors([aggregate], files);
  expect(parsed).toHaveLength(2);
  expect(parsed.map((p) => p.frame?.line)).toEqual([1, 2]);
});

test("normalizes a Rollup-shaped error, which reports a flat position", () => {
  const file = "/util.js";
  const files = { [file]: "const a = 1;\nexport default a(\n" };
  const err = Object.assign(new Error("Unexpected token"), {
    name: "SyntaxError",
    id: file,
    loc: { line: 2, column: 17 },
  });

  const [parsed] = normalizeErrors([err], files);
  expect(parsed.message).toBe("Unexpected token");
  expect(parsed.frame?.file).toBe("util.js");
  expect(parsed.frame?.line).toBe(2);
});

test("falls back to the frame text when there is no usable metadata", () => {
  const raw = [
    "",
    "    at index.marko:1:2",
    "    > 1 | <log/>",
    "        |  ^^^ The [`<log>` tag](https://markojs.com/docs/x) requires a value",
    "      2 |",
  ].join("\n");
  const parsed = parseError(
    Object.assign(new Error(raw), { name: "CompileError" }),
  );

  expect(parsed.frame?.file).toBe("index.marko");
  expect(parsed.message).toMatch(/requires a value$/);
});

test("does not invent a frame for an error with no position", () => {
  const parsed = parseError(new TypeError("x is not a function"));
  expect(parsed.frame).toBeUndefined();
  expect(parsed.message).toBe("x is not a function");
});
