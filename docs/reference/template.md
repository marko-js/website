# テンプレートAPIリファレンス

すべての`.marko`ファイルは、その[デフォルトエクスポート](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export#using_the_default_export)で同じAPIを公開します。
これらのメソッドは、サーバー上でHTML文字列を生成し、ブラウザで[DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)を変更するために使用されます。

## `Template.render(input)`

| パラメータ | デフォルト | 詳細                                                                                                                   |
| :-------- | :------ | :-------------------------------------------------------------------------------------------------------------------- |
| `input`   | `{}`    | テンプレートの[`input`オブジェクト](./language.md#input)。グローバル状態用の[`$global`](#inputglobal)も含めることができます |

**サーバー**で使用する場合、Markoテンプレートの`.render()` APIは、HTML文字列を生成するさまざまな方法を含むオブジェクトを提供します。最初のパラメータは、テンプレート内で利用可能な[`input`](./language.md#input)になります。

### 非同期イテレータ

レンダリング結果には[非同期イテレータ](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_async_iterator_and_async_iterable_protocols)が含まれており、[`for await`ステートメント](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of)を通じて消費できます。

```js
import Template from "./template.marko";

for await (const chunk of Template.render({})) {
  // HTMLチャンクをどこかに送信します。
}
```

### パイプ

レンダリング結果オブジェクトの`.pipe()`メソッドは、HTML文字列を[NodeJS `stream.Writable`](https://nodejs.org/api/stream.html#class-streamwritable)に送信します。

```js
import Template from "./template.marko";
import http from "node:http";

http
  .createServer((req, res) => {
    // レンダリングされたHTMLをサーバーレスポンスにストリーミングします。
    Template.render({}).pipe(res);
  })
  .listen(3000);
```

### ReadableStream

レンダリング結果オブジェクトの`.toReadable()`メソッドは、[WHATWG ReadableStream](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream)を返します。これは、Webワーカーなど、Web APIをサポートする環境で使用できます。

```js
const webHTMLResponse = new Response(Template.render({}).toReadable(), {
  headers: { "content-type": "text/html" },
});
```

### Thenable

レンダリング結果は[thenable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#thenables)であるため、`.then()`、`.catch()`または`.finally()`メソッドは、バッファリングされたHTML文字列で解決される`Promise<string>`を返します。これは、[`await`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)キーワードで暗黙的に処理できます。

```js
const html = await Template.render({});
```

> [!NOTE]
> thenableと`await`を使用することで、Markoのストリーミング機能をオプトアウトすることになります。

#### toString

結果は、可能であればバッファリングされた`html`を同期的に返す`toString()`を実装しています。

```js
const html = Template.render({}).toString();
```

> [!CAUTION]
> 非同期動作（つまり、[`<await>`タグ](./core-tag.md#await)）がある場合、このメソッドはスローします。

## `Template.mount(input, node, position?)`

| パラメータ  | デフォルト     | 詳細                                                                                                                                                                                          |
| :--------- | :------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `input`    | `{}`          | テンプレートの[`input`オブジェクト](./language.md#input)。グローバル状態用の[`$global`](#inputglobal)も含めることができます                                                                      |
| `node`     | `undefined`   | テンプレートがレンダリングされるDOMノードへの参照                                                                                                                                                |
| `position` | `"beforeend"` | `node`に対するテンプレートをレンダリングする場所。値は[Element.insertAdjacentHTML API](https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML#position)に従います |

**ブラウザ/クライアント**で使用する場合、Markoテンプレートの`.mount()` APIは、[リアクティブ](./reactivity.md)なDOMを構築し、指定された`node`と`position`に挿入します。`input`引数は、テンプレート内で利用可能な[`input`](./language.md#input)になります。

```js
template.mount({}, document.body); // bodyに追加します。
```

または、`position`をオーバーライドして

```js
template.mount({}, document.body, "afterbegin"); // bodyの先頭に追加します
```

> [!NOTE]
> `position`の有効な値は、[`insertAdjacentHTML()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML#position)に基づいています:
>
> - `"beforebegin"`: 要素の前
> - `"afterbegin"`: 要素の内側、最初の子の前
> - `"beforeend"`: 要素の内側、最後の子の後
> - `"afterend"`: 要素の後
>
> 要素がこの`<p>`の場合、次のように視覚化できます
>
> ```html
> <!-- "beforebegin" -->
> <p>
>   <!-- "afterbegin" -->
>   existing body content
>   <!-- "beforeend" (デフォルト) -->
> </p>
> <!-- "afterend" -->
> ```

### レンダリング結果

[`.mount()` API](#templatemountinput-node-position)は、構築されたテンプレートとDOMのインスタンスを更新および破棄するために使用されるヘルパーを含むオブジェクトを返します。

```js
const instance = template.mount({ name: "foo" }, document.body);
```

> [!Warning]
> このAPIは、Markoテンプレートを更新/破棄するための推奨される方法では**ありません**。主に、クライアント専用でレンダリングされる環境やテスト中に使用することを目的としています。代わりに、[リアクティブシステム](./reactivity.md)を使用する必要があります。

#### instance.update(input)

`.update()`メソッドは、テンプレートのインスタンスに新しい[`input`](./language.md#input)をリアクティブ更新で提供できます。

```js
instance.update({ name: "bar" });
```

この`input`への更新は同期的に適用されます。

#### instance.destroy()

`.destroy()`メソッドは、すべての[`$signal`](./language.md#signal)を中止させ、インスタンスのクリーンアップを実行します。

```js
instance.destroy();
```

## `input.$global`

テンプレートが[`render`](#templaterenderinput)または[`mount`](#templatemountinput-node-position) APIを介してレンダリングされる場合、`input`オブジェクトは`$global`プロパティを指定でき、これは削除され、レンダリングされたすべての`.marko`テンプレート内で[`$global`](./language.md#global)として使用されます。

`$global`のいくつかのプロパティは、Marko自体によって取得され、事前定義された機能を持っています。

### `$global.signal`

> <code>[AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) | undefined</code>

`signal`が`$global`に含まれている場合、Markoはそれをリッスンし、中止されたときに保留中の非同期レンダリングアクティビティを自動的にクリーンアップします。

これは、たとえば、受信リクエストが中止された後の継続的なレンダリングを防ぐために使用されます。

### `$global.cspNonce`

> `string | undefined`

この値は、有効な[csp nonce](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce)を表す文字列である必要があります。Markoは、テンプレートによってレンダリングされたすべてのアセット（`<script>`、`<style>`など）の`nonce`としてこの値を自動的に設定します。

### `$global.renderId`

> `string | undefined`

`runtimeId`は、同じページに複数のコピーがある場合にランタイムを分離するために使用され、一般的には必要ありません。`@marko/vite`および`@marko/webpack`プラグインが、プロジェクトレベルの`package.json`名に基づいて自動的に提供します。

### `$global.runtimeId`

> `string | undefined`

`renderId`は、異なるサーバーレンダリング（同じランタイムを使用）を分離するために使用され、自動的には設定されません。この値は、`html`のすべてのサーバーレンダリングセグメントが競合を避けるために一意の`renderId`文字列を持つように設定する必要があります。これは、[micro-frame](https://github.com/marko-js/micro-frame)などのソリューションに特に役立ちます。
