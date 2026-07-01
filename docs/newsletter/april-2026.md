# Marko in April 2026

> [!TLDR]
>
> - Safer escaping inside `<script>`, `<style>`, and comment tags
> - Vite 8 support with dev-server hot-reload fixes
> - TSRX, an experiment in writing Marko in a JSX-like TypeScript syntax
> - TypeScript 6 across the language tools

April was a month of hardening. A security-relevant fix tightened how dynamic values are escaped inside script and style tags, the language tools moved to TypeScript 6, and the Vite integration continued onto Rolldown with Vite 8 support and a batch of dev-server fixes, while a new experimental project explored a different way to write Marko.

## Safer Escaping

Dynamic text interpolated into `<script>`, `<style>`, `<html-script>`, and `<html-style>` is now escaped with a case-insensitive search for the closing tag. The search was previously case sensitive, so a value containing an uppercase closing tag such as `</SCRIPT>` could break out of the element ([marko#3159](https://github.com/marko-js/marko/pull/3159)). The `<html-comment>` tag also gained a dedicated escape that neutralizes `>` instead of relying on ordinary XML escaping.

> [!WARNING]
> The contents of `<script>` and `<style>` are executed as code. Never interpolate untrusted input into them, escaping notwithstanding.

## Build Tooling

Marko Run added Vite 8 support ([run#186](https://github.com/marko-js/run/pull/186)), extending the Vite integration's Vite 8 work from the previous month. A batch of dev-server fixes followed: hot reloading now handles a Tags API component whose child template changes how it uses `input`, and Marko virtual files update correctly on change ([vite#260](https://github.com/marko-js/vite/pull/260), [vite#266](https://github.com/marko-js/vite/pull/266)). CommonJS dependency handling in dev SSR was iterated on across several fixes. Separately, package publishing can now target release tags other than `latest`, and Marko Run cleans special characters out of generated Rollup output filenames ([vite#255](https://github.com/marko-js/vite/pull/255), [vite#258](https://github.com/marko-js/vite/pull/258), [run#187](https://github.com/marko-js/run/pull/187)).

## Experiments

A new experimental project, [TSRX](https://tsrx.dev), explores writing Marko components in a JSX-like TypeScript syntax that compiles to Marko. Early work added control-flow expressions, member-expression tag names that map to dynamic tags, and looser rules for default exports ([tsrx](https://github.com/marko-js/tsrx)).

## Improvements

Quieter improvements landed in the language tools and on the documentation site.

### TypeScript

The language tools upgraded to TypeScript 6, so `@marko/type-check`, the language server, and the VS Code extension all build and check against the new release ([language-server#480](https://github.com/marko-js/language-server/pull/480)).

### Performance

The runtime skips serializing the signal index for the first dynamic closure, trimming the serialized output ([marko#3148](https://github.com/marko-js/marko/pull/3148)). In the editor, script parsing is now cacheable and its scope tracking simplified, which reduces repeated work as files are analyzed ([language-server#472](https://github.com/marko-js/language-server/pull/472)).

### Documentation Search

The documentation site replaced Algolia with a self-hosted FlexSearch index and a redesigned search dialog ([website#138](https://github.com/marko-js/website/pull/138)).

## Fixes

A handful of correctness fixes rounded out the month.

### Error Handling

An empty `<@catch>` now absorbs errors as intended. Previously `<@catch></@catch>` behaved as if it were absent, so asynchronous errors escaped the surrounding `<try>` instead of being caught ([marko#3158](https://github.com/marko-js/marko/pull/3158)).

### In Brief

- A production-build regression was corrected: module-scoped `var` declarations that can reference themselves synchronously are no longer hoisted the way `let` and `const` are ([marko#3171](https://github.com/marko-js/marko/pull/3171)).
- Tags API dynamic tags with a mutable tag variable now serialize references to their child scope correctly ([marko#3168](https://github.com/marko-js/marko/pull/3168)).
- Editor typings for attribute tags handle dynamic cases more accurately ([language-server#474](https://github.com/marko-js/language-server/pull/474)).

Full details for every change are in the release notes of each package on [GitHub](https://github.com/marko-js).

## Community

Thanks to [@defunkt-dev](https://github.com/defunkt-dev) for bringing first-class Marko support to [`@formkit/drag-and-drop`](https://github.com/formkit/drag-and-drop) ([drag-and-drop#168](https://github.com/formkit/drag-and-drop/pull/168)); its [sortability docs](https://drag-and-drop.formkit.com/#sortability) now include a Marko example.

## Further Reading

- [March 2026](march-2026.md)
- [May 2026](may-2026.md)
