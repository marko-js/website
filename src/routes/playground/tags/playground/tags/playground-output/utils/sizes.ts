export async function toSizes(data: string | ReadableStream<Uint8Array>) {
  if (typeof data === "string") {
    const blob = new Blob([data]);
    return {
      size: blob.size,
      gzip: await streamToGzipByteLength(blob.stream()),
    };
  }

  const [a, b] = data.tee();
  const pSize = streamToByteLength(a);
  const pGzip = streamToGzipByteLength(b);
  return {
    size: await pSize,
    gzip: await pGzip,
  };
}

function streamToGzipByteLength(data: ReadableStream<Uint8Array>) {
  return streamToByteLength(data.pipeThrough(new CompressionStream("gzip")));
}

async function streamToByteLength(data: ReadableStream<Uint8Array>) {
  let size = 0;
  for await (const chunk of data) {
    size += chunk.byteLength;
  }

  return size;
}
