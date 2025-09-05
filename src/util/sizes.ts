import { streamToIterable } from "./stream-to-iterable";

export interface Sizes {
  size: number;
  gzip: number;
}
export async function toByteSizes(
  data: string | ReadableStream<Uint8Array>,
): Promise<Sizes> {
  if (typeof data === "string") {
    const blob = new Blob([data]);
    const size = blob.size;
    return {
      size,
      gzip: size ? await streamToGzipByteLength(blob.stream()) : 0,
    };
  }

  const [a, b] = data.tee();
  const pSize = streamToByteLength(a);
  const pGzip = streamToGzipByteLength(b);
  const size = await pSize;
  return {
    size,
    gzip: size ? await pGzip : 0,
  };
}

function streamToGzipByteLength(data: ReadableStream<Uint8Array>) {
  return streamToByteLength(data.pipeThrough(new CompressionStream("gzip")));
}

async function streamToByteLength(data: ReadableStream<Uint8Array>) {
  let size = 0;
  for await (const chunk of streamToIterable(data)) {
    size += chunk.byteLength;
  }

  return size;
}

export function bytesToUnits(size: number) {
  let value = size;
  let unit = "B";

  if (size >= 1048576) {
    value = size / 1048576;
    unit = "MB";
  } else if (size >= 1024) {
    value = size / 1024;
    unit = "KB";
  }

  return {
    value: (value < 10
      ? Math.round(value * 100) / 100
      : value < 100
        ? Math.round(value * 10) / 10
        : Math.round(value)
    ).toString(),
    unit,
  };
}
