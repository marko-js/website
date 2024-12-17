# TypeScript

Marko’s TypeScript support offers in-editor error checking, makes refactoring less scary, verifies that data matches expectations, and even helps with API design.

## Enabling TypeScript in your Marko project

There are two (non-exclusive) ways to add TypeScript to a Marko project:

- **For sites and web apps**, [a `tsconfig.json` file](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) at the project root is the only requirement:
  <pre>
  📁 tags/
  📁 node_modules/
  <img src="https://raw.githubusercontent.com/marko-js/marko/main/packages/marko/docs/icons/marko.svg" width=16> index.marko
  📦 package.json
  <mark><img src="https://raw.githubusercontent.com/marko-js/marko/main/packages/marko/docs/icons/ts.svg" width=16> tsconfig.json</mark>
  </pre>
- **For [packages of Marko tags](https://markojs.com/docs/custom-tags/#publishing-tags-to-npm)**, the `"script-lang"` attribute must be set to `"ts"` in [the `marko.json`](./marko-json.md):
  ```json
  "script-lang": "ts"
  ```
  This will automatically expose type-checking and autocomplete for the published tags.

> [!TIP]
> You can also use the `script-lang` method for sites and apps.
> Marko will crawl up the directory looking for a `marko.json` with `script-lang` defined.
> This helps when incrementally migrating to TypeScript allowing folders to opt-in or opt-out of strict type checking.

## Typing a tag's `input`

A `.marko` file will use any exported `Input` type for [that file’s `input` object](./language.md#input).

This can be `export type Input` or `export interface Input`.

### Example

_PriceField.marko_

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

$ const instanceFn = (val: T) => {
  // can use `T` here
}

// can use `as T` here
<select on-input(evt => input.onSelect(options[evt.target.value] as T))>
  <for|value, i| of=input.options>
    <option value=i>${value}</option>
  </for>
</select>
```

## Built-in Marko Types

Marko exposes common [type definitions](https://github.com/marko-js/marko/blob/main/packages/marko/index.d.ts) through the `Marko` [TypeScript namespace](https://www.typescriptlang.org/docs/handbook/namespaces.html):

- **`Marko.Template<Input, Return>`**
  - The type of a `.marko` file
  - `typeof import("./template.marko")`
- **`Marko.TemplateInput<Input>`**
  - The object accepted by the render methods of a template. It includes the template's `Input` and `$global` values.
- **`Marko.Body<Params, Return>`**
  - Used to type [tag content](./language.md#tag-content)
- **`Marko.Renderable`**
  - All values accepted by the [`<${dynamic}/>` tag](./language.md#dynamic-tags)
  - `string | Marko.Template | Marko.Body | { content: Marko.Body}`
- **`Marko.Global`**
  - The type of [the `$global` object](./language.md#global)
- **`Marko.RenderResult`**
  - The result of [rendering a Marko template](./template.md#templaterenderinput)
  - `ReturnType<template.renderSync>`
  - `Awaited<ReturnType<template.render>>`
- **`Marko.NativeTags`**
  - `Marko.NativeTags`: An object containing all [native tags](./native-tag.md) and their types
- **`Marko.Input<TagName>`** and **`Marko.Return<TagName>`**
  - Helpers to extract the input and return types from native tags (when a string is passed) or custom tags.
- **`Marko.BodyParameters<Body>`** and **`Marko.BodyReturnType<Body>`**
  - Helper to extract the parameters and return types from a `Marko.Body`
- **`Marko.AttrTag<T>`**
  - Used to represent types for [attributes tags](./language.md#attribute-tags)
  - A single attribute tag, with a `[Symbol.iterator]` to consume any repeated tags

### Deprecated

- **`Marko.Component<Input, State>`**
  - The base class for a [class component](https://markojs.com/v5/docs/class-components/#class-components)
- **`Marko.Out`**
  - The render context with methods like `write`, `beginAsync`, etc.
  - `ReturnType<template.render>`
- **`Marko.Emitter`**
  - `EventEmitter` from `@types/node`

### Typing `content`

A commonly used type from the `Marko` namespace is `Marko.Body` which can be used to type the [content](./language.md#tag-content) in `input.content`:

_child.marko_

```marko
export interface Input {
  content?: Marko.Body;
}
```

Here, all of the following are acceptable:

_index.marko_

```marko
<child/>
<child>Text in render body</child>
<child>
  <div>Any combination of components</div>
</child>
```

Passing other values (including components) causes a type error:

_index.marko_

```marko
import OtherTag from "<other-tag>";
<child content=OtherTag/>
```

#### Typing Tag Parameters

Tag parameters are provided to the `content` by the child tag. For this reason, `Marko.Body` allows typing of its parameters:

_for-by-two.marko_

```marko
export interface Input {
  to: number;
  content: Marko.Body<[number]>
}

<for|i| from=0 to=input.to by=2>
  <${input.content}(i)/>
</for>
```

_index.marko_

```marko
<for-by-two|i| to=10>
  <div>${i}</div>
</for-by-two>
```

### Typing Attribute Tags

All attribute tags are typed as iterable with a `[Symbol.iterator]`, regardless of intent. This means all attribute tag inputs must be wrapped in `Marko.AttrTag`.

_my-select.marko_

```marko
export interface Input {
  option: Marko.AttrTag<Marko.Input<"option">>
}

<select>
  <for|option| of=input.option>
    <option ...option/>
  </for>
</select>
```

### Extending native tag types within a Marko tag

The types for native tags are accessed via the global `Marko.Input` type. Here's an example of a component that extends the `button` html tag:

_color-button.marko_

```marko
export interface Input extends Marko.Input<"button"> {
  color: string;
  content?: Marko.Body;
}

$ const { color, ...attrs } = input;

<button style=`color: ${color}` ...attrs>
  <content/>
</button>
```

### Registering a new native tag (e.g. for custom elements).

```ts
interface MyCustomElementAttributes {
  // ...
}

declare global {
  namespace Marko {
    interface NativeTags {
      // By adding this entry, you can now use `my-custom-element` as a native html tag.
      "my-custom-element": MyCustomElementAttributes;
    }
  }
}
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

### Registering CSS Properties (eg for custom properties)

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

_components/child.marko_

```marko
export interface Input<T> {
  value: T;
}
```

_index.marko_

```marko
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

# JSDoc Support

For existing projects that want to incrementally add type safety, adding full TypeScript support is a big leap. This is why Marko also includes full support for [incremental typing via JSDoc](https://www.typescriptlang.org/docs/handbook/intro-to-js-ts.html).

## Setup

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

# CI Type Checking

For type checking Marko files outside of your editor there is the ["@marko/type-check" cli](https://github.com/marko-js/language-server/tree/main/packages/type-check).
Check out the CLI documentation for more information.
