// Browser stand-in for the bits of Node's `url` module the language server uses.
// `URL`/`URLSearchParams` are globals in workers; only the `file:` helpers need
// filling in.
export function fileURLToPath(url: string | URL): string {
  const href = typeof url === "string" ? url : url.href;
  return decodeURIComponent(new URL(href).pathname);
}

export function pathToFileURL(path: string): URL {
  return new URL(
    "file://" + (path.startsWith("/") ? path : "/" + path).replace(/\\/g, "/"),
  );
}

// Re-expose the global constructors as named exports (they are not module
// bindings, so `export { URL }` directly is a syntax error).
const _URL = globalThis.URL;
const _URLSearchParams = globalThis.URLSearchParams;
export { _URL as URL, _URLSearchParams as URLSearchParams };

export default {
  fileURLToPath,
  pathToFileURL,
  URL: _URL,
  URLSearchParams: _URLSearchParams,
};
