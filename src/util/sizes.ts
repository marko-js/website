export interface Sizes {
  size: number;
  gzip: number;
}
export async function toByteSizes(
  data: string | ReadableStream<Uint8Array>,
): Promise<Sizes> {
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

export function bytesToUnits(size: number) {
  const kb = size / 1024;
  if (kb < 10) {
    return { value: size.toString(), unit: "b" };
  }

  if (kb < 100) {
    return {
      value: Number.isInteger(kb) ? kb.toString() : kb.toFixed(1),
      unit: "kb",
    };
  }

  const mb = kb / 1024;
  if (mb < 10) {
    return { value: Math.round(kb).toString(), unit: "kb" };
  }

  return {
    value: Number.isInteger(mb) ? mb.toString() : mb.toFixed(2),
    unit: "mb",
  };
}
