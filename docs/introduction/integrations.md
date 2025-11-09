# ツール統合

Marko本体に加えて、コアチームは言語のためのさまざまな統合やその他のツールを保守しています。

## エディタツール

[Marko VSCode](https://marketplace.visualstudio.com/items?itemName=Marko-JS.marko-vscode)は_すべての_エディタツールを含んでいるため、インストールすれば他のエディタセットアップは不要です。

[Language Server](https://github.com/marko-js/language-server)は、Language Server Protocolをサポートする任意のエディタで、Markoファイルのシンタックスハイライト、IntelliSense、型チェック、アクセシビリティヒントを提供します。

> [!TIP]
> Markoの型チェックの詳細については、[TypeScriptリファレンス](../reference/typescript.md)をご覧ください。

[Prettier](https://prettier.io/)がインストールされている場合、公式プラグインは[`prettier-plugin-marko`](https://github.com/marko-js/prettier)を通じてすぐに使えるコードフォーマットも提供します。

## バンドラ

プロジェクトでMarkoを使用する場合の公式推奨は、[Vite](https://github.com/marko-js/vite)を使用し、設定不要の[Marko Run](../marko-run/getting-started.md)です。

Marko Runを使用_していない_プロジェクトの場合、以下のオプションが利用可能です。

- [Vite](https://github.com/marko-js/vite)
- [Webpack](https://github.com/marko-js/webpack)
- [Rollup](https://github.com/marko-js/rollup)
- [Lasso](https://github.com/lasso-js/lasso-marko)

## テスト

Markoは、[`@marko/testing-library`](https://github.com/marko-js/testing-library)を通じてほとんどのテストランナーをサポートします。公式の例では[Vitest](https://vitest.dev/)を使用していますが、[Jest](https://jestjs.io/)、[Mocha](https://mochajs.org/)、その他さまざまなテストフレームワークも使用できます。

## 開発

[Storybook](https://storybook.js.org/)は、[`@storybook/marko`](https://github.com/storybookjs/marko)を使用してコンポーネントをプレビューするために使用できます。
