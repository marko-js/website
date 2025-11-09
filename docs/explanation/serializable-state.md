# シリアライズ可能な状態

Marko は、イベント、スクリプト、クライアント側の更新に関して、サーバーが中断したところからシームレスに引き継ぎます。
これを実現するために、Marko はサーバーからクライアントへの可能な限り少ないデータのシリアライズを試みます。

ほとんどの標準データ型はシリアライズできます。以下が含まれます：

- プリミティブ: `null`, `boolean`, `number`, `string`, `bigint`
- シリアライズ可能な値を持つ配列とプレーンオブジェクト
- Date
- Map, Set
- 型付き配列と ArrayBuffer/DataView
- URL と URLSearchParams
- 追加の組み込み JS およびブラウザオブジェクト
  - 完全なリストについては、ソースの[シリアライザーファイル](https://github.com/marko-js/marko/blob/main/packages/runtime-tags/src/html/serializer.ts)を参照してください

... など、さらに多くのデータ型があります。

## シリアライズ不可能なデータ

一部の値はシリアライズできません。これらの値が検出されると、Marko ランタイムは関連するコードを見つけるための役立つメッセージを提供します。

シリアライズ不可能なデータの例：
- クロージャ（トップレベル関数は問題ありません！）
- 任意の JavaScript コードまたはインポートから来る関数
- クラスインスタンス（ランタイムによって明示的にサポートされている組み込みを除く）
- DOM ノードと要素

> [!NOTE]
> ほとんどの関数とクロージャ_は_シリアライズ可能です。
>
> ```marko
> <let/handler=null>
> <const/onSecondClick() {
>   // シリアライズ可能！
> }>
>
> <button onClick() { handler?.(); handler = onSecondClick }/>
> ```

```marko
// ❌ 悪い例: 状態内のカスタムクラスインスタンス
<let/state=new Cart()>

// ❌ 悪い例: 状態内の DOM ノード
<let/state={ el: document.body }>
```

## さらに読む

- [不変状態](./immutable-state.md)
- [リアクティビティ](../reference/reactivity.md)
- [細粒度バンドリング](./fine-grained-bundling.md)
- [ストリーミング](./streaming.md)
