# Marko in March 2026

> [!TLDR]
>
> - Bound attribute modifiers like `value:Number:=quantity`
> - "Did you mean" suggestions for unknown tags
> - Full Rolldown support and initial Vite 8 compatibility
> - Better support for apps embedded inside another app

March added a shorthand for the most common two-way binding chore, closed a nearly decade-old request for friendlier tag errors, and moved the Vite integration onto Rolldown. Around those were steady gains in output size, concise-mode whitespace handling, and Class-to-Tags interop.

## Bound Attributes

Two-way bindings often need to normalize a value before storing it. A modifier placed on a bound attribute now does this inline: the identifier after the attribute name processes every value passed to the implicit change handler.

```marko
<let/quantity=1>
<input type="number" value:Number:=quantity>
<p>Subtotal: ${(quantity * 4.99).toFixed(2)}</p>
```

Here `value:Number:=quantity` binds the input and coerces each change through `Number` before assigning it, replacing a longhand change handler that would otherwise be written out by hand. This is especially convenient when binding to a member expression, where the equivalent handler is verbose. The modifier must be an identifier, so more involved normalization can point at a local `static function` of the same name.

Editor support shipped alongside the runtime, so the shorthand formats and type-checks correctly ([marko#3130](https://github.com/marko-js/marko/pull/3130), [language-server#468](https://github.com/marko-js/language-server/pull/468)). A related fix made bound attributes with an `as` cast parse correctly instead of erroring ([language-server#465](https://github.com/marko-js/language-server/pull/465), [marko#3110](https://github.com/marko-js/marko/pull/3110)).

## Clearer Errors

Continuing the recent push to catch mistakes earlier, the compiler now suggests a correction when it meets an unknown tag. A misspelled or unrecognized component name is met with the closest known tag as a suggestion rather than a bare failure, closing a request that had been open for nearly ten years ([marko#3114](https://github.com/marko-js/marko/pull/3114)). Invalid attribute names and malformed bind refinement shorthands now produce messages as well, so more authoring mistakes surface at compile time ([marko#3133](https://github.com/marko-js/marko/pull/3133)).

## Rolldown

The Vite integration gained full Rolldown support, replacing the previous esbuild-based plugin with a dedicated Rolldown plugin ([vite#251](https://github.com/marko-js/vite/pull/251)). Vite 8 is now accepted as a peer dependency, with the remaining esbuild interop to be removed as the plugin settles onto Rolldown ([vite#246](https://github.com/marko-js/vite/pull/246)). Dev-mode dependency scanning was reworked to pre-scan entry templates with htmljs-parser, resolve their tags through the taglib, and register the results in a single pass rather than several ([vite#253](https://github.com/marko-js/vite/pull/253)).

## Embedded Apps

Embedding a Marko app inside another page, such as a widget mounted into an existing document, works more smoothly. When a template is detected not to render `html`, `head`, or `body`, Marko now generates a unique `$global.renderId` automatically, and it cleans up scopes when the embedded DOM is removed ([marko#3124](https://github.com/marko-js/marko/pull/3124)).

## Improvements

Beyond the headlines, improvements trimmed server output and expanded type coverage.

### Performance

Server output got smaller. Duplicate section serialization guards are now emitted once instead of repeatedly ([marko#3141](https://github.com/marko-js/marko/pull/3141)). The list reconciliation code was rewritten with its logic inlined for a smaller bundle and additional fast paths for the common case where no items move between renders ([marko#3112](https://github.com/marko-js/marko/pull/3112)).

### Type Definitions

Native attribute typings expanded, adding `webkitdirectory` on `<input>`, `media` on `<meta>`, and refined `<button>` attributes ([marko#3121](https://github.com/marko-js/marko/pull/3121), [marko#3137](https://github.com/marko-js/marko/pull/3137), [marko#3138](https://github.com/marko-js/marko/pull/3138)).

### Marko Run

Marko Run's file-based routing gained an interactive REPL at [marko.run/repl](https://marko.run/repl) that visualizes how a set of route files maps to matched routes ([marko.run#1](https://github.com/marko-js/marko.run/pull/1)).

## Fixes

Correctness work concentrated on concise-mode whitespace and the Class API interop layer.

### Concise Syntax

Several concise-mode whitespace regressions were corrected. Newlines between nodes inside a concise HTML block are preserved again rather than collapsed, and trailing whitespace in those blocks is handled correctly ([htmljs-parser#216](https://github.com/marko-js/htmljs-parser/pull/216), [htmljs-parser#218](https://github.com/marko-js/htmljs-parser/pull/218)). The Tags API `<style>` translation was updated for the parser's revised text nodes, and the compiler no longer inserts a stray space between adjacent text and placeholders in a tag body ([marko#3108](https://github.com/marko-js/marko/pull/3108), [marko#3129](https://github.com/marko-js/marko/pull/3129)).

### Interop

Mixing the Class API and Tags API grew more reliable when legacy renderer APIs are involved, with dynamic tags routing correctly through the compatibility layer ([marko#3145](https://github.com/marko-js/marko/pull/3145)). A production-mode ordering bug in return-tag analysis was fixed, so intersecting state resolves in the correct order ([marko#3135](https://github.com/marko-js/marko/pull/3135)). The `@marko/express` middleware was updated for Marko 6 ([express#12](https://github.com/marko-js/express/pull/12)).

### In Brief

- Rendering no longer throws an uninitialized error when `input` is absent ([marko#3125](https://github.com/marko-js/marko/pull/3125)).
- The compiler avoids loading Babel configuration when Babel is not installed ([marko#3118](https://github.com/marko-js/marko/pull/3118), [marko#3119](https://github.com/marko-js/marko/pull/3119)).

Full details for every change are in the release notes of each package on [GitHub](https://github.com/marko-js).

## Further Reading

- [February 2026](february-2026.md)
- [April 2026](april-2026.md)
