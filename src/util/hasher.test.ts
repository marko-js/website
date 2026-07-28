import { expect, test } from "vitest";

import { compress, decodeFiles } from "./hasher";

const FILES = [
  { path: "index.marko", content: "<div>hello</div>\n" },
  { path: "package.json", content: '{ "name": "playground" }\n' },
];

async function hashFor(value: unknown) {
  return compress(JSON.stringify(value));
}

test("round-trips a real share link", async () => {
  expect(await decodeFiles(await hashFor(FILES))).toEqual(FILES);
});

test("survives a hash truncated in transit", async () => {
  const hash = await hashFor(FILES);
  // Chat clients and word wrap clip long links; the gzip body then fails.
  expect(await decodeFiles(hash.slice(0, Math.floor(hash.length / 2)))).toBe(
    undefined,
  );
});

test("survives a hash that is not base64 at all", async () => {
  // `atob` throws rather than returning empty for these.
  expect(await decodeFiles("foo!")).toBe(undefined);
  expect(await decodeFiles("%%%")).toBe(undefined);
});

test("survives base64 that decodes to something else", async () => {
  expect(await decodeFiles("abc")).toBe(undefined);
  expect(await decodeFiles("hello")).toBe(undefined);
  expect(await decodeFiles(btoa("not our payload"))).toBe(undefined);
});

test("rejects a payload that is not a file list", async () => {
  expect(await decodeFiles(await hashFor({ path: "index.marko" }))).toBe(
    undefined,
  );
  expect(await decodeFiles(await hashFor(["index.marko"]))).toBe(undefined);
  expect(await decodeFiles(await hashFor([{ path: "a.marko" }]))).toBe(
    undefined,
  );
  expect(await decodeFiles(await hashFor(42))).toBe(undefined);
});

test("treats an empty hash as nothing shared", async () => {
  expect(await decodeFiles("")).toBe(undefined);
});

test("keeps content with characters that survive base64 poorly", async () => {
  const tricky = [
    { path: "unicode.marko", content: "<p>世界 🎉 — ok</p>\n" },
    { path: "slashes.marko", content: "a/b+c=d\n" },
  ];
  expect(await decodeFiles(await hashFor(tricky))).toEqual(tricky);
});
