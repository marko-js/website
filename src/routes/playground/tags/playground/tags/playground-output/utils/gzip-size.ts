export async function toGzipSize(
  data: string | ReadableStream<Uint8Array<ArrayBufferLike>>,
) {
  const stream = typeof data === "string" ? new Blob([data]).stream() : data;
  let gzipLength = 0;
  for await (const chunk of stream.pipeThrough(
    new CompressionStream("gzip"),
  ) as any) {
    gzipLength += chunk.byteLength;
  }

  return gzipLength;
}
