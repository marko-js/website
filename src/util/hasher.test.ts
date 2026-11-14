import { expect, test } from "vitest";

import { compress, decodeFiles } from "./hasher";
import type { File } from "./workspace";

const FILES = [
  { path: "index.marko", content: "<div>hello</div>\n" },
  { path: "package.json", content: '{ "name": "playground" }\n' },
];

async function hashFor(value: unknown) {
  return compress(JSON.stringify(value));
}

function plainHashFor(files: File[]) {
  return files
    .map(
      (file) =>
        `${encodeURIComponent(file.path)}=${encodeURIComponent(file.content)}`,
    )
    .join("&");
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

test("reads the plain form", async () => {
  expect(await decodeFiles(plainHashFor(FILES))).toEqual(FILES);
});

test("keeps a plus in the plain form", async () => {
  expect(await decodeFiles("index.marko=<p>${1+1}</p>")).toEqual([
    { path: "index.marko", content: "<p>${1+1}</p>" },
  ]);
});

test("keeps an equals sign inside plain content", async () => {
  expect(await decodeFiles("index.marko=%3Clet%2Fx%3D1%3E")).toEqual([
    { path: "index.marko", content: "<let/x=1>" },
  ]);
});

test("survives a malformed plain form", async () => {
  expect(await decodeFiles("index.marko=100%")).toBe(undefined);
  expect(await decodeFiles("=no-path")).toBe(undefined);
  expect(await decodeFiles("index.marko=a&stray")).toBe(undefined);
});

test("moves tags/ files to the root", async () => {
  const files = [
    { path: "index.marko", content: "<star-rating/>\n" },
    { path: "tags/star-rating.marko", content: "<p>★</p>\n" },
    { path: "tags/vote-tally/index.marko", content: "<p>0</p>\n" },
  ];
  const moved = [
    files[0],
    { path: "star-rating.marko", content: "<p>★</p>\n" },
    { path: "vote-tally/index.marko", content: "<p>0</p>\n" },
  ];
  expect(await decodeFiles(await hashFor(files))).toEqual(moved);
  expect(await decodeFiles(plainHashFor(files))).toEqual(moved);
});

test("leaves a tags/ file whose root path is taken", async () => {
  const files = [
    { path: "star-rating.marko", content: "a\n" },
    { path: "tags/star-rating.marko", content: "b\n" },
  ];
  expect(await decodeFiles(await hashFor(files))).toEqual(files);
});
