# リアクティビティリファレンス

Markoの目標は、豊富なクライアントインタラクションを持つパフォーマンスの高いエクスペリエンスを簡単に表現できるようにすることです。これは、その**リアクティビティシステム**を通じて実現されます。リアクティブシステムは、Markoが何をいつ更新する必要があるかを決定する方法です。

Markoのリアクティブシステムの核心は、[`<let>`タグ](./core-tag.md#let)です。

## リアクティブ変数

Markoでは、[タグ変数](./language.md#tag-variables)、[タグパラメータ](./language.md#tag-parameters)、および[`input`](./language.md#input)はすべてリアクティブです。これは、Markoコンパイラによって追跡され、これらの値が更新されると、依存する[レンダリング式](#render-expressions)も更新されることを意味します。

## レンダリング式

`.marko`テンプレート内で[リアクティブ変数](#reactive-variables)を参照する式はすべて、リアクティブと見なされ、その変数とともに更新されます。

これらのリアクティブ式は、テンプレート全体の[属性](./language.md#attributes)、[動的テキスト](./language.md#dynamic-text)、[動的タグ名](./language.md#dynamic-tags)、および[スクリプトコンテンツ](./core-tag.md#script)に存在する可能性があります。

> [!NOTE]
> Markoテンプレート内のすべてのJavaScript式はリアクティブになる可能性がありますが、例外として
> [staticステートメント](./language.md#static)（[`import`](./language.md#import)、[`export`](./language.md#export)、[`static`](./language.md#static)、[`server`と`client`](./language.md#server-and-client)を含む）があり、これらはテンプレートがロードされたときに_一度_評価されます。

```marko
<let/count=0>

<button onClick() { count++ }>
  Current: ${count}
</button>
```

ここでは、`count`タグ変数がボタンクリックによって変更されます。ボタンのテキストコンテンツが`count`を参照しているため、新しい値と自動的に同期されます。

> [!CAUTION]
> 場合によっては、Markoがいくつかの式を一緒に評価させることがあります。これが、[レンダリング式](#render-expressions)が純粋であるべき理由です。

> [!TIP]
> Markoは**コンパイル言語**であり、そのリアクティブグラフは実行時ではなくコンパイル時に発見されます。これは、[SolidJSのSignals](https://docs.solidjs.com/advanced-concepts/fine-grained-reactivity)や[ReactのHooks](https://react.dev/reference/react/hooks)など、他の多くの主要なアプローチとは対照的です。

## 更新のスケジューリング

Markoは、最適なパフォーマンスを確保するために作業を自動的にバッチ処理します。[リアクティブ変数](#reactive-variables)が変更されるたびに、その更新がキューに入れられ、複数の変更が一緒に効率的に適用されることが保証されます。

この更新キューは、通常、[マイクロタスク](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide)の後にスケジュールされます。

キューが消費された後、_更新がペイントされる前_に追加の更新がスケジュールされた場合、それらは次のフレームまで延期されます。これにより、いくつかのことが達成されます:

- ユーザーに表示する準備ができたコンテンツがブロックされません。
- 無限の更新ループでアプリケーションをロックアップすることはできません。
- 更新ループを使用してアニメーションを駆動できます（ただし、ほとんどの場合、CSS [Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/animation)と[Transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/transition)/ JS [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)が推奨されます）。
