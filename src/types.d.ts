/// <reference types="vite/client" />

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "@marko/run" {
  interface Context {
    meta: { pageTitle: string };
  }
}

export {};
