# Markup Equivalents

> [!TLDR]
>
> - Attribute names are the HTML ones, not DOM property spellings
> - `class=` and `style=` accept objects
> - Control flow lives in core tags, not in attributes
> - Two-way binding and event handlers are attribute values

Marko spells native tag attributes the way HTML does, so `class`, `for`, and `http-equiv` are the names a template uses, and attribute values are ordinary JavaScript expressions. Markup carried over from React, Vue, or Svelte tends to reach for DOM property spellings or directive syntax for these same ideas, and each of them has a direct Marko form.

## Attribute Names

| Ported name               | Marko            |
| ------------------------- | ---------------- |
| `className`, `classList`  | `class`          |
| `htmlFor`                 | `for`            |
| `acceptCharset`           | `accept-charset` |
| `httpEquiv`               | `http-equiv`     |
| `defaultValue`            | `value`          |
| `defaultChecked`          | `checked`        |
| `dangerouslySetInnerHTML` | `$!{html}`       |
| `key`                     | `by=` on `<for>` |
| `ref`                     | `<div/ref>`      |

[`class=`](../reference/native-tag.md#class) accepts a string, an array, or an object, so conditional class names are expressed in the attribute value itself.

A native `value=` or `checked=` sets the initial state and leaves the browser owning it from there, which is the behavior the `default`-prefixed spellings describe. Pairing the attribute with a [change handler](../reference/native-tag.md#change-handlers) moves ownership into the template.

The last three rows change shape rather than spelling. Already-sanitized markup is written with an [unescaped interpolation](../reference/language.md#unescaped-text), [`<for>`](../reference/core-tag.md#for) keys its iterations through `by=`, and a [tag variable](../reference/native-tag.md#element-references) on a native tag is the getter for its DOM node.

## Directives

| Directive                   | Marko                                                                               |
| --------------------------- | ----------------------------------------------------------------------------------- |
| `v-if`                      | [`<if>`](../reference/core-tag.md#if--else)                                         |
| `v-else-if`                 | `<else if>`                                                                         |
| `v-else`                    | `<else>`                                                                            |
| `v-show`                    | [`<show>`](../reference/core-tag.md#show)                                           |
| `v-for`                     | [`<for>`](../reference/core-tag.md#for)                                             |
| `v-text`                    | [`${text}`](../reference/language.md#dynamic-text)                                  |
| `v-html`                    | [`$!{html}`](../reference/language.md#unescaped-text)                               |
| `v-bind`                    | [`...attrs`](../reference/language.md#spread-attributes)                            |
| `v-bind:name`               | `name`                                                                              |
| `v-model`                   | `value:=state`                                                                      |
| `v-model:name`, `bind:name` | [`name:=state`](../reference/language.md#shorthand-change-handlers-two-way-binding) |
| `v-on:name`, `on:name`      | [`onName`](../reference/native-tag.md#event-handlers)                               |
| `class:name`                | `class={ name: condition }`                                                         |
| `style:name`                | `style={ name: value }`                                                             |

Conditional classes, individual style properties, and two-way bindings are attribute values, so a single `class=` or `style=` carries every entry rather than one directive per entry.

```marko
<let/draft="">
<textarea class={ overlong: draft.length > 280 } value:=draft/>
<small style={ "font-variant-numeric": "tabular-nums" }>${draft.length}</small>
```

> [!WARNING]
> `style` object keys reach the document verbatim, so a hyphenated CSS property is quoted rather than camelCased: `"font-variant-numeric"`, not `fontVariantNumeric`.

## Tag Names

Content passed into a tag renders wherever its [`input.content`](../reference/language.md#tag-content) is placed in a [dynamic tag](../reference/language.md#dynamic-tags), `<${input.content}/>`, which is the role a slot element plays elsewhere. Reactive state is declared with [`<let>`](../reference/core-tag.md#let). Templates and tag bodies may have as many root nodes as needed, so siblings sit next to each other without a wrapper.
