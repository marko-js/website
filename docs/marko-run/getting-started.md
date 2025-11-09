# はじめに

Marko Run は、Marko で Web アプリケーションを構築するためのフレームワークです。これは Marko の _メタ_ フレームワークで、React の Next.js や Remix、Svelte の SvelteKit、Vue の Nuxt と同様のものです。

Marko Run は、優れた開発者体験を提供する高速で最新のビルドツールである Vite を使用しています。使いやすく柔軟性があり、開発者が Marko でアプリケーションを迅速かつ効率的に構築できるように設計されています。

## テンプレートの使用

Marko の CLI は、Marko を始めるためのさまざまなテンプレートを提供しており、その多くは Marko Run を使用しています。

```sh
npm init marko
```

## ゼロから始める

最小限の Marko Run プロジェクトには、わずか数個のファイルが必要です。

```sh
npm init
npm install @marko/run
```

## 既存のプロジェクトへの追加

Marko Run は、パッケージをインストールすることで既存の Marko プロジェクトに追加できます。

```sh
npm install @marko/run
```

## ゼロコンフィグ設定

`marko-run` は、最小限の設定で迅速なプロジェクトの初期化を可能にします。パッケージには、デフォルトの Vite 設定と node ベースのアダプターが付属しています。

テンプレートから始める場合：

1. 新しいプロジェクトを作成

   ```sh
   npm init marko -- -t basic
   ```

2. プロジェクトディレクトリに移動

   ```sh
   cd PROJECT_NAME
   ```

3. 開発サーバーを起動

   ```sh
   npm run dev
   ```

手動でプロジェクトを設定する場合：

1. 必要なパッケージをインストール：`npm install @marko/run`
2. エントリーファイルを作成：`src/routes/+page.marko`
3. 開発サーバーを起動：`npm exec marko-run`

アプリケーションは `http://localhost:3000` で利用可能になります 🚀

## CLI コマンド

### `marko-run dev`

ウォッチモードで開発サーバーを起動します

```sh
npm exec marko-run
```

または（明示的なサブコマンドを使用）

```sh
npm exec marko-run dev
```

### `marko-run build`

本番用ビルドを作成します

```sh
npm exec marko-run build
```

### `marko-run preview`

本番用ビルドを作成し、プレビューサーバーを起動します

```sh
npm exec marko-run preview
```
