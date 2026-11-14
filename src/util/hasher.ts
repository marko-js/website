import lzString from "lz-string";
import { streamToIterable } from "./stream-to-iterable";
import type { File } from "./workspace";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const NEW_COMPRESSION_PREFIX = "v2";

export async function compress(value: string) {
  const stream = new CompressionStream("gzip");
  const writer = stream.writable.getWriter();
  writer.write(encoder.encode(value));
  writer.close();

  let result = NEW_COMPRESSION_PREFIX;
  for await (const chunk of streamToIterable(stream.readable)) {
    for (const byte of chunk) {
      result += String.fromCharCode(byte);
    }
  }

  return btoa(result)
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/**
 * Decodes the files out of a share link's hash, or undefined if it cannot be
 * read -- a link truncated in chat, one mangled in transit, or one holding
 * something other than a file list. Never rejects, so a bad link falls back to
 * the default files rather than leaving the playground blank and silent.
 */
export async function decodeFiles(hash: string): Promise<File[] | undefined> {
  // A compressed hash never holds `=` (base64 padding is stripped), so one
  // that does is the plain form.
  const files = hash.includes("=")
    ? readPlainHash(hash)
    : await readCompressedHash(hash);
  return files && moveTagsToRoot(files);
}

/**
 * Reads `path=content&path=content`, each part percent-encoded, which can be
 * written without tooling. Unlike a query string, `+` stays a plus.
 */
function readPlainHash(hash: string): File[] | undefined {
  const files: File[] = [];
  for (const pair of hash.split("&")) {
    const eq = pair.indexOf("=");
    if (eq < 1) return undefined;
    try {
      files.push({
        path: decodeURIComponent(pair.slice(0, eq)),
        content: decodeURIComponent(pair.slice(eq + 1)),
      });
    } catch {
      // A malformed escape such as a lone `%`.
      return undefined;
    }
  }
  return files;
}

async function readCompressedHash(hash: string): Promise<File[] | undefined> {
  let json: string | null;
  try {
    json = await decompress(hash);
  } catch {
    // `atob` rejects a non-base64 hash, and gzip rejects a truncated one.
    return undefined;
  }
  if (!json) return undefined;

  try {
    const parsed: unknown = JSON.parse(json);
    return isFileList(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Projects keep custom tags in `tags/`, but the playground discovers them at
 * its root. A file whose root path is taken stays where it is.
 */
function moveTagsToRoot(files: File[]): File[] {
  const paths = new Set(files.map((file) => file.path));
  return files.map((file) => {
    if (!file.path.startsWith("tags/")) return file;
    const path = file.path.slice("tags/".length);
    return paths.has(path) ? file : { ...file, path };
  });
}

function isFileList(value: unknown): value is File[] {
  return (
    Array.isArray(value) &&
    value.every(
      (file) =>
        !!file &&
        typeof file === "object" &&
        typeof file.path === "string" &&
        typeof file.content === "string",
    )
  );
}

async function decompress(value: string) {
  if (!value) return "null";
  const decoded = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
  if (decoded.startsWith(NEW_COMPRESSION_PREFIX)) {
    const compressed = decoded.slice(NEW_COMPRESSION_PREFIX.length);

    const stream = new DecompressionStream("gzip");
    const writer = stream.writable.getWriter();
    const bytes = new Uint8Array(compressed.length);
    for (let i = compressed.length; i--;) {
      bytes[i] = compressed.charCodeAt(i);
    }
    // A truncated body errors the stream from both ends. The read below
    // reports it; swallowing the writer's copy keeps it from surfacing as an
    // unhandled rejection.
    void writer.write(bytes).catch(() => {});
    void writer.close().catch(() => {});

    let result = "";
    for await (const chunk of streamToIterable(stream.readable)) {
      result += decoder.decode(chunk);
    }

    return result;
  } else {
    return lzString.decompressFromEncodedURIComponent(value);
  }
}
