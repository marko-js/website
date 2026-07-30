# TypeScript

Marko’s TypeScript support offers in-editor error checking, makes refactoring less scary, verifies that data matches expectations, and even helps with API design.

## Enabling TypeScript in your Marko project

There are two (non-exclusive) ways to add TypeScript to a Marko project:

- **For sites and web apps**, [a `tsconfig.json` file](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) at the project root is the only requirement:

  ```text
  src/
  package.json
  tsconfig.json
  ```

- **For [packages of Marko tags](./custom-tag.md#installed-custom-tags)**, the `"script-lang"` attribute must be set to `"ts"` in the `marko.json`:

  ```json
  /* marko.json */
  {
    "script-lang": "ts"
  }
  ```

  This will automatically expose type-checking and autocomplete for the published tags.

> [!TIP]
> You can also use the `script-lang` method for sites and apps.
>
> Marko will crawl up the directory looking for a `marko.json` with `script-lang` defined.
>
> This helps when incrementally migrating to TypeScript allowing folders to opt-in or opt-out of strict type checking.

## Typing `input`

A `.marko` file will use any exported `Input` type for [that file’s `input` object](./language.md#input).

This can be `export type Input` or `export interface Input`.

### Example

```marko
/* PriceField.marko */
export interface Input {
  currency: string;
  amount: number;
}

<label>
  Price in ${input.currency}:
  <input type="number" value=input.amount min=0 step=0.01>
</label>
```

Since it is exported, `Input` may be accessed from other `.marko` and `.ts` files:

```marko
import { Input as PriceInput } from "<PriceField>";
import { ExtraTypes } from "lib/utils.ts";
export type Input = PriceInput & ExtraTypes;
```

```marko
import { Input as PriceInput } from "<PriceField>";
export interface Input extends PriceInput {
  discounted: boolean;
  expiresAt: Date;
};
```

### Generic `Input`

[Generic Types and Type Parameters](https://www.typescriptlang.org/docs/handbook/2/generics.html) on `Input` are recognized throughout the entire `.marko` template (excluding [static statements](./language.md#static)).

```marko
export interface Input<T> {
  options: T[];
  onSelect: (newVal: T) => unknown;
}

static function staticFn() {
  // can NOT use `T` here
}

<const/instanceFn(val: T) {
  // can use `T` here
}/>

// can use `as T` here
<select onInput(evt) { input.onSelect(options[evt.target.value] as T) }>
  <for|value, i| of=input.options>
    <option value=i>${value}</option>
  </for>
</select>
```

## Built-in Marko Types

Marko exposes common [type definitions](https://github.com/marko-js/marko/blob/main/packages/runtime-tags/index.d.ts) through the `Marko` [TypeScript namespace](https://www.typescriptlang.org/docs/handbook/namespaces.html):

- **`Marko.Template<Input, Return>`**
  - The type of a `.marko` file
  - `typeof import("./template.marko")`
- **`Marko.TemplateInput<Input>`**
  - The object accepted by the render methods of a template. It includes the template's `Input` and `$global` values.
- **`Marko.Body<Params, Return>`**
  - Used to type [tag content](./language.md#tag-content)
- **`Marko.Renderable`**
  - All values accepted by the [`<${dynamic}/>` tag](./language.md#dynamic-tags)
  - `string | Marko.Template | Marko.Body | { content: Marko.Body | Marko.Template | string }`
- **`Marko.Global`**
  - The type of [the `$global` object](./language.md#global)
  - Extended with [application specific properties](#typing-global)
- **`Marko.RenderedTemplate`**
  - The result of [rendering a Marko template](./template.md#templaterenderinput)
  - `ReturnType<Marko.Template["render"]>`
- **`Marko.MountedTemplate<Input, Return>`**
  - The result of [mounting a Marko template](./template.md#templatemountinput-node-position)
  - `ReturnType<Marko.Template["mount"]>`
- **`Marko.NativeTags`**
  - An object containing all [native tags](./native-tag.md) and their types
  - Each entry is a `Marko.NativeTag`, so `div` attributes are `Marko.NativeTags["div"]["input"]`
- **`Marko.NativeTag<Input, Return>`**
  - The type of a single entry in `Marko.NativeTags`
  - `Input` types the tag's attributes, `Return` the element from its [tag variable](./native-tag.md#element-references)
- **`Marko.HTMLAttributes<T>`** and **`Marko.SVGAttributes<T>`**
  - The global attributes and events shared by all HTML tags and all SVG tags, respectively
  - `T` types the element passed to `on*` handlers, defaulting to `Element`
- **`Marko.Input<TagName>`** and **`Marko.Return<TagName>`**
  - Helpers to extract the input and return types from native tags (when a string is passed) or custom tags.
- **`Marko.BodyParameters<Body>`** and **`Marko.BodyReturnType<Body>`**
  - Helper to extract the parameters and return types from a `Marko.Body`
- **`Marko.AttrTag<T>`**
  - Used to represent types for [attributes tags](./language.md#attribute-tags)
  - A single attribute tag, with a `[Symbol.iterator]` to consume any repeated tags

### Class API Types

Types for the [Class API](https://v5.markojs.com/docs/typescript/#built-in-marko-types), such as `Marko.Component`, `Marko.Out`, and `Marko.Emitter`, are no longer included in Marko 6. They remain available through the `marko@5` package when [using multiple Marko versions](../guide/marko-5-interop.md).

### Typing `content`

A commonly used type from the `Marko` namespace is `Marko.Body` which can be used to type the [content](./language.md#tag-content) in `input.content`:

```marko
/* child.marko */
export interface Input {
  content?: Marko.Body;
}
```

Here, all of the following are acceptable:

```marko
/* index.marko */
<child/>
<child>Text in render body</child>
<child>
  <div>Any combination of components</div>
</child>
```

Passing other values (including components) causes a type error:

```marko
/* index.marko */
import OtherTag from "<other-tag>";
<child content=OtherTag/>
```

#### Typing Tag Parameters

Tag parameters are provided to the `content` by the child tag. For this reason, `Marko.Body` allows typing of its parameters:

```marko
/* for-by-two.marko */
export interface Input {
  to: number;
  content: Marko.Body<[number]>
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

All attribute tags are typed as iterable with a `[Symbol.iterator]`, regardless of intent. This means all attribute tag inputs must be wrapped in `Marko.AttrTag`.

```marko
/* my-select.marko */
export interface Input {
  option: Marko.AttrTag<Marko.HTML.Option>
}

<select>
  <for|option| of=input.option>
    <option ...option/>
  </for>
</select>
```

### Extending native tag types within a Marko tag

The types for native tags are accessed via the global `Marko.HTML` namespace. Here's an example of a component that extends the `button` html tag:

```marko
/* color-button.marko */
export interface Input extends Marko.HTML.Button {
  color: string;
}

<const/{ color, ...attrs }=input>

<button style=`color: ${color}` ...attrs/>
```

> [!TIP]
> Since Marko 6, native tags have supported including [`content`](./native-tag.md#content) as an attribute so there is no need to inject manually
>
> ```marko
> <button style=`color: ${color}` ...attrs>
>   // no longer required!
>   <${input.content}/>
> </button>
> ```

SVG tag types live in the parallel `Marko.SVG` namespace.

```marko
export interface Input extends Marko.SVG.Path {
  dashed: boolean;
}

<const/{ dashed, ...attrs }=input>

<path fill="none" stroke-dasharray=dashed && "6 3" ...attrs/>
```

### Registering a new native tag (e.g. for custom elements)

A custom element is declared as an HTML tag in the project's `marko.json`, which [tag discovery](./custom-tag.md) reads:

```json
/* marko.json */
{
  "<range-slider>": { "html": true }
}
```

Its types are added to the `Marko.NativeTags` interface:

```ts
/* range-slider.ts */
export class RangeSliderElement extends HTMLElement {
  value = 0;
}

interface RangeSliderAttributes extends Marko.HTMLAttributes<RangeSliderElement> {
  value?: number;
  step?: number;
}

declare global {
  namespace Marko {
    interface NativeTags {
      "range-slider": Marko.NativeTag<RangeSliderAttributes, RangeSliderElement>;
    }
  }
}
```

Extending `Marko.HTMLAttributes` carries over the global HTML attributes and events, and its type parameter types the element passed to those event handlers.

```marko
/* index.marko */
<let/threshold=20/>
<range-slider/sliderEl value=threshold step=5 onChange(evt, target) { threshold = target.value }/>
<button onClick() { sliderEl().focus() }>Adjust</button>
```

### Registering new "global" HTML Attributes

```ts
declare global {
  namespace Marko {
    interface HTMLAttributes {
      "my-non-standard-attribute"?: string; // Adds this attribute as available on all HTML tags.
    }
  }
}
```

SVG tags take their global attributes from `Marko.SVGAttributes`, augmented the same way.

### Registering CSS Properties (eg for custom properties)

The [`style=` object](./native-tag.md#style) is typed with `Marko.CSS.Properties`, which extends [csstype](https://github.com/frenic/csstype)'s `PropertiesHyphen`, so keys are hyphen-case CSS property names.

```ts
declare global {
  namespace Marko {
    namespace CSS {
      interface Properties {
        "--foo"?: string; // adds a support for a custom `--foo` css property.
      }
    }
  }
}
```

### Typing `$global`

`Marko.Global` includes an index signature, so any property may be placed on [`$global`](./language.md#global), but undeclared properties read back as `unknown`. Declaring them types `$global` in every template and [render call](./template.md#inputglobal). In a dedicated declaration file, the leading `export {}` makes `declare global` apply.

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
> A property declared without `?` is required in every `$global` passed to `render` or `mount`, since `Marko.TemplateInput` types `$global` as the whole `Marko.Global`.

## TypeScript Syntax in `.marko`

Any JavaScript expression in Marko can also be written as a TypeScript expression.

```marko
<my-tag foo=1 as any>
  ${(input.el as HTMLInputElement).value}
</my-tag>
```

### Tag Type Parameters

```marko
<child <T>|value: T|>
  ...
</child>
```

### Tag Type Arguments

```marko
/* components/child.marko */
export interface Input<T> {
  value: T;
}
```

```marko
/* index.marko */
// number would be inferred in this case, but we can be explicit
<child<number> value=1 />
```

### Method Shorthand Type Parameters

```marko
<child process<T>() { /* ... */ } />
```

### Attribute Type Assertions

The types of attribute values can _usually_ be inferred. When needed, you can assert values to be more specific with [TypeScript’s `as` keyword](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions):

```marko
<some-component
  number=1 as const
  names=[] as string[]
/>
```

## JSDoc Support

For existing projects that want to incrementally add type safety, adding full TypeScript support is a big leap. This is why Marko also includes full support for [incremental typing via JSDoc](https://www.typescriptlang.org/docs/handbook/intro-to-js-ts.html).

### Setup

You can enable type checking in an existing `.marko` file by adding a `// @ts-check` comment at the top:

```js
// @ts-check
```

If you want to enable type checking for all Marko & JavaScript files in a JavaScript project, you can switch to using a [`jsconfig.json`](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html#using-tsconfigjson-or-jsconfigjson). You can skip checking some files by adding a `// @ts-nocheck` comment to files.

Once that has been enabled, you can start by typing the input with JSDoc. Here's an example component with typed `input`:

```marko
// @ts-check

/**
 * @typedef {{
 *   firstName: string,
 *   lastName: string,
 * }} Input
 */

<div>${firstName} ${lastName}</div>
```

## CI Type Checking

For type checking Marko files outside of your editor there is the [`@marko/type-check` cli](https://github.com/marko-js/language-server/tree/main/packages/type-check). See the CLI documentation for more information.

## Profiling Performance

The [`--generateTrace`](https://www.typescriptlang.org/tsconfig/#generateTrace) flag can be used to determine the parts of a codebase which are using the most resources during type checking.

```sh
mtc --generateTrace TRACE_DIR
```
