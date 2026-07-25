# Suspected Bugs

Out-of-scope defects noticed while working on something else. Format and rules: [README.md](README.md).

## `<let-debounce>` return value never flows when client-rendered without server markup

`src/tags/let/let-debounce.marko` › `Input` | 2026-07-24 | impact:med | effort:med

When `<let-debounce>` is used inside a component tree that is rendered entirely in the browser (mounted via a dynamic tag after a lazy `import()`, with no server-rendered markup to hydrate), its `<return>` value is never assigned: the compiled parent output wires `$value`/`$delay` setters but the tag's returned binding never fires, so downstream `const`/`if`/`script` sections depending on it never run. The same usage works on `/playground` where the tree is server-rendered and hydrated (`src/routes/playground/tags/playground/tags/result/result.marko`). This looks like a `@marko/compiler`/runtime issue with `<return>` in client-only render paths and may be worth reducing and reporting upstream. Re-verify by rendering any lazily-imported component containing `let-debounce/files=input.files` followed by `script -- console.log(files)`; the log never fires (workaround in `src/tags/app-playground/tags/embed-result.marko` uses a manual `setTimeout` debounce instead).
