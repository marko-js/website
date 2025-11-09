# コアタグ

## `<if>` / `<else>`

`<if>`と`<else>`の制御フロータグは、コンテンツを条件付きで表示したり、[属性タグ](./language.md#attribute-tags)を適用するために使用されます。

`<if>`は、その`value=`属性（[以下で使用される省略記法](./language.md#shorthand-value)）が[truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy)の場合に適用され、`<else>`を後に続けることができます。

`<else>`タグは、`if=`属性として独自の条件を持つことができます。
条件がある場合、`<else>`が適用される前に条件がチェックされ、別の`<else>`を後に続けることができます。

if/elseチェーン内の式は順番に評価されます。

```marko
<if=EXPRESSION>
  Body A
</if>
<else if=ANOTHER_EXPRESSION>
  Body B
</else>
<else>
  Body C
</else>
```

## `<for>`

`<for>`制御フロータグは、イテレーション中にコンテンツを書き込んだり、[属性タグ](./language.md#attribute-tags)を適用したりすることを可能にします。その[コンテンツ](./language.md#tag-content)は、[タグパラメータ](./language.md#tag-parameters)を通じて各イテレーションの情報にアクセスできます。

`<for>`タグは以下を反復処理できます:

- `of=`属性を使用した配列と[イテラブル](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol)

  ```marko
  <for|item, index| of=["a", "b", "c"]>
    ${index}: ${item}
  </for>
  ```

- `in=`属性を使用したオブジェクトのプロパティと値

  ```marko
  <for|key, value| in={a: 1, b: 2, c: 3}>
    ${key}: ${value}
  </for>
  ```

- `until=`、`from=`、`step=`属性を使用した**排他的**な数値の範囲

  ```marko
  <for|num| until=5>${num}</for>
  // 0 1 2 3 4

  <for|num| from=3 until=7>${num}</for>
  // 3 4 5 6

  <for|num| from=2 until=10 step=2>${num}</for>
  // 2 4 6 8
  ```

- `to=`、`from=`、`step=`属性を使用した**包括的**な数値の範囲

  ```marko
  <for|num| to=5>${num}</for>
  // 0 1 2 3 4 5

  <for|num| from=3 to=7>${num}</for>
  // 3 4 5 6 7

  <for|num| from=2 to=10 step=2>${num}</for>
  // 2 4 6 8 10
  ```

`<for>`タグには`by=`属性があり、ループ内のコンテンツを並べ替える際に状態を保持するのに役立ちます。値は関数である必要があり（ループ自体と同じパラメータを受け取ります）、各イテレーションに一意のキーを与えるために使用されます。

```marko
<for|user| of=users by=user => user.id>
  ${user.firstName} ${user.lastName}
</for>
```

上記の`by=`属性は、各イテレーションを`user.id`プロパティでキー付けします。

さらに、`of=`属性を使用する場合、`by=`は文字列でもかまいません。これにより、各アイテムの対応するプロパティでアイテムがキー付けされます。

これは、前の例を次のように簡略化できることを意味します:

```marko
<for|user| of=users by="id">
  ${user.firstName} ${user.lastName}
</for>
```

## `<let>`

`<let>`タグは、その[タグ変数](./language.md#tag-variables)を通じて可変状態を導入します。

```marko
<let/x=1>
```

`value=`属性（通常は[省略記法](./language.md#shorthand-value)を使用）は、その状態の初期値を提供します。

タグ変数が更新されると、それが使用されているすべての場所も再実行されます。これがMarkoのリアクティブシステムの核心です。

```marko
<let/count=1>

<button onClick() { count++ }>
  Current count: ${count}
</button>
```

このテンプレートでは、ボタンがクリックされたときに`count`が増分されます。`count`は[タグ変数](./language.md#tag-variables)であるため、変更されるたびに下流の式（この場合はボタン内のテキスト）が更新されます。

> [!NOTE]
> `<let>`タグは、[制御可能](#controllable-let)でない限り、その`value=`属性の変更に対してリアクティブではありません。そのタグ変数は、直接代入または変更ハンドラを通じてのみ更新されます。
>
> ```marko
> export interface Input {
>   initialCount: number;
> }
>
> <let/count=input.initialCount>
> <p>Count: ${count}</p>
> <p>Input Count: ${input.initialCount}</p>
> ```
>
> ここでは、`input.initialCount`が変更されても、`count`は初期値のままです。

### 制御可能なLet

`<let>`タグは、[ネイティブタグの変更ハンドラ](./native-tag.md#change-handlers)と同様に、`valueChange=`属性を使用して**制御可能**にできます。これにより、状態変更の傍受と変換、または親と子コンポーネント間の状態の同期が可能になります。

```marko
<let/value="HELLO">
<let/controlled_value=value valueChange(newValue) { value = newValue.toUpperCase() }>
```

この例では:

1. `value`は「HELLO」の初期値を持つベース状態を保持します
2. `controlled_value`は`value`の値を反映しますが、その`valueChange`ハンドラはすべての更新が大文字であることを保証します
3. `controlled_value`への変更はすべて傍受され、大文字に変換され、`value`に格納されます

より一般的なユースケースは、親コンポーネントによってオプションで制御できる状態を作成することです:

```marko
/* counter.marko */
export interface Input {
  count: number;
  countChange?: (count: number) => void;
}

<let/count:=input.count>

<button onClick() { count++ }>
  Clicked ${count} times
</button>
```

これにより、2つの可能な動作が作成されます:

1. **非制御**: 親が`count=`のみを提供する場合、子は独自の状態を維持します:

   ```marko
   <counter count=0/>
   ```

2. **制御**: 親が`count=`と`countChange=`の両方を提供する場合、親が状態を制御します:

   ```marko
   <let/count=0>
   <counter count:=count/>
   <button onClick() { count = 0 }>
     Reset
   </button>
   ```

## `<const>`

`<const>`は、その`value=`属性（通常は[省略記法](./language.md#shorthand-value)を使用）を[タグ変数](./language.md#tag-variables)を通じて公開します。

[`<let>`](#let)の例を拡張して、`count`状態からデータを導出できます:

```marko
<let/count=1>
<const/doubleCount=count * 2>

<button onClick() { count++ }>
  Current count: ${count}
  And the double is ${doubleCount}
</button>
```

> [!NOTE]
> `<const>`タグはローカルスコープであり、コンポーネントのすべてのインスタンスに対して初期化されます。プログラム全体の定数を公開することが目的の場合は、代わりに[`static const`](./language.md#static)を使用する必要があります。

> [!TIP]
> [`<const>`](#const)タグの実装は、概念的にはその`input.value`を[`<return>`](#return)するのと同じです。🤯
>
> ```marko
> /* const.marko */
> export interface Input<T> {
>   value: T;
> }
>
> <return=input.value>
> ```

## `<return>`

`<return>`タグは、任意の[カスタムタグ](./custom-tag.md)が[タグ変数](./language.md#tag-variables)を公開することを可能にします。

`value=`属性（通常は[省略記法](./language.md#shorthand-value)を介して表現されます）は、テンプレートのタグ変数として利用可能になります。

```marko
/* answer.marko */
<return=42>
```

戻り値は、親テンプレートで使用できます:

```marko
<answer/value/>

<div>${value}</div>
```

### 代入可能な戻り値

デフォルトでは、公開された変数には値を代入できません。値の代入は、`<return>`の`valueChange=`属性で有効にできます。

`valueChange=`属性が提供されている場合、タグ変数に値が代入されるたびに呼び出されます。

```marko
/* uppercase.marko */
export interface Input {
  value: string;
}

<let/value = input.value.toUpperCase()>

<return=value valueChange(newValue) {
  value = newValue.toUpperCase();
}/>
```

上記の例では、公開されたタグ変数は`input.value`の大文字バージョンに初期化され、新しい値が代入されると、状態に格納する前にまず値を大文字にします。

```marko
<uppercase/value=""/>
<input onInput(e) { value = e.target.value }/>
<div>${value}</div> // valueは常に大文字
```

## `<script>`

`<script>`タグは、Markoで特別な動作をします。

`<script>`タグのコンテンツは、テンプレートのレンダリングが完了し、ブラウザにマウントされたときに最初に実行されます。
また、参照している[タグ変数](./language.md#tag-variables)または[タグパラメータ](./language.md#tag-parameters)のいずれかが変更された後に_再度_実行されます。

```marko
<let/count=1>
<button/myButton onClick() { count++ }>
  Current count: ${count}
</button>

<script>
  // このタグの各インスタンスに対してブラウザで実行されます。
  // また、`myButton`または`count`が更新されたときにも実行されます
  console.log("clicked", myButton(), count, "times");
</script>
```

多くの場合、`<script>`タグは[`$signal` API](./language.md#signal)と組み合わせて、副作用を適用し、その後クリーンアップします。

```marko
<script>
  const intervalId = setInterval(() => {
    console.log("time", Date.now());
  }, 1000);

  $signal.onabort = () => clearInterval(intervalId);
</script>
```

> [!TIP]
> _本物の_`<script>`タグを使用すべきケースはほとんどありませんが、絶対に必要な場合は[`<html-script>`](#html-script--html-style)のフォールバックを使用できます。

## `<style>`

`<style>`タグは、Markoで特別な動作をします。コンポーネントが何回レンダリングされても、そのスタイルは一度だけロードされます。

```marko
<style>
  /* バンドルされ、一度だけロードされます */
  body {
    color: green;
  }
</style>
```

`<style>`には、[scss](https://sass-lang.com/documentation/syntax/#scss)や[less](https://lesscss.org/)などのCSSプリプロセッサを有効にするファイル拡張子を含めることができます。

```marko
<style.scss>
  $primary-color: green;

  .fancy-scss {
    color: $primary-color;
  }
</style>

<div class="fancy-scss">Hello!</div>

<style.less>
  @primary-color: blue;

  .fancy-less {
    color: @primary-color;
  }
</style>

<div class="fancy-less">Hello!</div>
```

`<style>`タグに[タグ変数](./language.md#tag-variables)がある場合、[CSSモジュール](https://github.com/css-modules/css-modules)を活用して、そのクラスをオブジェクトとして公開します。

```marko
<style/styles>
  .foo { border: 1px solid red }
  .bar { color: green }
</style>

<div class=styles.foo />
<div class=[styles.foo, styles.bar] />
<div class={ [styles.bar]: true } />
<div.${styles.foo} />
```

> [!TIP]
> _本物の_インライン`<style>`タグを使用すべきケースはほとんどありませんが、必要な場合はフォールバック[`<html-style>`](#html-script--html-style)タグを使用できます。

## `<define>`

`<define>`タグは、主にテンプレート全体で共有できる再利用可能なマークアップのスニペットを作成するために使用されます。

```marko
<define/MyTag|input: { name: string }| foo=1>
  <span>Hello ${input.name}</span>
</>

<MyTag name="HTML"/>
<MyTag name="Marko"/>

<div>${MyTag.foo}</div>
```

[タグ変数](./language.md#tag-variables)は、`<define>`タグに提供された属性（[コンテンツ](./language.md#tag-content)を含む）を反映します。

> [!TIP]
> 上記の`<define>`タグの実装は、概念的にはその`input`を[`<return>`](#return)するのと同じです。🤯
>
> ```marko
> /* define.marko */
> export type Input<T> = T;
> <return=input>
> ```

## `<lifecycle>`

`<lifecycle>`タグは、命令型クライアントAPIからの副作用を同期するために使用されます。

```marko
<lifecycle
  onMount() {
    // このタグがDOMに接続されたときに一度だけ呼び出され、二度と呼び出されません。
  }
  onUpdate() {
    // `onUpdate`関数の依存関係が無効化されるたびに呼び出されます。
  }
  onDestroy() {
    // このタグがDOMから削除されたときに一度だけ呼び出されます。
  }
/>
```

`this`は`<lifecycle>`タグの生涯にわたって一貫しており、変更できます。

```marko
client import { WorldMap } from "world-map-api";

<let/latitude = 0>
<let/longitude = 0>
<div/container/>
<lifecycle<{ map: WorldMap }>
  onMount() {
    this.map = new WorldMap(container(), { latitude, longitude, zoom });
  }
  onUpdate() {
    this.map.setCoords(latitude, longitude);
    this.map.setZoom(zoom);
  }
  onDestroy() {
    this.map.destroy();
  }
/>
```

> [!TIP]
> `<lifecycle>`タグのすべての属性は、イベントハンドラ属性のいずれかで`this`として利用できます。

## `<id>`

`<id>`タグは、短い一意のID文字列（[`id=`およびaria属性](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id)と互換性があります）を持つ[タグ変数](./language.md#tag-variables)を公開します。

```marko
<id/cheeseId/>
<label for=cheeseId>Do you like cheese?</label>
<input id=cheeseId type="checkbox" name="cheese">
```

`value=`属性にnull不可の値が含まれている場合、生成されたものの代わりにそれが使用されます。

```marko
/* textbox.marko */
export interface Input {
  id?: string;
  description: string;
}

<id/id=input.id>

<input aria-describedby=id>
<span id=id>${description}</span>
```

## `<log>`

`<log>`タグは、その`value=`属性の[console.log](https://developer.mozilla.org/en-US/docs/Web/API/console/log_static)を実行します（ここでは[省略記法](./language.md#shorthand-value)を使用して示されています）。

ログは、タグ変数が更新されるたびに再実行されます。

```marko
<let/count=0>
<log=`Current count: ${count}`>
<button onClick() { count++ }>Log</button>
```

これにより、サーバーとクライアントの両方で`Current count: 0`がログに記録され、`count`が変更されるたびに再度記録されます。

## `<debug>`

`<debug>`タグは、タグがレンダリングされたときに実行される[`debugger`ステートメント](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger)をテンプレート内に挿入します。

```marko
export interface Input {
  stuff: any;
}

<const/{ stuff } = input>

<debug/> // デバッガでレンダースコープの変数を検査するのに役立ちます。
```

`value=`属性が含まれている場合、デバッガは変更されるたびに実行されます。

```marko
export interface Input {
  firstName: string;
  lastName: string;
}

<debug=[input.firstName, input.lastName]>
```

このデバッガは、初期レンダリング時と`input.firstName`または`input.lastName`が変更されたときに実行されます。

## `<await>`

`<await>`タグは、その[`value=`属性](./language.md#shorthand-value)内のPromiseをアンラップし、[タグパラメータ](./language.md#tag-parameters)を通じて公開します。

```marko
<await|user|=getUser()>
  <img src=user.avatar>
  ${user.name}
</await>
```

このタグに[`@placeholder`](#placeholder)を持つ[`<try>`](#try)祖先がある場合、Promiseが保留中の間、プレースホルダーコンテンツが表示されます。

```marko
<try>
  <div>
    <await|user|=getUser()>
      ${user.name}
    </await>
  </div>

  <@placeholder>
    Loading...
  </@placeholder>

  <@catch|err|>
    ${err.message}
  </@catch>
</try>
```

## `<try>`

`<try>`タグは、実行時エラーをキャッチし、非同期境界を管理するために使用されます。2つのオプションの[属性タグ](./language.md#attribute-tags)があります: `@catch`と`@placeholder`。

### `@catch`

`<try>`の[コンテンツ](./language.md#tag-content)またはその`@placeholder`属性タグで実行時エラーが発生すると、コンテンツは`@catch`属性タグのコンテンツに置き換えられます。スローされた`error`は、`@catch`の[タグパラメータ](./language.md#tag-parameters)として利用可能になります。

```marko
<try>
  <const/foo = { bar: { baz: 1 } }>
  ${foo.baz.bar} // 💥 boom! 👇

  <@catch|err|>
    ${err.message} // "Cannot read property `bar` of undefined"
  </@catch>
</try>
```

### `@placeholder`

`@placeholder` [属性タグ](./language.md#attribute-tags)の[コンテンツ](./language.md#tag-content)は、`<try>`のコンテンツ内で[`<await>`タグ](#await)が保留中の間、表示されます。

## `<html-comment>`

デフォルトでは、[HTMLコメント](./language.md#Comments)は出力から除外されます。`<html-comment>`タグは、リテラル`<!-- comment -->`を出力するために使用されます。

```marko
<html-comment>Hello, view source</html-comment>
```

このタグは、DOM内の[コメントノード](https://developer.mozilla.org/en-US/docs/Web/API/Comment)への参照のゲッターを含む[タグ変数](./language.md#tag-variables)も公開します。

```marko
<html-comment/commentNode/>

<return() {
  return commentNode().parentNode.getBoundingClientRect()
}/>
```

## `<html-script>` & `<html-style>`

[`<script>`](./native-tag.md#script)および[`<style>`](./native-tag.md#style)タグは、ベストプラクティスを可能にし、開発者が一般的な落とし穴を避けるのを助けるために拡張されています。

通常は必要ありませんが、これらのタグのバニラバージョンは、それぞれ`<html-script>`および`<html-style>`タグを介して記述できます。

> [!CAUTION]
> `<html-*>`タグは特殊なユースケースにのみ使用され、[`<script>`](./native-tag.md#script)または[`<style>`](./native-tag.md#style)の代わりに使用されることは_ほとんどありません_。

```marko
// 文字通り`<script>` HTMLタグとして書き出されます。
<html-script type="importmap">
  { "imports": { "square": "./module/shapes/square.js" } }
</html-script>

// 文字通り`<style>` HTMLタグとして書き出されます。
<html-style>
  @import url('https://fonts.googleapis.com/css2?family=Ubuntu&display=swap');
</html-style>
```
