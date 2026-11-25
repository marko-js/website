# Marko 5 Interop

> [!TLDR]
>
> - `marko@6` is not backward compatible with the Class API
> - `marko@5` is forward compatible and runs both Class and Tags APIs together
> - In Marko 5, per-file heuristics select which runtime compiles each template

[Marko 5](https://v5.markojs.com/) uses the [Class API](https://v5.markojs.com/docs/class-components/), while Marko 6 uses the [Tags API](../reference/language.md). Because Marko 6 has removed the Class API, incremental migrations run on **Marko 5** at the project root, which ships an interoperable layer for both runtimes.

Because the two runtimes are distinct, minimize crossing between them by grouping Tags API components so they primarily render other Tags API components.

## API Heuristics

In Marko 5, the compiler classifies each `.marko` file as a whole using the heuristics below. Every feature in a single file must belong to the same API; mixing Class API and Tags API syntax in one file is not allowed, and an opt-in comment cannot override conflicting syntax.

### Directory Name

Marko 5 discovers Class API tags in `components/` directories, while Marko 6 discovers Tags API tags in `tags/` directories. Files inside a `tags/` directory compile with the Tags API.

Two exceptions apply: files inside a `components/` directory nested under `tags/` do not inherit the `tags/` rule (so they fall through to the remaining heuristics, allowing vendored Class API components inside a `tags/` tree), and directories registered through a `marko.json` [`tags-dir`](https://v5.markojs.com/docs/marko-json/) are unaffected by this rule.

### Comment Opt-In

A comment matching `use class` or `use tags` in a template, tag, or attribute-tag body explicitly selects the API for that file:

```marko
// use class
<h1>Class API</h1>
```

```marko
// use tags
<h1>Tags API</h1>
```

Any Marko comment form (`//`, `/* */`, or `<!-- -->`) works in those body positions; comments inside opening tags or inside `<script>`/`static` blocks are ignored.

> [!TIP]
> Explicit opt-ins are only needed when a file sits outside `tags/` and contains no API-specific syntax, such as an ambiguous [Marko Run](../marko-run/file-based-routing.md) `+page.marko` or `+layout.marko`.

### Class API Syntax

An otherwise ambiguous file compiles as Class API if it contains:

- A [`class {}` block](https://v5.markojs.com/docs/class-components/#single-file-components)
- A [`style {}` block](https://v5.markojs.com/docs/class-components/#styles)
- Inline JS in a [`$ scriptlet;`](https://v5.markojs.com/docs/syntax/#inline-javascript)
- An [attribute argument](https://v5.markojs.com/docs/syntax/#arguments) (`<button onClick("handleClick")>`)
- Any of these Class API tags (see `getFeatureTypeFromCoreTagName` in [`feature-detection.ts`](https://github.com/marko-js/marko/blob/main/packages/runtime-tags/src/translator/interop/feature-detection.ts)): `<await-reorderer>`, `<class>`, `<include-html>`, `<include-text>`, `<init-components>`, `<macro>`, `<module-code>`, or `<while>`

> [!NOTE]
> `static`, `server`, and `client` statements work in both APIs and are not detection signals.

### Tags API Syntax

An otherwise ambiguous file compiles as Tags API if it contains:

- A [tag variable](../reference/language.md#tag-variables) (`<div/var>`)
- The [bind shorthand](../reference/language.md#shorthand-change-handlers-two-way-binding) (`:=`)
- Any of these Tags API tags (see `getFeatureTypeFromCoreTagName` in [`feature-detection.ts`](https://github.com/marko-js/marko/blob/main/packages/runtime-tags/src/translator/interop/feature-detection.ts)): `<const>`, `<debug>`, `<define>`, `<id>`, `<let>`, `<lifecycle>`, `<log>`, `<return>`, `<show>`, or `<try>`

```marko
<let/count=0>
<button onClick() { count++ }>${count}</button>
```

### Exclusive Tag Library

If an ambiguous file discovers tags exclusively in `tags/` directories with no `components/` directories in scope, it defaults to the Tags API:

```text
src/
  +page.marko // Tags API
  tags/
    some-tag.marko
```

If any `components/` directory is in scope, ambiguous files default to the Class API unless marked with a [`// use tags` comment](#comment-opt-in) or [Tags API syntax](#tags-api-syntax):

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

Attributes, [content](../reference/language.md#tag-content), [attribute tags](../reference/language.md#attribute-tags), and [tag parameters](../reference/language.md#tag-parameters) all pass across the Class/Tags boundary. Pending promises do not: keep each [`<await>`](../reference/core-tag.md#await) and the content it renders within a single API rather than passing unsettled `<await>` content across the boundary.
