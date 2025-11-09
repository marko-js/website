# 制御可能なコンポーネント

> [!TLDR]
>
> - **制御された**コンポーネントは `input` プロパティによって駆動される
> - **非制御**コンポーネントは内部状態によって駆動される
> - **制御可能な**コンポーネントは制御され_かつ_非制御にもなれる
> - Marko は制御可能なコンポーネントを構築するための第一級のパターンを提供する

コンポーネントベースのフレームワークでは、開発者は状態の_信頼できる情報源_がどこにあるかを知る必要があります。通常、コンポーネントレベルで[**制御された**または**非制御**](https://react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components)のどちらにするかの決定が行われます。

## 非制御コンポーネント

非制御コンポーネントは自身の状態を管理します。

```marko
/* counter.marko */
<let/count=0/>

<button onClick() { count++ }>
  Count: ${count}
</button>
```

`<counter>` は自身の状態を管理する（`<let>` を介して）ため、追加の作業なしでどこでも使用できます。

```marko
/* parent.marko */
<counter/>
```

しかし、状態は `counter.marko` 内で作成されるため、`count` はコンポーネント内でのみアクセスできます。つまり、親が状態を使用する方法がありません。例えば、親がこのカウントを使用してページの別の場所に表示するにはどうすればよいでしょうか？

```marko
/* parent.marko */
<counter/>

// 🤔 ここで `count` にアクセスするにはどうすればよいでしょうか？
<output>${count}</output>
```

これは `parent.marko` への変更だけでは不可能です！代わりに、`<counter>` を変更して親により多くの**制御**を与える必要があります。

### 状態の同期

親が状態にアクセスできるようにするための単純なアプローチは、更新が発生したときにイベントをトリガーすることです。

> [!WARNING]
> これはアンチパターンです！このような場合は、状態を同期する代わりに[制御可能なパターン](#the-controllable-pattern)を使用する方が**ほぼ常に優れています**

```marko
/* counter.marko */
export interface Input {
  onChange: (count: number) => void;
}

<let/count=0/>

<button onClick() {
  input.onChange(++count);
}>
  Count: ${count}
</button>
```

このイベントハンドラを使用すると、`parent.marko` は独自の `count` のコピーを追跡できます。

```marko
/* parent.marko */
<let/count=0/>

<counter onChange(newCount) { count = newCount }/>

<output>${count}</output>
```

このアプローチにはエラーの余地があります：

- _2つ_の `count` 変数を同期させる必要がある
- これらの変数が同期しなくなると、ウェブサイトは壊れる
- `<counter>` 内の_すべて_の変更を追跡し、親で同期する必要がある

後で説明するように、ほとんどのステートフルな[ネイティブ HTML 要素](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements)は、デフォルトでこの「状態同期を伴う非制御」アプローチを使用しています。Marko はこれらのタグを[拡張](../reference/native-tag.md#change-handlers)して[制御可能なパターン](#the-controllable-pattern)を有効にします。

### 制御されたコンポーネント

制御されたコンポーネントは、親から状態を受け取り、変更をコンポーネントツリーの上位に委譲します。

```marko
/* counter.marko */
export interface Input {
  count: number;
  updateCount: (count: number) => void;
}

<button onClick() { input.updateCount(input.count + 1) }>
  Count: ${input.count}
</button>
```

この `<counter>` コンポーネントを直接使用すると、インタラクティブになりません！`<counter>` を効果的に管理するには、親で状態を_作成_する必要があります。

```marko
/* parent.marko */
<let/count=0/>

<counter
  count=count
  updateCount(newCount) { count = newCount }
/>
```

親がコンポーネントの状態を完全に制御できるため、これは素晴らしいことですが、トレードオフがあります：

- `<counter>` の_すべて_の親にこのボイラープレートが必要であり、たとえ `count` を使用しない場合でも必要
- このリファクタリングは、_私たち_が `<counter>` を作成し、その API を変更できるからこそ可能だった

## 制御可能なパターン

最終的に、_コンポーネント作成時_に状態を制御するか非制御にするかを知ることは不可能です。_時には_制御する必要があるかもしれませんが、それ以外の場合は独自の状態を管理する必要があります。これらのケースのために、Marko は**制御可能な**パターンを導入しています。

制御可能なコンポーネントは、デフォルトで[非制御](#uncontrolled-components)ですが、変更ハンドラを使用すると[制御された](#controlled-components)ものになります。

`<counter>` の例を掘り下げて制御可能にする前に、このパターンがネイティブ要素でどのように見えるかを探ってみましょう。

### 制御可能なネイティブタグ

ほとんどのネイティブ HTML 要素は、デフォルトで[非制御](#uncontrolled-components)パターンに従いますが、Marko は[変更ハンドラ](../reference/native-tag.md#change-handlers)を使用してそれらを拡張し、[制御された](#controlled-components)パターンを有効にします。

ステートフルな HTML 要素を制御するには、`Change` ハンドラを追加できます。

```marko
<let/textValue="">

<input value=textValue valueChange(v) { textValue = v }>
```

`valueChange` が存在するため、Marko はこの `<input>` が**制御されている**ことを認識し、その値は常に `textValue` から派生します。これは**バインディング**と呼ばれます。

これは一般的なパターンであるため、Marko は `:=` 演算子を使用した[バインディングの省略記法](../reference/language.md#shorthand-change-handlers-two-way-binding)を提供しています。

```marko
<let/textValue="">

<input value:=textValue>
```

> [!NOTE]
> [バインディングの省略記法](../reference/language.md#shorthand-change-handlers-two-way-binding)は、_識別子_と_メンバー式_で使用される場合に異なる動作をします。上記は識別子の動作です。次にメンバー式の動作を見ていきます。

### 制御可能な `<let>`

`<counter>` タグが、Marko の `<input>` のようなネイティブタグと同じ制御可能なパターンに従うようにしたいと考えています。[`<let>` も制御可能である](../reference/core-tag.md#controllable-let)という事実を利用しましょう。

```marko
/* counter.marko */
export interface Input {
  count: number;
  countChange?: (count: number) => void;
}

<let/count=input.count valueChange=input.countChange>

<button onClick() { count++ }>
  Count: ${input.count}
</button>
```

このコンポーネントは、`<let>` タグの `valueChange` に応じて2つの動作を持つようになりました：

- `countChange` が関数の場合
  - `<let>` は状態の制御を放棄し、`input.count` の派生として機能する
- `countChange` が `undefined` の場合
  - `<let>` は最初の例と同様に機能する

```marko
/* parent.marko */
<let/parentCount=0>

// `parentCount` が信頼できる情報源
<counter count=parentCount countChange(count) { parentCount = count }/>

// これは独自の状態を保持する
<counter/>
```

[バインディングの省略記法](../reference/language.md#shorthand-change-handlers-two-way-binding)は、識別子とメンバー式で異なる動作をするため、この交換の両側に対応しています。

```marko
/* counter.marko */
export interface Input {
  count: number;
  countChange?: (count: number) => void;
}

<let/count:=input.count>

<button onClick() { count++ }>
  Count: ${input.count}
</button>
```

```marko
/* parent.marko */
<let/parentCount=0>

<counter count:=parentCount/>

<output>${count}</output>
```

## より多くの力

制御可能なパターンにより、コンポーネントの_ユーザー_が状態を管理するかどうかを決定できます。シンプルなケースはシンプルなままですが、複雑な状態管理も可能です。

表面をなぞっただけです！親が状態を引き上げると、_完全な_制御を得ます。つまり、最大値を追加できます：

```marko
/* parent.marko */
<let/count=0>

<counter count=count countChange(c) {
  if (c > 5) {
    count = 5;
  } else {
    count = c;
  }
}/>
```

または検証を実行できます：

```marko
/* parent.marko */
<let/count=0>

<counter count=count countChange(c) {
  if (confirm("are you sure?")) {
    count = c;
  }
}/>
```

重要なのは、_親_が状態で何をするかを決定することです。コンポーネントが制御可能なパターンで設計されている場合、コンポーネント自体を変更することなく、さまざまなシナリオで使用できます。

## さらに読む

- [ネストされたリアクティビティ](./nested-reactivity.md)
- [関心の分離](./separation-of-concerns.md)
