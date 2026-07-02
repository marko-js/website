export type HeadingList = {
  id: string;
  title: string;
  children: HeadingList;
}[];

// Shape of the per-route `+meta.json` fields the shared layouts read off
// `$global.meta`. `@marko/run` types `meta` per-route, so in a layout shared
// across routes it widens to a shape without these fields; the layouts know
// more than the router and cast to this.
export interface PageMeta {
  pageTitle?: string;
  hideFooter?: boolean;
  headings?: HeadingList;
}

declare global {
  interface ReadableStream<R = any> {
    [Symbol.asyncIterator](): AsyncIterableIterator<R>;
  }
}
