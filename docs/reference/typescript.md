# TypeScript

MarkoのTypeScriptサポートは、エディタ内でのエラーチェック、リファクタリングの不安軽減、データが期待通りであることの検証、さらにはAPI設計の支援を提供します。

## MarkoプロジェクトでTypeScriptを有効にする

Markoプロジェクトに TypeScript を追加するには、2つの（排他的でない）方法があります:

- **サイトやWebアプリの場合**、プロジェクトルートに[`tsconfig.json`ファイル](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)を置くだけです:

  ```
  src/
  package.json
  tsconfig.json
  ```

- **[Markoタグのパッケージ](https://markojs.com/docs/custom-tags/#publishing-tags-to-npm)の場合**、[`marko.json`](./marko-json.md)内で`"script-lang"`属性を`"ts"`に設定する必要があります:

  ```json
  /* marko.json */
  {
    "script-lang": "ts"
  }
  ```

  これにより、公開されたタグの型チェックとオートコンプリートが自動的に公開されます。

> [!TIP]
> サイトやアプリでも`script-lang`メソッドを使用できます。
>
> Markoは、`script-lang`が定義された`marko.json`を探してディレクトリを上方向にクロールします。
>
> これは、TypeScriptに段階的に移行する際に、フォルダごとに厳密な型チェックをオプトインまたはオプトアウトできるため役立ちます。

## `input`の型付け

`.marko`ファイルは、[そのファイルの`input`オブジェクト](./language.md#input)に対してエクスポートされた`Input`型を使用します。

これは`export type Input`または`export interface Input`にできます。

### 例

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

エクスポートされているため、`Input`は他の`.marko`および`.ts`ファイルからアクセスできます:

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

### ジェネリック`Input`

`Input`の[ジェネリック型と型パラメータ](https://www.typescriptlang.org/docs/handbook/2/generics.html)は、`.marko`テンプレート全体で認識されます（[staticステートメント](./language.md#static)を除く）。

```marko
export interface Input<T> {
  options: T[];
  onSelect: (newVal: T) => unknown;
}

static function staticFn() {
  // ここでは`T`を使用できません
}

<const/instanceFn(val: T) {
  // ここでは`T`を使用できます
}/>

// ここでは`as T`を使用できます
<select onInput(evt) { input.onSelect(options[evt.target.value] as T) }>
  <for|value, i| of=input.options>
    <option value=i>${value}</option>
  </for>
</select>
```

## 組み込みMarko型

Markoは、`Marko` [TypeScript名前空間](https://www.typescriptlang.org/docs/handbook/namespaces.html)を通じて一般的な[型定義](https://github.com/marko-js/marko/blob/main/packages/marko/index.d.ts)を公開しています:

- **`Marko.Template<Input, Return>`**
  - `.marko`ファイルの型
  - `typeof import("./template.marko")`
- **`Marko.TemplateInput<Input>`**
  - テンプレートのrenderメソッドが受け入れるオブジェクト。テンプレートの`Input`と`$global`値を含みます。
- **`Marko.Body<Params, Return>`**
  - [タグコンテンツ](./language.md#tag-content)を型付けするために使用されます
- **`Marko.Renderable`**
  - [`<${dynamic}/>`タグ](./language.md#dynamic-tags)が受け入れるすべての値
  - `string | Marko.Template | Marko.Body | { content: Marko.Body}`
- **`Marko.Global`**
  - [`$global`オブジェクト](./language.md#global)の型
- **`Marko.RenderResult`**
  - [Markoテンプレートのレンダリング](./template.md#templaterenderinput)の結果
  - `ReturnType<template.renderSync>`
  - `Awaited<ReturnType<template.render>>`
- **`Marko.NativeTags`**
  - `Marko.NativeTags`: すべての[ネイティブタグ](./native-tag.md)とその型を含むオブジェクト
- **`Marko.Input<TagName>`**と**`Marko.Return<TagName>`**
  - ネイティブタグ（文字列が渡された場合）またはカスタムタグから入力と戻り値の型を抽出するヘルパー
- **`Marko.BodyParameters<Body>`**と**`Marko.BodyReturnType<Body>`**
  - `Marko.Body`からパラメータと戻り値の型を抽出するヘルパー
- **`Marko.AttrTag<T>`**
  - [属性タグ](./language.md#attribute-tags)の型を表すために使用されます
  - 繰り返しタグを消費するための`[Symbol.iterator]`を持つ単一の属性タグ

### 非推奨

- **`Marko.Component<Input, State>`**
  - [クラスコンポーネント](https://markojs.com/v5/docs/class-components/#class-components)の基底クラス
- **`Marko.Out`**
  - `write`、`beginAsync`などのメソッドを持つレンダーコンテキスト
  - `ReturnType<template.render>`
- **`Marko.Emitter`**
  - `@types/node`の`EventEmitter`

### `content`の型付け

`Marko`名前空間からよく使用される型は`Marko.Body`で、`input.content`の[コンテンツ](./language.md#tag-content)を型付けするために使用できます:

```marko
/* child.marko */
export interface Input {
  content?: Marko.Body;
}
```

ここでは、以下のすべてが許容されます:

```marko
/* index.marko */
<child/>
<child>Text in render body</child>
<child>
  <div>Any combination of components</div>
</child>
```

他の値（コンポーネントを含む）を渡すと型エラーが発生します:

```marko
/* index.marko */
import OtherTag from "<other-tag>";
<child content=OtherTag/>
```

#### タグパラメータの型付け

タグパラメータは、子タグによって`content`に提供されます。このため、`Marko.Body`はそのパラメータの型付けを可能にします:

```marko
/* for-by-two.marko */
export interface Input {
  to: number;
  content: Marko.Body<[number]>
}

<for|i| from=0 to=input.to by=2>
  <${input.content}(i)/>
</for>
```

```marko
/* index.marko */
<for-by-two|i| to=10>
  <div>${i}</div>
</for-by-two>
```

### 属性タグの型付け

すべての属性タグは、意図に関係なく`[Symbol.iterator]`を持つイテラブルとして型付けされます。これは、すべての属性タグ入力が`Marko.AttrTag`でラップされる必要があることを意味します。

```marko
/* my-select.marko */
export interface Input {
  option: Marko.AttrTag<Marko.Input<"option">>
}

<select>
  <for|option| of=input.option>
    <option ...option/>
  </for>
</select>
```

### Markoタグ内でネイティブタグ型を拡張する

ネイティブタグの型は、グローバル`Marko.Input`型を介してアクセスされます。以下は、`button` HTMLタグを拡張するコンポーネントの例です:

```marko
/* color-button.marko */
export interface Input extends Marko.Input<"button"> {
  color: string;
  content?: Marko.Body;
}

$ const { color, ...attrs } = input;

<button style=`color: ${color}` ...attrs>
  <content/>
</button>
```

### 新しいネイティブタグの登録（例: カスタム要素用）

```ts
interface MyCustomElementAttributes {
  // ...
}

declare global {
  namespace Marko {
    interface NativeTags {
      // このエントリを追加することで、`my-custom-element`をネイティブHTMLタグとして使用できるようになります。
      "my-custom-element": MyCustomElementAttributes;
    }
  }
}
```

### 新しい「グローバル」HTML属性の登録

```ts
declare global {
  namespace Marko {
    interface HTMLAttributes {
      "my-non-standard-attribute"?: string; // この属性をすべてのHTMLタグで利用可能として追加します。
    }
  }
}
```

### CSSプロパティの登録（例: カスタムプロパティ用）

```ts
declare global {
  namespace Marko {
    namespace CSS {
      interface Properties {
        "--foo"?: string; // カスタム`--foo` CSSプロパティのサポートを追加します。
      }
    }
  }
}
```

## `.marko`でのTypeScript構文

MarkoのすべてのJavaScript式は、TypeScript式としても記述できます。

```marko
<my-tag foo=1 as any>
  ${(input.el as HTMLInputElement).value}
</my-tag>
```

### タグ型パラメータ

```marko
<child <T>|value: T|>
  ...
</child>
```

### タグ型引数

```marko
/* components/child.marko */
export interface Input<T> {
  value: T;
}
```

```marko
/* index.marko */
// この場合numberは推論されますが、明示的にすることもできます
<child<number> value=1 />
```

### メソッド省略記法の型パラメータ

```marko
<child process<T>() { /* ... */ } />
```

### 属性の型アサーション

属性値の型は_通常_推論できます。必要に応じて、[TypeScriptの`as`キーワード](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions)を使用して、値をより具体的にアサートできます:

```marko
<some-component
  number=1 as const
  names=[] as string[]
/>
```

## JSDocサポート

型安全性を段階的に追加したい既存のプロジェクトにとって、完全なTypeScriptサポートの追加は大きな飛躍です。このため、Markoは[JSDocによる段階的な型付け](https://www.typescriptlang.org/docs/handbook/intro-to-js-ts.html)の完全なサポートも含んでいます。

### セットアップ

既存の`.marko`ファイルで型チェックを有効にするには、先頭に`// @ts-check`コメントを追加します:

```js
// @ts-check
```

JavaScriptプロジェクトのすべてのMarkoおよびJavaScriptファイルで型チェックを有効にしたい場合は、[`jsconfig.json`](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html#using-tsconfigjson-or-jsconfigjson)の使用に切り替えることができます。ファイルに`// @ts-nocheck`コメントを追加することで、一部のファイルのチェックをスキップできます。

有効になったら、JSDocで入力を型付けすることから始めることができます。以下は、型付けされた`input`を持つコンポーネントの例です:

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

## CI型チェック

エディタの外でMarkoファイルを型チェックするには、[`@marko/type-check` CLI](https://github.com/marko-js/language-server/tree/main/packages/type-check)があります。詳細については、CLIドキュメントを参照してください。

## パフォーマンスプロファイリング

[`--generateTrace`](https://www.typescriptlang.org/tsconfig/#generateTrace)フラグを使用して、型チェック中に最もリソースを使用しているコードベースの部分を特定できます。

```sh
mtc --generateTrace TRACE_DIR
```
