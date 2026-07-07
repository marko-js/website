export type HeadingList = {
  id: string;
  title: string;
  children: HeadingList;
}[];

declare global {
  namespace Marko {
    interface Global {
      meta: {
        pageTitle?: string;
        hideFooter?: boolean;
        headings?: HeadingList;
        ogImage?: string;
      };
    }
  }

  interface ReadableStream<R = any> {
    [Symbol.asyncIterator](): AsyncIterableIterator<R>;
  }
}
