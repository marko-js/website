// Browser stand-in for Node's `module` API. `@marko/language-tools` calls
// `createRequire(...).resolve(...)` to locate a project's own `@marko/compiler`
// install; in the browser there is no such install, so resolution throws and the
// tools fall back to the compiler injected via `Project.setDefaultCompilerMeta`
// (see `../project-defaults`).
export function createRequire(_from: string | URL) {
  const require = (id: string) => {
    throw new Error(`Cannot require "${id}" in the browser.`);
  };
  require.resolve = (id: string): string => {
    throw new Error(`Cannot resolve "${id}" in the browser.`);
  };
  return require as unknown as NodeJS.Require;
}

export default { createRequire };
