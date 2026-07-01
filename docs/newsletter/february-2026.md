# Marko in February 2026

> [!TLDR]
>
> - The Prettier plugin rewritten on the new parser, preserving shorthands and producing idempotent output
> - Controllable attributes unified across `<let>` and native tags, with number support
> - The compiler now vendors Babel internally, making upgrades and browser compilation more robust
> - Smaller serialized output by deduping repeated long strings

February was a foundations month. The work centered on the tools developers run every day, formatting, the parser behind the editor, and the compiler itself, alongside refinements to two-way binding and a batch of resumability and interop fixes. Less of it is visible in template syntax and more of it is felt in how reliably the surrounding tooling behaves.

## Formatting

The [`prettier-plugin-marko`](https://github.com/marko-js/prettier) plugin was rewritten from scratch on the same parser that powers Marko's language tooling, replacing the lower-fidelity compiler AST it read before. Because the new parser preserves more of the original source, shorthand `class` and `id` survive a format pass instead of being normalized away, and several other details that the compiler AST discarded are now retained.

```marko no-format
<div.card#summary>
  <h2.title>${input.heading}</h2>
</div>
```

Every formatting result is now idempotent, so running the formatter twice produces the same output, and a format pass never introduces whitespace changes that would alter the compiled result. Nodes that fail to parse fall back to their existing source text rather than being dropped, and the formatter no longer parses JavaScript twice, so it runs faster. A round of follow-up fixes corrected placeholder escaping, scriptlet printing, the placement of comments before static nodes, and how type parameters and arguments are stripped.

This rewrite builds on new validity APIs in the parser, including helpers for checking expressions and scriptlets and richer information about attribute and statement validity, which the language tooling and formatter share ([htmljs-parser#204](https://github.com/marko-js/htmljs-parser/pull/204), [#209](https://github.com/marko-js/htmljs-parser/pull/209), [#211](https://github.com/marko-js/htmljs-parser/pull/211), [#213](https://github.com/marko-js/htmljs-parser/pull/213)).

## Controllable Attributes

[Controllable attributes](../reference/native-tag.md#change-handlers) behave consistently whether they appear on a [`<let>`](../reference/core-tag.md#controllable-let) or on a native tag. Setting an uncontrolled value with `value=` seeds the initial state without forcing later updates, while the [two-way binding shorthand](../reference/language.md#shorthand-change-handlers-two-way-binding) `value:=` keeps the value and its change handler in sync. An uncontrolled input no longer reacts to writes meant only for a controlled one, and attributes that control element state, such as `open` on `<details>` and `<dialog>`, are set exactly once.

```marko
<let/quantity=1>

<input type="number" value:=quantity>
<output>${quantity}</output>
```

Numeric controllable values are now supported and normalized correctly, so a numeric `value:=` round-trips as a number rather than being coerced to a string ([marko#3098](https://github.com/marko-js/marko/pull/3098), [marko#3096](https://github.com/marko-js/marko/pull/3096)).

## Performance

The HTML serializer now deduplicates long strings. When a serialized value over thirty characters appears more than once, it is written a single time and referenced afterward instead of being repeated, which trims the size of the data sent to the browser for resumption on pages with repeated content ([marko#3105](https://github.com/marko-js/marko/pull/3105)).

## Compiler

The compiler no longer depends on Babel modules directly. Instead it bundles a pre-patched, pre-built copy of Babel. Marko patches some Babel internals, and a change upstream had previously been able to break the compiler. Vendoring Babel decouples those upgrades, so new Babel versions can be adopted during routine dependency updates, and it removes the old patch strategy's sensitivity to load order and to multiple copies of Babel being present ([marko#3073](https://github.com/marko-js/marko/pull/3073), [marko#3071](https://github.com/marko-js/marko/pull/3071), [marko#3075](https://github.com/marko-js/marko/pull/3075)).

The same effort made `browserslist` optional and firmed up the compiler's browser support, so the compiler runs in more environments, including the browser, without extra configuration ([marko#3077](https://github.com/marko-js/marko/pull/3077), [marko#3081](https://github.com/marko-js/marko/pull/3081)).

## Editor Support

Attribute autocomplete grew more helpful. String attributes with common prefixes now suggest those prefixes inline, so completing `href` or `src` offers starting points like `#`, `mailto:`, `https://`, and `/` ([marko#3090](https://github.com/marko-js/marko/pull/3090)).

The language server moved to the latest Marko and picked up a batch of fixes: tag-name syntax highlighting, render errors that map back to the correct tag name, accurate reading of a variable inside its own body, codegen for `const` native tags, and attribute-tag type narrowing ([language-server#460](https://github.com/marko-js/language-server/pull/460), [#450](https://github.com/marko-js/language-server/pull/450), [#452](https://github.com/marko-js/language-server/pull/452), [#454](https://github.com/marko-js/language-server/pull/454), [#456](https://github.com/marko-js/language-server/pull/456), [#458](https://github.com/marko-js/language-server/pull/458)).

## Marko Run

Meta data defined in [`+meta`](../marko-run/file-based-routing.md) files can carry HTTP verb specific overrides. For a meta file that exports an object, including a JSON file, top-level keys that match an uppercase HTTP method are treated as overrides. The matching override for the current request method is merged shallowly over the base values and excluded from the meta object otherwise.

```json
{
  "title": "Profile",
  "robots": "index",
  "POST": {
    "title": "Update Profile",
    "robots": "noindex"
  }
}
```

A `GET` request sees the base `title` and `robots`, while a `POST` request sees the overridden pair ([run#183](https://github.com/marko-js/run/pull/183)).

## Concise Syntax

In [concise mode](../reference/concise-syntax.md), text inside a code fence now has its surrounding whitespace trimmed, including leading tabs, instead of preserving the leading and trailing newlines the fence used to keep.

```marko no-format
div
  --
  Hello World
  --
```

The fenced text resolves to `Hello World` with no surrounding whitespace ([htmljs-parser#199](https://github.com/marko-js/htmljs-parser/pull/199)).

## Fixes

A round of correctness fixes landed across the runtime and compiler:

- Pure signals are preserved correctly when a function is resumed ([marko#3070](https://github.com/marko-js/marko/pull/3070)).
- Pending `<await>` closures resolve correctly ([marko#3100](https://github.com/marko-js/marko/pull/3100)).
- Inline-optimized native `class` attributes handle multiple classes per toggle correctly ([marko#3094](https://github.com/marko-js/marko/pull/3094)).
- Client-rendered tag parameters passed from a `<for to>` range into attribute tags resolve correctly ([marko#3103](https://github.com/marko-js/marko/pull/3103)).
- A known `define` tag with a closure and no setup, and duplicate event handlers in skipped props, are both handled ([marko#3068](https://github.com/marko-js/marko/pull/3068), [marko#3067](https://github.com/marko-js/marko/pull/3067)).
- Class API interop fixes `toJSON` placement on implicit split components ([marko#3083](https://github.com/marko-js/marko/pull/3083)).
- Types for the `<dialog>` element and the [`<id>`](../reference/core-tag.md#id) tag are filled in ([marko#3085](https://github.com/marko-js/marko/pull/3085), [marko#3087](https://github.com/marko-js/marko/pull/3087)).
- The Vite integration emits correct sourcemaps for the server and browser entries ([vite#244](https://github.com/marko-js/vite/pull/244)).

## Browser Support

A new [Supported Environments](../reference/supported-environments.md) page documents the browsers and Node versions Marko targets, giving a single place to check compatibility ([website#132](https://github.com/marko-js/website/pull/132)).

Full details for every change are in the release notes of each package on [GitHub](https://github.com/marko-js).

## Further Reading

- [January 2026](january-2026.md)
- [March 2026](march-2026.md)
