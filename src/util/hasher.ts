import lzString from "lz-string";
import { streamToIterable } from "./stream-to-iterable";
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
    result += String.fromCharCode(...chunk);
  }

  return btoa(result)
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export async function decompress(value: string) {
  if (!value) return "null";
  const decoded = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
  if (decoded.startsWith(NEW_COMPRESSION_PREFIX)) {
    const compressed = decoded.slice(NEW_COMPRESSION_PREFIX.length);

    const stream = new DecompressionStream("gzip");
    const writer = stream.writable.getWriter();
    const bytes = new Uint8Array(compressed.length);
    for (let i = compressed.length; i--; ) {
      bytes[i] = compressed.charCodeAt(i);
    }
    writer.write(bytes);
    writer.close();

    let result = "";
    for await (const chunk of streamToIterable(stream.readable)) {
      result += decoder.decode(chunk);
    }

    return result;
  } else {
    return lzString.decompressFromEncodedURIComponent(value);
  }
}
