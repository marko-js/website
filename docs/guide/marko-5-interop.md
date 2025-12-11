# Using Multiple Marko Versions

> [!TLDR]
> - `marko@6` is _not_ backward compatible
> - `marko@5` is **forward compatible**
> - In Marko 5, heuristics determine runtime version per-tag

[Marko 5](https://v5.markojs.com/) uses the [Class API](https://v5.markojs.com/docs/class-components/), and current versions use the [Tags API](../reference/language.md). Marko 6 is _not_ backwards compatible, so if `marko@6` is installed an application cannot use class components out of the box. Instead, Marko 5 is **forward compatible**. To use multiple versions of Marko together, ensure that Marko 5 is installed at the project root.

Marko 5 and 6 use runtimes which are **interoperable** but **distinct**. As such, the compiler determines which runtime to use based on a set of heuristics. Switching _between_ the two runtimes should be avoided as often as possible, so it is preferable to ensure that Tags API components mostly reference other Tags API components. 

## Tags/Class API Heuristics

The Marko 5 compiler uses a set of heuristics to determine which runtime a template should be compiled to.

> [!NOTE]
> These rules are listed in order of precedence, so once _one_ is satisfied none of the others are checked.

### Directory Name

In Marko 5 and below custom tags were [auto-discovered](../reference/custom-tag.md#relative-custom-tags) from `/components` directories, but in Marko 6 they are discovered from `/tags`. Tags under `/components` are ambiguous so the following heuristics are considered, but tags under `/tags` **must** use the Tags API.

- `components/*.marko` → fall back to `marko@5`
- `tags/*.marko` → **force** `marko@6`

### `use [api]` comments

Files can be explicitly marked to use a specific API with a comment. Any comment type is acceptable, and the comment can be anywhere in the file.

```marko
// use class
<h1>Class API</h1>
```

```marko
<!-- use tags -->
<h1>Tags API</h1>
```

> [!TIP]
> These explicit opt-ins are only necessary if a `.marko` file _isn't_ an [auto-discovered tag](#components-vs-tags) and its contents are ambiguous (i. e. none of the following heuristics apply) so in practice they are rarely needed except for sometimes in [Marko Run](../marko-run/file-based-routing.md)'s `+page.marko` and `+layout.marko`.

### Class API Syntax

If an otherwise ambiguous file contains any of the following syntax, it is detected as Class API (Marko 5):

- A [`class {}` block](https://v5.markojs.com/docs/class-components/#single-file-components)
- A [`style {}` block](https://v5.markojs.com/docs/class-components/#styles)
- Inline JS in a [`$ scriptlet;`](https://v5.markojs.com/docs/syntax/#inline-javascript)
- An [Attribute argument](https://v5.markojs.com/docs/syntax/#arguments) (`<button onClick("handleClick")>`)
- An attribute modifier ([`:scoped`](https://v5.markojs.com/docs/class-components/#scoped) or [`:no-update`](https://v5.markojs.com/docs/class-components/#no-update_1))
- Any of [these tags](https://github.com/marko-js/marko/blob/main/packages/runtime-tags/src/translator/interop/feature-detection.ts#L182-L190):
  - `<await-reorderer>` `<class>` `<include-html>` `<include-text>` `<init-components>` `<macro>` `<module-code>` `<while>`

### Tags API Syntax

If an otherwise ambiguous file contains any of the following syntax, it is detected as Tags API (Marko 6):

- A [tag variable](../reference/language.md#tag-variables) (`<div/var>`)
- The [bind shorthand](../reference/language.md#shorthand-change-handlers-two-way-binding) (`:=`)
- Any of [these tags](https://github.com/marko-js/marko/blob/main/packages/runtime-tags/src/translator/interop/feature-detection.ts#L191-L200):
  - `<const>` `<debug>` `<define>` `<id>` `<let>` `<lifecycle>` `<log>` `<return>` `<try>`

```marko
<let/count=0>
<button onClick() { count++ }>${count}</button>
```

### Exclusive Tag Library

If a file is otherwise ambiguous but _all_ tags found by the [tag discovery mechanism](../reference/custom-tag.md#relative-custom-tags) are in a `tags/` directory and no `components/` directories are discovered, the file falls back into Tags API.

All ambiguous files here use the tags API, because there are no `components/`.

```
src/
  +page.marko // Tags API
  tags/
    some-tag.marko
```

Even _one_ `components/` directory will default all ambiguous files to prefer Class API if there are no [`// use tags` comments](#-use-api) or [tag syntax heuristics](#tags-api-syntax).

```
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