export type HeadingList = {
  id: string;
  title: string;
  children: HeadingList;
}[];

declare global {
  interface ReadableStream<R = any> {
      [Symbol.asyncIterator](): AsyncIterableIterator<R>;
  }
}
