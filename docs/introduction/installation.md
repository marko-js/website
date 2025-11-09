# Markoのインストール

> [!NOTE]
> ブラウザで直接Markoを試して学びたい場合は、[Playground](/playground)にアクセスしてください。ローカルセットアップなしでMarkoアプリケーションをすぐに開発できます。

## 前提条件

- [Node.js](https://nodejs.org/en) `v18`、`v20`、`v22`以降
- IDE - [VS Code](https://code.visualstudio.com/)と[公式Marko拡張機能](https://marketplace.visualstudio.com/items?itemName=Marko-JS.marko-vscode)を推奨します
- ターミナル - コマンドラインインターフェース（CLI）を使用してアプリケーションをセットアップし、起動します

## Marko Runのセットアップ（推奨）

[Marko Run](https://github.com/marko-js/run)は最小限の設定で簡単に始められ、新しいMarkoプロジェクトの推奨開始点です。Markoチームの公式アプリケーションフレームワークで、[Vite](https://vite.dev/)を使用しています。

プロジェクトをセットアップするには：

```bash
npm init marko -- -t basic
cd ./my-marko-application
npm run dev
```

エディタで`src/routes/+page.marko`を開いてインデックスページを編集してください。プロジェクトにページを追加する方法については、[ルーティングドキュメント](https://github.com/marko-js/run#file-based-routing)を参照してください。

## 手動セットアップ

独自のアプリケーション構造を作成したい場合は、お好みのバンドラを使用してプロジェクトをセットアップできます。Markoチームは[Vite](https://github.com/marko-js/vite)、[Webpack](https://github.com/marko-js/webpack)、[Rollup](https://github.com/marko-js/rollup)のプラグインを保守しています。以下のガイドでは、Viteのセットアップを行います。

1. **プロジェクトディレクトリを作成する**

   プロジェクト名で空のディレクトリを作成し、その中に移動します：

   ```bash
   mkdir my-marko-application
   cd my-marko-application
   ```

   ディレクトリ内で、プロジェクトの依存関係を管理するために使用される`package.json`ファイルを初期化します：

   ```bash
   npm init --yes
   ```

1. **Markoをインストールする**

   Markoに必要な依存関係をインストールしましょう。

   まず、`marko` 6を依存関係としてインストールします。

   ```bash
   npm install marko@next
   ```

   次に、npmの`-D`フラグを使用して、Viteとmarkoプラグインを開発依存関係としてインストールします：

   ```bash
   npm install -D vite @marko/vite
   ```

1. **`vite.config.ts`ファイルを作成する**

   [Vite設定](https://vite.dev/config/)をエクスポートし、`plugins`リストに`marko()`プラグインを追加するために、`vite.config.ts`ファイルを作成します。

   ```typescript
   import { defineConfig } from "vite";
   import marko from "@marko/vite";

   export default defineConfig({
     plugins: [marko()],
   });
   ```

1. **最初のMarkoページを作成する**

   テキストエディタで`src/routes/index.marko`ファイルを作成します。これがプロジェクトの最初のMarkoページになります。新しいファイルに以下の内容をコピー＆ペーストします：

   ```marko
   <html lang="en">
       <body>
           <h1>Hello Marko!</h1>
       </body>
   </html>
   ```

1. **サーバーを追加する**

   デフォルトでは、`marko()`プラグインは[Vite Server Side Rendering (SSR) モード](https://vite.dev/guide/ssr.html#server-side-rendering-ssr)の使用を必要とします（これはMarkoプラグインの`linked`オプションで無効にできます）。したがって、アプリケーションを起動するためにサーバーファイルを作成する必要があります。このガイドでは[`express`](https://expressjs.com/)を使用します。

   まず、`express`をインストールします：

   ```bash
   npm install express
   ```

   次に、`index.js`ファイル内にサーバーロジックを作成します。このコードは、Expressサーバーをセットアップし、Markoテンプレートのサーバーサイドレンダリングを処理するためにViteと統合します。簡単にするために、このセットアップは開発環境専用です。より多くの例については、[Marko JSサンプルリポジトリ](https://github.com/marko-js/examples/tree/master/examples)を参照してください。

   ```javascript
   import express from "express";
   import { createServer } from "vite";

   const app = express();

   const vite = await createServer({
     server: {
       middlewareMode: true,
     },
     appType: "custom",
   });

   app.use(vite.middlewares);

   app.get("/", async (req, res) => {
     const template = (
       await vite.ssrLoadModule("./src/routes/index.marko?marko-server-entry")
     ).default;
     const result = template.render();
     res.header("Content-Type", "text/html");
     result.pipe(res);
   });

   app.listen(3000);
   ```

   `?marko-server-entry`は、サーバーコードのエントリーポイントをViteプラグインに示すために使用されることに注意してください。

1. **アプリケーションを起動する**

   以下のコマンドを使用してアプリケーションを起動し、http://localhost:3000 にアクセスして、アプリの構築中にコードのプレビューを確認できます！

   ```bash
   node index.js
   ```

## TypeScriptのセットアップ

MarkoのTypeScriptサポートは、エディタ内でのエラーチェック、リファクタリングの不安軽減、データが期待に一致することの検証、さらにはAPI設計の支援を提供します。

または、単にVS Codeでより多くのオートコンプリートが欲しいだけかもしれません。それもうまくいきます！

MarkoアプリケーションにTypeScriptサポートを追加するには、プロジェクトのルートディレクトリに`tsconfig.json`ファイルを追加します。開始点として以下の`tsconfig.json`を使用できます：

```json
{
  "include": ["src/**/*"],
  "compilerOptions": {
    "allowSyntheticDefaultImports": true,
    "lib": ["dom", "ESNext"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "noEmit": true,
    "noImplicitOverride": true,
    "noUnusedLocals": true,
    "outDir": "dist",
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "strict": true,
    "target": "ESNext",
    "verbatimModuleSyntax": true
  }
}
```

CLIでMarkoファイルの型チェックを行うには、以下のコマンドでプロジェクトに`@marko/type-check`をインストールできます：

```bash
npm install -D @marko/type-check
```

その後、`tsc`の代わりに`mtc`（Marko type check）を使用できます：

```bash
mtc
```

MarkoとTypeScriptの使用に関する詳細については、[このリファレンスページ](../reference/typescript.md)をご覧ください。

## IDEプラグイン

Markoチームは、Markoのシンタックスハイライト、整形、TypeScript、IntelliSenseなどを提供する[Marko VS Code拡張機能](https://marketplace.visualstudio.com/items?itemName=Marko-JS.marko-vscode)を保守しています。

他のエディタの場合、Marko [language server](https://github.com/marko-js/language-server/tree/main)を使用してIDEでのMarkoの開発者エクスペリエンスを向上させることができます。

## 次のステップ

- [構文の基礎](../tutorial/fundamentals.md)
- [コンポーネントとリアクティビティ](../tutorial/components-and-reactivity.md)
- [ツール統合](./integrations.md)
