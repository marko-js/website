# 言語リファレンス

Markoは、[整形式](https://en.wikipedia.org/wiki/Well-formed_document) HTMLのスーパーセットです。

この言語は、制御フローとリアクティブデータバインディングでHTMLを拡張しながら、HTMLをより厳密にします。これは、JavaScript構文機能をHTMLとメッシュし、独自のいくつかの新しい構文を導入することで実現します。ほとんどのHTMLは有効なMarkoですが、いくつかの重要な相違点があります。

## 構文凡例

<div class="code-block">
<pre class="html html-ts"><code><a href="#statements">import "...";</a>
&lt;<a href="#tags">tag</a>|...<a href="#tag-parameters">params</a>|/<a href="#tag-variables">var</a> ...<a href="#attributes">attrs</a>&gt;
  <a href="#tag-content">content</a> with <a href="#dynamic-text">&#36;{placeholders}</a>
  &lt;<a href="#attribute-tags">@attr-tags</a>/&gt;
&lt;/&gt;</code></pre>
<pre class="concise concise-ts"><code><a href="#statements">import "...";</a>
<a href="#tags">tag</a>|...<a href="#tag-parameters">params</a>|/<a href="#tag-variables">var</a> ...<a href="#attributes">attrs</a>
  -- <a href="#tag-content">content</a> with <a href="#dynamic-text">&#36;{placeholders}</a>
  <a href="#attribute-tags">@attr-tag</a></code></pre>
</div>

> [!NOTE]
> 構文をクリックすることで、そのセクションにジャンプできます。
> 凡例は包括的ではありません。詳細については、以下を参照してください:
>
> - [`<${dynamic}/>`タグ](#dynamic-tags)
> - さまざまな属性省略記法については[属性](#attributes)
> - 属性の代替としての[タグ引数](#tag-arguments)
> - [簡潔モード](./concise-syntax.md)

## テンプレート変数

Markoテンプレート内では、いくつかの変数が自動的に利用可能になります。

### `input`

すべてのテンプレートでグローバルに利用可能なJavaScriptオブジェクトで、[カスタムタグ](./custom-tag.md)から提供された[属性](#attributes)または[トップレベルAPI](./template.md)を通じて渡されたデータへのアクセスを提供します。

### `$signal`

[`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)は、`.marko`ファイル内のすべてのJavaScriptステートメント、式、およびブロックで利用できます。

これは以下の場合に中止されます

1. 式が無効化されたとき
2. テンプレートまたは[タグコンテンツ](#tag-content)がDOMから削除されたとき

これは主に副作用のクリーンアップを処理するためのものです。

> [!TIP]
> [`addEventListener()`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#signal)などの多くの組み込みAPIには、クリーンアップのためにシグナルを渡すオプションが含まれています。
>
> ```marko
> <script>
>   document.addEventListener("resize", () => {
>     // この関数は自動的にクリーンアップされます
>   }, { signal: $signal })
> </script>
> ```

### `$global`

[トップレベルAPI](./template.md)を通じて提供される[「レンダーグローバル」](./template.md#inputglobal)へのアクセスを提供します。

## ステートメント

Markoは、モジュールスコープのトップレベルステートメントをいくつかサポートしています。

### `import`

JavaScriptの[`import`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)ステートメントは、テンプレートのルートで使用できます。

```marko
import sum from "sum"

<div data-number=sum(1, 2)></div>
```

> [!NOTE]
> この構文は[`static import`](#static)の省略形です。サーバーとクライアント固有のインポートについては、[`server`と`client`](#server-and-client)ステートメントを使用できます。

#### タグ`import`省略記法

[カスタムタグ](./custom-tag.md)は、インポートの`from`で山括弧を使用して参照でき、Markoの[カスタムタグ検出ロジック](./custom-tag.md)が使用されます。

```marko
import MyTag from "<my-tag>"

<MyTag/>
```

### `export`

JavaScriptの[`export`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export)ステートメントは、テンプレートのルートで使用できます。

```marko
export function getAnswer() {
  return 42;
}

<div>${getAnswer()}</div>
```

### `static`

`static`を接頭辞に持つステートメントは、モジュールスコープでJavaScript式を実行できます。このステートメントは、テンプレートがサーバーとブラウザで読み込まれたときに実行されます。

```marko
static const answer = 41;
static function getAnswer() {
  return answer + 1;
}

<div data-answer=getAnswer()></div>
```

関数、宣言、条件、ブロックを含む、すべての有効なJavaScriptステートメントが使用できます。

```marko
static {
  console.log("this will be logged only ONE time");
  console.log("no matter how often the component is used");
  console.log("or how many requests are made to the server");
}
```

### `server`と`client`

[`static`](#static)の代わりに、`server`または`client`を接頭辞に持つステートメントを使用すると、テンプレートが特定の環境（サーバーまたはブラウザ）で読み込まれたときにのみ実行される、任意のモジュールスコープのJavaScript式を記述できます。

```marko
server console.log("on the server")

client console.log("in the browser")
```

関数、宣言、条件、ブロックを含む、すべての有効なJavaScriptステートメントが使用できます。

```marko
server {
  import { connectToDatabase } from './database';
  const db = connectToDatabase();

  console.log('Database connection established on server');

  // Only happens ONCE, when the application loads
  // and this component is used for the first time
  const users = await db.query('SELECT * FROM users');
  console.log(`Found ${users.length} users in the database`);
}
```

> [!TIP]
> [`import`](#import)ステートメントは実際には`static import`のショートカットです。モジュールを1つのプラットフォームでのみインポートしたい場合は、`server`と`client`でこれを活用できます
>
> ```marko
> server import "./init-db"
> client import "bootstrap"
> ```

## タグ

Markoは、すべてのネイティブHTML/SVG/その他のタグと属性をサポートしています。これらに加えて、便利な[コアタグ](./core-tags.md)のセットが提供されています。各プロジェクトには独自の[カスタムタグ](./custom-tag.md)があり、サードパーティのタグは`node_modules`を通じて含めることができます。

これらすべてのタイプのタグは同じ構文を使用します：

```marko
<my-tag/>
```

`.marko`ファイルは[カスタムタグ](./custom-tag.md)として[自動的に検出](./custom-tag.md#custom-tag-discovery)されます（`import`は不要です）。

すべてのタグは、[コンテンツ](#tag-content)がない場合、[自己閉じタグ](https://developer.mozilla.org/en-US/docs/Glossary/Void_element#self-closing_tags)にできます。これは、HTMLとは異なり、`<div/>`が有効であることを意味します。さらに、`<input>`や`<br>`のような[`void`タグ](https://developer.mozilla.org/en-US/docs/Glossary/Void_element)も[自己閉じタグ](https://developer.mozilla.org/en-US/docs/Glossary/Void_element#self-closing_tags)にできます。

すべての閉じタグでは、タグ名を省略できます。

```marko
<div>Hello World</>
```

## 属性

属性値はJavaScript式です：

```marko
<my-tag str="Hello"></my-tag>
<my-tag str=`Hello ${name}`></my-tag>
<my-tag num=1 + 1></my-tag>
<my-tag date=new Date()></my-tag>
<my-tag fn=function myFn(param1) { console.log("hi") }></my-tag>
```

ほぼすべての有効なJavaScript式を属性値として記述できます。
`<my-tag str="Hello">`の場合でも、`"Hello"`文字列はJavaScript文字列リテラルであり、HTML属性文字列ではありません。

属性は、Markoではタグに渡されるJavaScriptオブジェクトと考えることができます。

> [!CAUTION]
> 値には、括弧で囲まれていない`>`を含めることはできません（曖昧になるため）。これらの式は括弧を使用する必要があります：
>
> ```marko
> <my-tag value=(1 > 2)></my-tag>
> ```

### スキップされる属性

属性値が`null`、`undefined`、または`false`の場合、HTMLに書き込まれません。

> [!NOTE]
> _すべての_[falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy)値がスキップされるわけではありません。`0`、`NaN`、`""`は引き続き書き込まれます。

### 真偽値属性

[HTMLの真偽値属性](https://developer.mozilla.org/en-US/docs/Glossary/Boolean/HTML)はJavaScriptの真偽値になります。

```marko
<input type="checkbox" checked>
<input type="checkbox" checked=true>
```

> [!IMPORTANT]
>
> [ARIA列挙属性](https://developer.mozilla.org/en-US/docs/Glossary/Enumerated#aria_enumerated_attributes)は真偽値の代わりに文字列を使用するため、必ず文字列を渡してください。
>
> ```marko
> // ❌ 間違い：これはしないでください
> <button aria-pressed=isPressed />
> // outputs <button aria-pressed=""/>
> ```
>
> ```marko
> // 👍 正しいaria属性の使用
> <button aria-pressed=isPressed && "true" />
> // outputs <button aria-pressed="true"/>
> ```

### スプレッド属性

属性は、[スプレッド](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#spread_in_object_literals)構文を使用して動的に含めることができます。

```marko
<my-tag ...input foo="bar"/>
```

この場合、`<my-tag>`は`{ ...input, foo: "bar" }`のようなオブジェクトとして属性を受け取ります。

属性は左から右にマージされ、競合がある場合は後のスプレッドが前のものを上書きします。

> [!NOTE]
> `...`の後の値は（[JavaScriptと同様に](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#spread_in_object_literals)）任意の有効なJavaScript式を使用できます。つまり、省略記法のプロパティ名を活用できます：
>
> ```marko
> <my-tag ...{ property }/>
> ```

### メソッド省略記法

[メソッド定義](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions)を使用すると、イベントハンドラなどの関数を属性として渡す簡潔な方法が提供されます。

```marko
<button onClick(e) { console.log(e.target) }>Click Me</button>
```

### 変更ハンドラ省略記法（双方向バインディング）

変更ハンドラ省略記法（`:=`）は、属性の値と、属性名に「Change」をサフィックスとして付けた変更ハンドラの両方を提供します。

値は[識別子](https://developer.mozilla.org/en-US/docs/Glossary/Identifier)または[プロパティアクセサ](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors)である必要があります。

[識別子](https://developer.mozilla.org/en-US/docs/Glossary/Identifier)の場合、変更ハンドラは代入を伴う関数に展開されます。

```marko
<counter value:=count/>

// desugars to

<counter value=count valueChange(newCount) { count = newCount }/>
```

[プロパティアクセサ](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors)の場合、変更ハンドラは`Change`サフィックスを持つメンバー式に展開されます。

```marko
<counter value:=input.count/>

// desugars to

<counter value=input.count valueChange=input.countChange/>
```

### `class`と`id`の省略記法

[Emmetスタイル](https://docs.emmet.io/abbreviations/syntax/#id-and-class)の`class`と`id`属性の省略記法がサポートされています。

```marko no-format
<div#foo.bar.baz/>

// same as

<div id="foo" class="bar baz"/>
```

> [!TIP]
> 動的なclass/id内で補間がサポートされています。
>
> ```marko no-format
> <div.icon-${iconName}/>
> ```

### `value`の省略記法

タグが単一の入力プロパティを使用することは一般的です。そのため、Markoは`value`という名前の属性を渡すための省略記法を提供しています。タグの先頭で属性名を省略すると、`value`として渡されます。

```marko
<my-tag=1/>

// desugars to

<my-tag value=1/>
```

[メソッド省略記法](#shorthand-methods)は、value属性と組み合わせることができ、_valueメソッド省略記法_を提供します。

```marko
<my-tag() {
  console.log("Hello JavaScript!");
}/>

// desugars to

<my-tag value=function () {
  console.log("Hello JavaScript!");
}/>

// Received by the child as { value() { ... } }
```

### 属性の終端

属性はカンマで終端できます。これは[簡潔モード](./concise-syntax.md#attributes-on-multiple-lines)で便利です。

```marko
<my-tag a=1, b=2/>
```

> [!CAUTION]
> [カンマ演算子](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Comma_operator)を使用したシーケンス式は括弧で囲む必要があります
>
> ```marko
> <my-tag a=(console.log(foo), foo)/>
> ```

## タグコンテンツ

タグの本体内のマークアップは、[`input`](#input)の`content`プロパティとして利用可能になります。

```marko
<my-tag>Content</my-tag>
```

上記の`<my-tag>`の実装は、`input.content`を[動的タグ](#dynamic-tags)に渡すことでコンテンツを書き出すことができます：

```marko
export interface Input {
  content: Marko.Body;
}

<div>
  <${input.content}/>
</div>
```

### 動的テキスト

動的テキストコンテンツは、タグコンテンツ内で`${補間}`できます。これはJavaScriptの[テンプレートリテラル](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)と同じ構文を使用します。

```marko
export interface Input {
  name: string;
}

<div>
  Hello ${input.name}
</div>
```

> [!NOTE]
> 補間された値は、[XSS](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS)を回避するために自動的にエスケープされます。

## 属性タグ

`@`で始まるタグはレンダリングされず、代わりに[`input`](./language.md#input)の属性と一緒に渡されます。属性タグは、名前付きまたは繰り返しの[コンテンツ](#tag-content)を追加の属性として渡すことができます。

```marko
<my-layout title="Welcome">
  <@header class="foo">
    <h1>Big things are coming!</h1>
  </@header>

  <p>Lorem ipsum...</p>
</my-layout>
```

ここで、`@header`は`<my-layout>`に`input.header`として利用可能です。`@header`の`class`属性は`input.header.class`に、そのコンテンツは`input.header.content`にあります。

この例で`<my-tag>`に提供される完全な[input](./language.md#input)オブジェクトは次のようになります：

```js
// a representation of `input` received by `my-layout.marko` (from the previous code snippet)
{
  title: "Welcome",
  header: {
    class: "foo",
    content: /* <h1>Big things are coming!</h1> */,
  },
  content: /* <p>Lorem ipsum...</p> */,
}
```

`my-layout.marko`の実装は次のようになります

```marko
export interface Input {
  title: string;
  header: Marko.AttrTag<{
    class: string;
    content: Marko.Body;
  }>;
  content: Marko.Body;
}

<!doctype html>
<html>
  <head>
    <title>${input.title}</title>
  </head>
  <body>
    <header
      // use the class from `@header`
      class=input.header.class
    >
      <img src="./logo.svg" alt="...">
      // render the content of `@header`
      <${input.header.content}/>
    </header>

    <main>
      // render the main tag content
      <${input.content}/>
    </main>

    <footer>
      Copyright ♾️
    </footer>
  </body>
</html>
```

> [!NOTE]
> 制御フロータグ（[`<if>`](./core-tag.md#if--else)と[`<for>`](./core-tag.md#for)）自体は属性タグを含めることができず、代わりに[属性タグを動的に作成](#conditional-attribute-tags)するために使用されます。

### ネストされた属性タグ

属性タグは他の属性タグ内にネストできます。

```marko
<my-tag>
  <@a value=1>
    <@b value=2/>
  </>
</>
```

これは次のような入力を提供します

```js
{
  a: {
    value: 2,
    b: { value: 2 }
  }
}
```

### 繰り返し属性タグ

複数の属性タグが名前を共有する場合、すべてのインスタンスは[イテラブルプロトコル](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol)を使用して消費できます。

```marko
<my-menu>
  <@item value="foo">
    Foo Item
  </@item>

  <@item value="bar">
    Bar Item
  </@item>
</my-menu>
```

この例では2つの`<@item>`タグを使用していますが、`<my-menu>`は単一の`item`属性のみを受け取ります。

```js
{
  item: {
    value: "foo",
    content: /* Foo Item */,
    [Symbol.iterator]() {
      // Not the exact implementation, but essentially this is what the function contains
      yield* [
        { value: "foo", content: /* Foo Item */ },
        { value: "bar", content: /* Bar Item */ }
      ];
    }
  }
}
```

他の`<@item>`タグはイテレータを通じてアクセスされます。最も一般的な方法は、[forタグ](./core-tag.md#for)またはJavaScriptの[イテラブルの構文](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#syntaxes_expecting_iterables)のいずれかを使用することです。

```marko
/* my-menu.marko */
export interface Input {
  item?: Marko.AttrTag<{
    value: string;
    content: Marko.Body;
  }>;
}

<for|item| of=input.item>
  Value: ${item.value}
  <${item.content}/>
</for>
```

属性タグは、繰り返される場合でも、一般的に名前は単数形です。繰り返し属性タグを消費する場合は、単数形のプロパティ名を使用してください（例：`input.items`ではなく`input.item`を反復処理します）。

> [!TIP]
> 繰り返し属性タグをリストとして必要とする場合、[`<const>`タグ](./core-tag.md#const)を使用して配列にスプレッドするのが一般的なパターンです
>
> ```marko
> export interface Input {
>   item?: Marko.AttrTag<{}>;
> }
>
> <const/items=[...input.item || []]>
>
> <div>${items.length}</div>
> ```

### 条件付き属性タグ

属性タグは通常、直接の親に直接提供されます。これの例外は制御フロータグ（[`<if>`](./core-tag.md#if--else)と[`<for>`](./core-tag.md#for)）で、これらは属性タグを動的に適用するために使用されます。

```marko
<my-message>
  <if=welcome>
    <@title>Hello</>
  </if>
  <else>
    <@title>Good Bye</>
  </else>
</my-message>
```

この場合、`<my-message>`が受け取る`@title`は`welcome`に依存します。

```marko
<my-select>
  <@option>None</@option>

  <for|opt| of=["a", "b", "c"]>
    <@option>${opt}</>
  </for>
</my-select>
```

ここでは、`<my-select>`は最初の`@option`を無条件に受け取り、`<for>`ループによって適用されるすべての`@option`タグも受け取ります。

> [!NOTE]
> [制御フロータグ](./core-tag.md#if--else)内では、[属性タグ](#attribute-tags)をデフォルトの[コンテンツ](#tag-content)と混在させることはできません。

## タグ変数

タグ変数は、テンプレート内で使用するためにタグから値を公開します（カスタムタグからは、変数はその[`<return>`](./core-tag.md#return)から取得されます）。これらの変数は、[Markoのコンパイル済みリアクティビティ](./reactivity.md)を強化するために使用されるため、JavaScript変数とは_まったく_同じではありません。

タグ変数は、タグ名の後に`/`と、有効なJavaScript[識別子](https://developer.mozilla.org/en-US/docs/Glossary/Identifier)または[分割代入パターン](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)を続けて使用します。

```marko
<my-tag/foo/>
<my-other-tag/{ bar, baz }/>

<div>`my-tag` returned ${foo}</div>
<div>`my-other-tag` returned an object containing ${bar} and ${baz}</div>
```

ネイティブタグには、要素への参照を含む暗黙的に返されるタグ変数があります。

```marko
<div/myDiv/>

<script>
  myDiv().innerHTML = "Hello";
</script>
```

この場合、`myDiv`はブラウザで`myDiv`要素を取得するために呼び出すことができる変数になります。

[コア`<return>`タグ](./core-tag.md#return)を使用すると、任意のカスタムタグがタグ変数として親スコープに値を返すことができます。

### スコープ

タグ変数は自動的に[ホイスト](https://developer.mozilla.org/en-US/docs/Glossary/Hoisting)され、[モジュールステートメント](#statements)を除くテンプレート内のどこからでもアクセスできます。つまり、ツリー内のどこからでもタグ変数を読み取ることができます。

```marko
<form>
  <input/myInput/>
</form>

<script>
  // still available even though it's nested in another tag.
  console.log(myInput())
</script>
```

## タグパラメータ

[コンテンツ](#tag-content)をレンダリングする間、子はタグパラメータを使用して親に情報を_返す_ことができます。

```marko
/* child.marko */
export interface Input {
  content: Marko.Body<[{ number: number }]>;
}

<div>
  <${input.content} number=1337 />
</div>
```

```marko
/* parent.marko */
<child|params|>
  Rendered with ${params.number} as the `number=` attribute.
</child>
```

この例は次のHTMLを生成します：

```html
<div>Rendered with 1337 as the `number=` attribute</div>
```

`|parameters|`はタグ名の後にパイプで囲まれており、機能的には[JavaScript関数パラメータ](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions#function_parameters)のように動作します。最初のパラメータは子コンポーネントから渡されたすべての属性を含むオブジェクトです。

> [!TIP]
> パラメータには[JavaScript関数パラメータ構文](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions#function_parameters)のすべての機能が含まれているため、自由に分割できます。
>
> ```marko
> <child|{ number }|>
>   Rendered with ${number} as the `number=` attribute.
> </child>
> ```

### タグ引数

複数の[タグパラメータ](#tag-parameters)は、タグ名の後にJavaScriptの`(...args)`構文を使用するタグ引数構文を使用してコンテンツに提供できます。

```marko
export interface Input {
  content: Marko.Body<[number, number, number]>;
}

<${input.content}(1, 2, 3)/>
```

この例は、3つの引数を親に返します。

```marko
<my-tag|a, b, c|>
  Sum ${a + b + c}
</my-tag>

// spreads work also!
<my-tag|...all|>
  Sum ${all.reduce((a, b) => a + b, 0)}
</my-tag>
```

> [!WARNING]
> タグコンテンツは属性_または_引数を使用できますが、両方を同時に使用することはできません。
>
> ```marko
> <my-tag a=1 b=2 c=3 />
> // identical to
> <my-tag({ a: 1, b: 2, c: 3 })/>
> ```

### スコープ

タグパラメータは[タグコンテンツ](#tag-content)のみにスコープされます。
これは、タグの本体の外側ではタグパラメータにアクセスできないことを意味します。

> [!CAUTION]
> タグパラメータは属性として評価されるため、[属性タグ](#attribute-tags)からアクセスすることはできません。

## コメント

[HTML](https://developer.mozilla.org/en-US/docs/Web/HTML/Comments)と[JavaScript](https://developer.mozilla.org/en-US/docs/Web/API/Comment)の両方のコメントがサポートされています。

```marko
<div>
  <!-- html comments -->
  // JavaScript line comments
  /** JavaScript block comments */
</div>
```

> [!NOTE]
> コメントは完全に無視されます。出力にリテラルHTMLコメントを含めるには、[`<html-comment>`コアタグ](./core-tag.md#html-comment)を使用してください。

## 動的タグ

タグ名の代わりに、`${補間}`を使用して[ネイティブタグ](./native-tag.md)、[カスタムタグ](./custom-tag.md)、または[タグコンテンツ](#tag-content)を動的に出力できます。

動的タグの場合、閉じタグは`</>`にする必要があります。または、[コンテンツ](#tag-content)がない場合は、タグを自己閉じにすることができます。

### 動的ネイティブタグ

動的タグ名の値が文字列の場合、

```marko
export interface Input {
  headingSize: 1 | 2 | 3 | 4 | 5 | 6;
}

// Dynamically output a native tag.
<${"h" + input.headingSize}>Hello!</>
```

### 動的カスタムタグ

```marko
// Dynamically output a custom tag.
import MyTagA from "<my-tag-a>"
import MyTagB from "<my-tag-b>"
<${Math.random() > 0.5 ? MyTagA : MyTagB}/>
```

> [!CAUTION]
> 文字列は_常に_ネイティブタグをレンダリングします。カスタムタグをレンダリングする場合は、それへの参照が必要です。次の例は上記の例と_同等ではありません_。MarkoはネイティブHTML要素を出力します（`document.createElement("my-tag-a")`を呼び出した場合と同様）。
>
> ```marko
> <${Math.random() > 0.5 ? "my-tag-a" : "my-tag-b"}/>
> ```

> [!NOTE]
> `content`プロパティを持つオブジェクトが提供されると、`content`値が動的タグ名になります。これは[define](./core-tag.md#define)タグが内部でどのように動作するかです🤯。
>
> ```marko
> <define/message>
>   Hello World
> </define>
> <${message}/>
> ```
>
> ただし、この場合は代わりに[PascalCase](#pascalcase-variables)の`<Message>`タグを使用することをお勧めします。

### 条件付き親タグ

動的タグ名が[falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy)の場合、タグの[コンテンツ](#tag-content)のみを出力します。これは、条件付き親とフォールバックコンテンツに便利です。

```marko
export interface Input {
  href: string;
}

// Only wrap the text with an anchor when we have an `input.href`.
<${input.href && "a"} href=input.href>Hello World</>
```

### PascalCase変数

大文字で始まるローカル変数名（`PascalCase`）は、明示的な動的タグ構文なしでタグ名として使用することもできます。これは、インポートされたカスタムタグを参照する場合や[`<define>`タグ](./core-tag.md#define)を使用する場合に便利です。

```marko
import MyTag from "./my-tag.marko"

<MyTag/>
```

これは次と同等です

```marko
import MyTag from "./my-tag.marko"

<${MyTag}/>
```
