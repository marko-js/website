# TypeScript

## グローバル名前空間

`marko/run` は、以下の型を持つグローバル名前空間 `MarkoRun` を提供します：

**`MarkoRun.Handler`** - +handler または +middleware ファイルでエクスポートされるハンドラー関数を表す型

**`MarkoRun.Route`** - ルートのパラメータとメタデータの型

**`MarkoRun.Context`** - ハンドラー内のリクエストコンテキストオブジェクトの型、および Marko ファイル内の `$global` の型。この型は、アプリケーションコード内で `@marko/run` モジュールに `Context` インターフェースを宣言することで、TypeScript のモジュールとインターフェースのマージを使用して拡張できます

```ts
declare module "@marko/run" {
  interface Context {
    customPropery: MyCustomThing; // MarkoRun.Context にグローバルに定義されます
  }
}
```

**`MarkoRun.Platform`** - 使用中のアダプターによって提供されるプラットフォームオブジェクトの型。このインターフェースは、`Context` と同じ方法で（上記を参照）、`Platform` インターフェースを宣言することで拡張できます：

```ts
declare module "@marko/run" {
  interface Platform {
    customPropery: MyCustomThing; // MarkoRun.Platform にグローバルに定義されます
  }
}
```

## 生成される型

プロジェクトルートで [TSConfig](https://www.typescriptlang.org/tsconfig) ファイルが見つかった場合、Vite プラグインは、各ミドルウェア、ハンドラー、レイアウト、ページに対してより具体的な型を提供する .d.ts ファイルを自動的に生成します。このファイルは、開発環境を含め、プロジェクトがビルドされるたびに `.marko-run/routes.d.ts` に生成されます。

> [!NOTE] TypeScript はデフォルトでこのファイルを含めません。[Marko VSCode プラグイン](https://marketplace.visualstudio.com/items?itemName=Marko-JS.marko-vscode) を使用し、[tsconfig に追加する](https://www.typescriptlang.org/tsconfig#include) 必要があります。

これらの型は、ルーティング可能なファイルごとに、より具体的なバージョンに置き換えられます：

**`MarkoRun.Handler`**

- コンテキストを特定の MarkoRun.Context でオーバーライド

**`MarkoRun.Route`**

- 特定のパラメータとメタタイプを追加
- 多くのルートで使用されるミドルウェアとレイアウトでは、この型はファイルが参照するすべての可能なルートのユニオンになります

**`MarkoRun.Context`**

- 多くのルートで使用されるミドルウェアとレイアウトでは、この型はファイルが参照するすべての可能なルートのユニオンになります
- アダプターが使用されている場合、プラットフォームの型を提供できます
