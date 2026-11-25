# TypeScript

Marko provides built-in TypeScript support for template inputs, reactive variables, native elements, and custom tags, with checking in editors and the CLI.

## Enabling TypeScript in your Marko project

For applications, place a [`tsconfig.json`](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) at the project root:

```text
src/
package.json
tsconfig.json
```

For [tag libraries](./custom-tag.md#installed-custom-tags), publish the output of [`@marko/type-check`](#ci-type-checking), which emits type-stripped `.marko` files alongside `.d.marko.ts` declaration files so consumers get full autocomplete and type checking.

> [!TIP]
> Codebases migrating incrementally between JavaScript and TypeScript can set `"script-lang"` to `"ts"` or `"js"` in a `marko.json`. Marko walks upward to the nearest `marko.json` defining `script-lang`, allowing per-directory opt-in or opt-out.

## Typing `input`

Exporting `Input` (`export interface Input` or `export type Input`) types the template's [`input`](./language.md#input) object:

```marko
export interface Input {
  currency: string;
  amount: number;
}

<label>
  Price in ${input.currency}:
  <input type="number" value=input.amount min=0 step=0.01>
</label>
```

Because `Input` is a standard TypeScript export, other `.marko` and `.ts` files can import and extend it:

```marko
import type { Input as PriceInput } from "<price-field>";
import type { ExtraTypes } from "./utils.ts";

export type Input = PriceInput & ExtraTypes;
```

```marko
import type { Input as PriceInput } from "<price-field>";

export interface Input extends PriceInput {
  discounted: boolean;
  expiresAt: Date;
}
```

### Generic `Input`

[Type parameters](https://www.typescriptlang.org/docs/handbook/2/generics.html) declared on `Input` are in scope throughout the template body (excluding module-level [`static` statements](./language.md#static)):

```marko
export interface Input<T> {
  options: T[];
  onSelect: (newVal: T) => unknown;
}

static function staticFn() {
  // `T` is not in scope in module-level statements
}

<const/instanceFn(val: T) {
  // `T` is in scope in the template body
}/>

<select onInput(_evt, el) { input.onSelect(input.options[+el.value]) }>
  <for|value, i| of=input.options>
    <option value=i>${value}</option>
  </for>
</select>
```

### Tag Documentation

A JSDoc comment above `export interface Input` (or the `@typedef Input` comment in a JavaScript template) documents the tag itself. Editors display it on hover at every call site, including JSDoc tags such as `@deprecated` and `@see`:

```marko
/**
 * Shows a rating out of five as filled stars.
 * @see https://example.com/design/rating
 */
export interface Input {
  /** The rating, from 0 to 5. */
  value: number;
}

<span role="img" aria-label=`${input.value} out of 5`>
  ${"★".repeat(input.value)}${"☆".repeat(5 - input.value)}
</span>
```

## Built-in Marko Types

Marko exposes its [type definitions](https://github.com/marko-js/marko/blob/main/packages/runtime-tags/index.d.ts) under the global `Marko` namespace:

| Type                                                        | Description                                                                                                                                 |
| :---------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| `Marko.Template<Input, Return>`                             | Default export of a `.marko` file (`typeof import("./template.marko").default`)                                                             |
| `Marko.TemplateOf<Signature>`                               | Generic template type emitted by `mtc` for parameterized templates                                                                          |
| `Marko.TemplateInput<Input>`                                | Object accepted by `render` and `mount`, combining `Input` with `$global`                                                                   |
| `Marko.Body<Params, Return>`                                | [Tag content](./language.md#tag-content) accepting parameter tuple `Params` and `<return>` attributes `Return`                              |
| `Marko.Renderable`                                          | Any value accepted by [`<${dynamic}/>`](./language.md#dynamic-tags): `string \| Marko.Template \| Marko.Body<any, any> \| { content: ... }` |
| `Marko.Global`                                              | Type of [`$global`](./language.md#global), extensible via [module augmentation](#typing-global)                                             |
| `Marko.RenderedTemplate`                                    | Return type of [`Template.render`](./template.md#templaterenderinput)                                                                       |
| `Marko.MountedTemplate<Input, Ret>`                         | Return type of [`Template.mount`](./template.md#templatemountinput-node-position)                                                           |
| `Marko.NativeTags`                                          | Map of all [native tags](./native-tag.md) to `Marko.NativeTag` entries (`Marko.NativeTags["div"]["input"]`)                                 |
| `Marko.NativeTag<Input, Return>`                            | Single entry in `Marko.NativeTags`: `Input` types attributes, `Return` types the [element ref](./native-tag.md#element-references)          |
| `Marko.HTMLAttributes<T>`                                   | Global attributes and events shared by HTML elements (`T` types handler target, defaulting to `Element`)                                    |
| `Marko.SVGAttributes<T>`                                    | Global attributes and events shared by SVG elements (`T` types handler target, defaulting to `Element`)                                     |
| `Marko.Input<Tag>` / `Marko.Return<Tag>`                    | Extract input or return types from a native tag name, custom tag, or `Marko.Body`                                                           |
| `Marko.BodyParameters<Body>` / `Marko.BodyReturnType<Body>` | Extract parameter tuple or return type from a `Marko.Body`                                                                                  |
| `Marko.AttrTag<T>`                                          | [Attribute tag](./language.md#attribute-tags) type combining the first instance with `[Symbol.iterator]` for repeated tags                  |

### Class API Types

Marko 5 Class API types (`Marko.Component`, `Marko.Out`, `Marko.Emitter`) have been removed; they remain available from `marko@5` when [using Marko 5 interop](../guide/marko-5-interop.md).

### Typing `content`

Use `Marko.Body` to type [`input.content`](./language.md#tag-content):

```marko
/* tags/child.marko */
export interface Input {
  content?: Marko.Body;
}
```

```marko
/* index.marko */
<child/>
<child>Text in body</child>
<child>
  <div>Any combination of tags</div>
</child>
```

Passing a non-`Body` value (such as a component reference directly to `content=`) fails type checking.

#### Typing Tag Parameters

Pass a tuple of parameter types as the first type argument to `Marko.Body`:

```marko
/* tags/for-by-two.marko */
export interface Input {
  to: number;
  content: Marko.Body<[number]>;
}

<for|i| from=0 to=input.to step=2>
  <${input.content}(i)/>
</for>
```

```marko
/* index.marko */
<for-by-two|i| to=10>
  <div>${i}</div>
</for-by-two>
```

### Typing Attribute Tags

All attribute tags are iterable even when passed once, so wrap attribute tag inputs in `Marko.AttrTag`:

```marko
export interface Input {
  option: Marko.AttrTag<Marko.HTML.Option>;
}

<select>
  <for|option| of=input.option>
    <option ...option/>
  </for>
</select>
```

### Extending Native Tags

Extend native HTML types from `Marko.HTML` or SVG types from `Marko.SVG`:

```marko
export interface Input extends Marko.HTML.Button {
  color: string;
}

<const/{ color, ...attrs }=input>

<button style=`color: ${color}` ...attrs/>
```

> [!TIP]
> Native tags accept [`content`](./native-tag.md#content) as an attribute, so `<button ...attrs/>` forwards `input.content` automatically without an explicit body:
>
> ```marko
> <button style=`color: ${color}` ...attrs>
>   // no longer required
>   <${input.content}/>
> </button>
> ```

```marko
export interface Input extends Marko.SVG.Path {
  dashed: boolean;
}

<const/{ dashed, ...attrs }=input>

<path fill="none" stroke-dasharray=dashed && "6 3" ...attrs/>
```

### Custom Elements

First register the custom element as a native tag in [`marko.json`](./custom-tag.md#native-tag-registration), then augment `Marko.NativeTags`:

```json
/* marko.json */
{
  "<x-datepicker>": { "html": true }
}
```

```ts
/* x-datepicker.ts */
export class DatepickerElement extends HTMLElement {
  static observedAttributes = ["value"];
  get value() {
    return this.getAttribute("value") ?? "";
  }
}

interface DatepickerAttributes
  extends Omit<Marko.HTMLAttributes<DatepickerElement>, "onChange"> {
  value?: string;
  onChange?: (e: CustomEvent<string>, target: DatepickerElement) => void;
  onDateSelect?: (e: CustomEvent<string>, target: DatepickerElement) => void;
}

declare global {
  namespace Marko {
    interface NativeTags {
      "x-datepicker": Marko.NativeTag<DatepickerAttributes, DatepickerElement>;
    }
  }
}
```

```marko
/* index.marko */
<let/picked="2026-01-01">
<x-datepicker/picker
  value=picked
  onChange(evt) { picked = evt.detail }
/>
<button onClick() { picker().focus() }>Focus</button>
```

Extending `Marko.HTMLAttributes<T>` inherits global HTML attributes and events with `T` as the handler's second parameter. Declare `CustomEvent<T>` handlers directly on the attributes interface; when a custom event name collides with a standard DOM event (such as `onChange`), `Omit` that key from `Marko.HTMLAttributes<T>` first.

> [!NOTE]
> Marko writes attributes on registered custom elements via `setAttribute`, never as JavaScript properties. Declare `observedAttributes` on the custom element class to observe attribute updates, or assign properties through an element reference inside [`<script>`](./core-tag.md#script).

### Global HTML Attributes

Augment `Marko.HTMLAttributes` (or `Marko.SVGAttributes` for SVG) to add non-standard global attributes:

```ts
declare global {
  namespace Marko {
    interface HTMLAttributes {
      "my-non-standard-attribute"?: string;
    }
  }
}
```

### CSS Properties

The [`style=` object](./native-tag.md#style) uses `Marko.CSS.Properties` (extending [csstype](https://github.com/frenic/csstype)'s `PropertiesHyphen`). Augment it to type CSS custom properties:

```ts
declare global {
  namespace Marko {
    namespace CSS {
      interface Properties {
        "--accent"?: string;
      }
    }
  }
}
```

### Typing `$global`

`Marko.Global` includes an index signature so undeclared properties read as `unknown`. Augment `Marko.Global` in a declaration file (using a leading `export {}` to treat the file as a module) to type application-wide [`$global`](./language.md#global) properties:

```ts
export {};

declare global {
  namespace Marko {
    interface Global {
      locale?: string;
      requestId?: string;
    }
  }
}
```

> [!WARNING]
> Properties declared without `?` become required on every `$global` passed to `render` or `mount`.

## TypeScript Syntax in `.marko`

Any JavaScript expression inside a `.marko` file accepts TypeScript syntax:

```marko
<my-tag foo=1 as any>
  ${(input.el as HTMLInputElement).value}
</my-tag>
```

### Tag Type Parameters

Declare generic type parameters on [tag parameters](./language.md#tag-parameters) before the pipe list:

```marko
<child <T>|value: T|>
  <div>${value}</div>
</child>
```

### Tag Type Arguments

Supply explicit type arguments on a tag when inference is insufficient, or when initializing a `<let>` to `null` under `strictNullChecks`:

```marko
/* tags/child.marko */
export interface Input<T> {
  value: T;
}
```

```marko
/* index.marko */
<child<number> value=1/>
<let<string | null>/selected=null>
```

### Method Type Parameters

Method shorthands accept TypeScript type parameters directly after the method name:

```marko
<child process<T>(item: T) { return item }/>
```

### Attribute Type Assertions

Narrow inferred attribute or `<let>` types with TypeScript's [`as` operator](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions):

```marko
<let/handler=null as (() => void) | null>
<some-component number=1 as const names=[] as string[]/>
```

## JSDoc Support

JavaScript projects can adopt type checking incrementally through [JSDoc annotations](https://www.typescriptlang.org/docs/handbook/intro-to-js-ts.html).

### Setup

Enable checking per file by adding `// @ts-check` at the top, or check all `.marko` and `.js` files project-wide with a [`jsconfig.json`](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html#using-tsconfigjson-or-jsconfigjson) setting `"checkJs": true` (opting individual files out with `// @ts-nocheck`):

```marko
// @ts-check

/**
 * @typedef {{
 *   firstName: string,
 *   lastName: string,
 * }} Input
 */

<div>${input.firstName} ${input.lastName}</div>
```

## CI Type Checking

Run [`@marko/type-check`](https://github.com/marko-js/language-server/tree/main/packages/type-check) via its `mtc` CLI to check `.marko` files in CI and emit declarations for libraries:

```sh
npx mtc
```

## Profiling Performance

Pass [`--generateTrace`](https://www.typescriptlang.org/tsconfig/#generateTrace) to `mtc` to profile slow type checks:

```sh
mtc --generateTrace TRACE_DIR
```
