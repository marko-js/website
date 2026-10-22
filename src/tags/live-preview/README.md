# live-preview

An embeddable code example: tabbed, highlighted source next to a live preview.
Static examples are compiled, rendered and highlighted when the page is
compiled, so a page that uses one ships no compiler, editor or highlighter.

```marko
<live-preview dir="./examples/counter"/>

<live-preview files=[{ path: "index.marko", content: "<h1>Hello</h1>" }]/>
```

## Input

| Attribute  | Description                                                                                                       |
| ---------- | ----------------------------------------------------------------------------------------------------------------- |
| `dir`      | Directory of example files, relative to the template using the tag. `index.marko` is the entry and the first tab. |
| `files`    | `{ path, content }[]`, the same shape the playground uses.                                                        |
| `editable` | Defaults to `true`. `false` renders a read-only example and never loads the editor or compiler.                   |
| `csr`      | Mount the example in the browser instead of rendering it on the server first.                                     |
| `height`   | CSS length for the preview and the editor, `20rem` by default.                                                    |

`dir` and a literal `files` are static: they are pre-compiled at build time.
Any other `files` value is compiled in the browser once the editor loads.

## How it loads

1. **Build time.** `transformer.cjs` (registered in `marko-tag.json`) is a Marko
   compiler transform. It reads the files, renders them with `core/cli.ts` in a
   child process (the build is async, transforms are not), highlights the
   source, and gives the tag the result as `precompiled`. Files read from `dir`
   are registered as watch files.
2. **Page load.** The output is CSS-only tabs, highlighted source and an
   iframe whose `srcdoc` holds the rendered HTML. Client JS is included in the
   iframe only when the example itself is interactive.
3. **Focus.** Focusing a source pane dynamically imports `core/attach.ts`,
   which pulls in CodeMirror and the highlighter. Until then each source is a
   `contenteditable` element that matches CodeMirror's metrics (font, line
   height, line numbers), so edits made early are kept and the swap keeps
   text, caret, scroll position and focus. The compiler, bundler and formatter
   (`core/workspace.ts`) load at the same time, and the first edit rebuilds
   the preview, debounced.

An example whose input is not static has nothing pre-compiled to show, so it
loads and builds as soon as the page does.

## Layout

- `core/` has no DOM or app dependencies: `build.ts` bundles an example,
  `node.ts` and `cli.ts` run it without a browser, `workspace.ts` runs it in a
  page (iframe, worker, logs, errors), `attach.ts` upgrades the markup.
- `live-preview.marko` and `live-preview.style.css` are the tag.

## Using it elsewhere

Copy this directory into a project's tags directory. It needs `marko`,
`@marko/compiler`, `@rollup/browser`, `lightningcss-wasm`, `terser`,
`resolve-sync`, `lasso-package-root`, `writable-dom`, `semver`, `shiki`, `@shikijs/langs`, `prettier` with
`prettier-plugin-marko`, and the CodeMirror packages `@codemirror/view`,
`state`, `commands`, `search`, `autocomplete` and `language`. Node 22.18 or
later runs `core/cli.ts` directly (type stripping), and Vite's
`import.meta.glob` finds the Marko runtime in `/node_modules/marko`
(`core/runtime-files.ts`); adjust that path for other layouts.

The in-browser compiler (the part that loads on focus) still relies on the
site's `vite.config.ts`: the `node:path` and `prettier` aliases, the
`process.browser`/`process.env.*` and `global` defines for the client
environment, `optimizeDeps.exclude` for `@rollup/browser` and
`lightningcss-wasm`, and `build.rollupOptions.external: ["browserslist"]`.
Static, read-only examples (`editable=false`) need none of it.
