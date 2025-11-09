# コンポーネントとリアクティビティ

> [!TLDR]
>
> タグ変数、条件分岐、コンポーネントを紹介する簡単な例を構築します

このチュートリアルでは、華氏と摂氏の間で温度を変換するアプリを構築します。

## タグの導入

多くのユーザーインターフェースと同様に、最初のステップはユーザーから入力を収集することです。HTMLの`<input>`タグを使用してこれを行うことができます：

```marko
<input type="number">
```

## 状態の追加

もちろん、現時点ではこの入力に含まれる値を追跡していません。これを行うには、状態を導入する必要があります。Markoでは、これを行う最も一般的な方法は[タグ変数](../reference/language.md#tag-variables)を使用することです。ここでは、[Markoの`<let>`タグ](../reference/core-tag.md#let)を使用します：

```marko
<let/degF=80>

<input type="number" value=degF>
<div>It's ${degF}°F</div>
```

## 状態の同期

これで`<input>`に初期値が設定されましたが、変更時にそれを追跡していません。これを行う1つの方法は、[イベントハンドラ](../reference/native-tag.md#event-handlers)で[`input`イベント](https://developer.mozilla.org/en-US/docs/Web/API/Element/input_event)をリッスンすることです：

```marko
<let/degF=80>

<input type="number" value=degF onInput(e) {
  degF = +e.target.value;
}>
<div>It's ${degF}°F</div>
```

これで、度数（華氏）の値を追跡する[リアクティブ変数](../reference/reactivity.md)ができました。摂氏に変換しましょう！

> [!NOTE]
> `<input>`の値をより細かく制御するには、Markoの[controllable](../reference/native-tag.md#change-handlers)パターンを使用できます。

## 計算値の追加

これを行うには、`<const>`タグを使用できます：

```marko
<let/degF=80>
<const/degC=(degF - 32) * 5 / 9>

<input type="number" value=degF onInput(e) {
  degF = +e.target.value;
}>
<div>
  ${degF}°F ↔ ${degC.toFixed(1)}°C
</div>
```

## 条件分岐の使用

リアクティブ変数ができたので、他に何ができるか見てみましょう！[条件タグ](../reference/core-tag.md#if--else)を使用して、温度に関するメモを追加してみましょうか？

```marko
<let/degF=80>
<const/degC=(degF - 32) * 5 / 9>

<input type="number" value=degF onInput(e) {
  degF = +e.target.value;
}>
<div>
  ${degF}°F ↔ ${degC.toFixed(1)}°C
</div>

<if=(degF > 90)>
  It's <strong>hot</strong> 🥵
</if>
<else if=(degF > 60)>
  Lovely day! 😎
</else>
<else if=(degF < 32)>
  Brrrrr 🥶
</else>
```

## スタイルとビジュアライゼーションの追加

または、派手なCSSを使った温度計はどうでしょうか？

```marko
<let/degF=80>
<const/degC=(degF - 32) * 5 / 9>

<input type="number" value=degF onInput(e) {
  degF = +e.target.value;
}>
<div>
  ${degF}°F ↔ ${degC.toFixed(1)}°C
</div>

<div class="gauge">
  <div class="needle" style={"--rotation": `${degF * 180 / 100}deg`}/>
</div>

<style>
  .gauge {
    position: relative;
    width: 8rem;
    height: 4rem;
    border-radius: 4rem 4rem 0 0;
    background: conic-gradient(from 270deg at 50% 100%, lightblue, blue, green, orange, red 180deg);
  }

  .needle {
    position: absolute;
    box-sizing: border-box;
    width: 4rem;
    height: 4px;
    bottom: -2px;
    background: black;
    border: 1px solid white;
    transform-origin: right;
    transform: rotate(var(--rotation));
  }
</style>
```

## 再利用可能なコンポーネントの作成

実際、これは1つの場所にまとめるには少し複雑すぎます。温度計をコンポーネントに抽出しましょう：

```marko
/* index.marko */
<let/degF=80>
<const/degC=(degF - 32) * 5 / 9>

<input type="number" value=degF onInput(e) {
  degF = +e.target.value;
}>
<div>
  ${degF}°F ↔ ${degC.toFixed(1)}°C
</div>

<gauge temperature=degF/>
```

```marko
/* tags/gauge.marko */
<div class="gauge">
  <div class="needle" style={"--rotation": `${input.temperature * 180 / 100}deg`}/>
</div>

<if=(input.temperature > 90)>
  It's <strong>hot</strong> 🥵
</if>
<else if=(input.temperature > 60)>
  Lovely day! 😎
</else>
<else if=(input.temperature < 32)>
  Brrrrr 🥶
</else>

<style>
  .gauge {
    position: relative;
    width: 8rem;
    height: 4rem;
    border-radius: 4rem 4rem 0 0;
    background: conic-gradient(from 270deg at 50% 100%, lightblue, blue, green, orange, red 180deg);
  }

  .needle {
    position: absolute;
    box-sizing: border-box;
    width: 4rem;
    height: 4px;
    bottom: -2px;
    background: black;
    border: 1px solid white;
    transform-origin: right;
    transform: rotate(var(--rotation));
  }
</style>
```

> [!IMPORTANT]
> `<gauge>`コンポーネントファイルが`tags/`ディレクトリにあることを確認してください！Markoはディレクトリ構造に基づいてカスタムタグを[自動検出](../reference/custom-tag.md#custom-tag-discovery)します。

<!-- markdownlint-disable MD026 allow exclamation point -->

## あなたの番！

今回構築するのはここまでですが、自由に追加してください！以下にいくつかのアイデアを示します：

- 新しい温度単位はどうでしょうか？ケルビンや[ドリール度](https://en.wikipedia.org/wiki/Delisle_scale)などは？
- 世界のほとんどの地域では実際に摂氏を使用しています😅、おそらくユーザーは開始する単位を選択できるべきです
- 体感温度はどうでしょうか？「風速」がわかっていれば、[標準的な公式](https://en.wikipedia.org/wiki/Wind_chill)があるようです
- 温度間の変換はクールですが、このシステムは_汎用化_できます。重量、容量、距離の間で変換するとしたら？
- その他何でも！可能性は無限大です！

## 次のステップ

- [ネストされたリアクティビティ](../explanation/nested-reactivity.md)
- [言語リファレンス](../reference/language.md)
