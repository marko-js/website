# Using Multiple Marko Versions

> [!TLDR]
>
> - `marko@6` is _not_ backward compatible
> - `marko@5` is **forward compatible**
> - In Marko 5, heuristics determine the runtime version per file

[Marko 5](https://v5.markojs.com/) uses the [Class API](https://v5.markojs.com/docs/class-components/), and current versions use the [Tags API](../reference/language.md). Marko 6 is _not_ backwards compatible, so if `marko@6` is installed an application cannot use class components out of the box. Instead, Marko 5 is **forward compatible**. To use multiple versions of Marko together, ensure that Marko 5 is installed at the project root.

Marko 5 and 6 use runtimes which are **interoperable** but **distinct**. As such, the compiler determines which runtime to use based on a set of heuristics. Switching _between_ the two runtimes should be avoided as often as possible, so it is preferable to ensure that Tags API components mostly reference other Tags API components.

## Tags/Class API Heuristics

The Marko 5 compiler uses a set of heuristics to determine which runtime a template should be compiled to.

> [!NOTE]
> Each `.marko` file is classified as a whole: the compiler scans the entire template and the first signal found determines the file's API. Signals from _both_ APIs in the same file cause a compile error ("Cannot mix Tags API and Class API features in the same file"), so an explicit opt-in comment cannot override conflicting syntax.

### Directory Name

In Marko 5 and below custom tags were [auto-discovered](../reference/custom-tag.md#relative-custom-tags) from `/components` directories, but in Marko 6 they are discovered from `/tags`. Since `/tags` is new to Marko 6, `.marko` files under `/tags` **must** use the Tags API.

There are two exceptions: files inside a `components/` directory nested within `/tags` are treated as Class API (which allows vendored Class API code to live inside a tags tree), and directories registered through a `marko.json` [`tags-dir`](https://v5.markojs.com/docs/marko-json/) are not affected by this rule.

### Comment Opt-In

Files can be explicitly marked to use a specific API with a `/* use [api] */`comment. Any comment type is acceptable, and the comment can be anywhere in the file.

```marko
// use class
<h1>Class API</h1>
```

```marko
<!-- use tags -->
<h1>Tags API</h1>
```

> [!TIP]
> These explicit opt-ins are only necessary if a `.marko` file _isn't_ an [auto-discovered tag](#directory-name) and its contents are ambiguous (i. e. none of the following heuristics apply) so in practice they are rarely needed except for sometimes in [Marko Run](../marko-run/file-based-routing.md)'s `+page.marko` and `+layout.marko`.

### Class API Syntax

If an otherwise ambiguous file contains any of the following syntax, it is detected as Class API (Marko 5):

- A [`class {}` block](https://v5.markojs.com/docs/class-components/#single-file-components)
- A [`style {}` block](https://v5.markojs.com/docs/class-components/#styles)
- Inline JS in a [`$ scriptlet;`](https://v5.markojs.com/docs/syntax/#inline-javascript)
- An [Attribute argument](https://v5.markojs.com/docs/syntax/#arguments) (`<button onClick("handleClick")>`)
- Any of [these tags](https://github.com/marko-js/marko/blob/main/packages/runtime-tags/src/translator/interop/feature-detection.ts#L180-L188):
  - `<await-reorderer>` `<class>` `<include-html>` `<include-text>` `<init-components>` `<macro>` `<module-code>` `<while>`

> [!NOTE]
> `static`, `server`, and `client` statements are shared by both APIs and are not detection signals.

### Tags API Syntax

If an otherwise ambiguous file contains any of the following syntax, it is detected as Tags API (Marko 6):

- A [tag variable](../reference/language.md#tag-variables) (`<div/var>`)
- The [bind shorthand](../reference/language.md#shorthand-change-handlers-two-way-binding) (`:=`)
- Any of [these tags](https://github.com/marko-js/marko/blob/main/packages/runtime-tags/src/translator/interop/feature-detection.ts#L189-L198):
  - `<const>` `<debug>` `<define>` `<id>` `<let>` `<lifecycle>` `<log>` `<return>` `<try>`

```marko
<let/count=0>
<button onClick() { count++ }>${count}</button>
```

### Exclusive Tag Library

If a file is otherwise ambiguous but _all_ tags found by the [tag discovery mechanism](../reference/custom-tag.md#relative-custom-tags) are in a `tags/` directory and no `components/` directories are discovered, the file falls back into Tags API.

All ambiguous files here use the tags API, because there are no `components/`.

```text
src/
  +page.marko // Tags API
  tags/
    some-tag.marko
```

Even _one_ `components/` directory will default all ambiguous files to prefer Class API if there are no [`// use tags` comments](#comment-opt-in) or [tag syntax heuristics](#tags-api-syntax).

```text
src/
  components/
    some-component.marko
  some-page/
    +page.marko // Class API
    tags/
      another-tag.marko
  tags/
    some-tag.marko
```

## Limitations

Attributes, [content](../reference/language.md#tag-content), [attribute tags](../reference/language.md#attribute-tags), and [tag parameters](../reference/language.md#tag-parameters) all cross between the runtimes. A pending promise does not: when content containing an unsettled [`<await>`](../reference/core-tag.md#await) crosses between the runtimes, rendering fails with `Cannot serialize promise across tags/class compat layer`. Keep each `<await>` and the content it renders within a single API.
