---
type: dx
impact: med
effort: med
site: src/util/workspace.ts › onRuntimeError
---

# Map playground runtime errors back to the user's source

When an `ErrorEvent` carries no `error`, the handler synthesizes an `Error` whose message appends `ev.filename`, `ev.lineno`, and `ev.colno`. Those coordinates point into the generated bundle, so the playground reports a location such as `server.js:1,38842`, which is real but names no file the user can open. Build errors avoid this because marko's `CompileError` frame already names the authored file, and the error output renders that frame. The workspace keeps sourcemaps for both the preview modules and the compiled templates, so the position could be mapped back to the authored file and line before the error is stored, letting runtime errors render the same code frame as build errors.

Check: in the playground, enter a template that throws on render, such as calling a string method on a number, and read the location shown in the runtime error card.
