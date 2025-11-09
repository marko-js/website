# HTML ストリーミング

> [!TLDR]
>
> - HTML ストリーミングはコンテンツをブラウザに段階的に送信する
> - `<await>` と `<try>` タグは非同期レンダリングを可能にする
> - 組み込みのエラーハンドリングとローディング状態が含まれる

Marko は、`<await>` と `<try>` を介して HTML ストリーミングへの強力でありながらシンプルな宣言的アプローチを提供し、ページの知覚されるパフォーマンスと実際のパフォーマンスを向上させます。

ストリーミングは、生成されるデータを段階的に送信するプロセスです。ウェブでは、**HTML ストリーミング**とは、ドキュメント全体が完成するまで待つのではなく、準備ができ次第、HTML をブラウザにチャンクごとに送信することを意味します。

対照的に、**バッファリング**とは、完全な HTML ページを最初に生成し、その後でのみブラウザに送信することを意味します。

## 背景と歴史

- **プログレッシブレンダリングの起源**

  - ブラウザは、1994年にリリースされた Netscape Navigator 1.0 の頃から、部分的な HTML ページをレンダリングする能力であるプログレッシブレンダリングをサポートしていました
  - チャンク転送エンコーディング（サーバーが部分的なレスポンスを送信できるようにする）は、1999年に HTTP/1.1 の一部として導入されました
    - HTTP/2 と HTTP/3 はデフォルトでチャンク化されています（技術的には[フレーム化](https://httpwg.org/specs/rfc7540.html#:~:text=of%20the%20connection.-,frame,-%3A)）
  - プロトコルレベルでサポートされているにもかかわらず、ほとんどのプログラミング言語のほとんどの高レベルウェブライブラリは HTML レスポンスをバッファリングしてきました
  - JS エコシステム内では、2020年代になってようやく HTML ストリーミングがよりメインストリームになり始めました

- **Marko のストリーミング履歴**

  - Marko は[2014年の設立以来](https://innovation.ebayinc.com/stories/async-fragments-rediscovering-progressive-html-rendering-with-marko/)ストリーミングをサポートしています

### HTML ストリーミングのタイプ

- **順序どおりのストリーミング**

  - HTML はドキュメント構造の正確な順序で到着します。

- **順序どおりでないストリーミング**

  - HTML フラグメントは、シーケンスが順不同であっても、データが準備できると到着します。
  - クライアント側で HTML を正しい順序に並べ替えるために、最小限の JavaScript が必要です。

## ストリーミングのメリット

### 知覚されるパフォーマンス（ユーザーエクスペリエンス）

- ユーザーは即座にコンテンツを見ることができ、エンゲージメントが向上します。
- プログレッシブコンテンツを表示することで、知覚される読み込み時間を大幅に短縮します。

### 実際のパフォーマンス（ネットワークとレンダリング）

- **最初のバイトまでの時間（TTFB）の短縮**
  コンテンツがより早く到着し始め、ブラウザは即座に解析を開始します。
- **より早いアセットのダウンロード**
  ページ全体の HTML が完成する前に、CSS、フォント、JavaScript のダウンロードを開始できます。
- **インタラクティブになるまでの時間（TTI）の改善**
  ユーザーは表示されているコンポーネントとより早くインタラクションを開始できます。

### サーバー負荷の削減

- 段階的なストリーミングはメモリ使用量を削減します。
- レイテンシの低下とスループットの向上。

## Marko 6 を使用したストリーミング方法

Marko は、非同期 HTML 生成とストリーミングを処理するための直感的な組み込みタグを提供します：

### `<await>`

テンプレートのセクションをレンダリングするために Promise を待機します

**構文例：**

```marko
<await|user|=getUser()>
  <img src=user.avatar>
  ${user.name}
</await>
```

- Marko は `<await>` まで可能な限り多くの HTML コンテンツをフラッシュします
- `getUser()` が解決されると、残りの HTML がフラッシュされます

### `<try>`

非同期境界を管理し、ローディング状態を処理し、ストリーミング（および非ストリーミング）HTML 内でエラーを適切にキャッチします。

**基本構文：**

```marko
<try>
  <await|user|=getUser()>
    ${user.name}
  </await>

  <@placeholder>
    Loading...
  </@placeholder>

  <@catch|err|>
    Error: ${err.message}
  </@catch>
</try>
```

#### `@placeholder`

- 非同期データが読み込まれている間、即座に表示される一時的なコンテンツを提供します。
- 順序どおりでないレンダリングを選択します。
  - Marko は、ドキュメントの順序に関係なく、準備ができ次第 HTML フラグメントをレンダリングすることをサポートします。
  - 正しい最終的な配置のために、クライアント側で DOM 要素を並べ替えるための最小限の JavaScript を自動的に挿入します。

#### `@catch`

- レンダリングされたコンテンツ内で発生するランタイムエラーをキャプチャして処理し、ページ全体が壊れるのを防ぎます。

## トラブルシューティングと一般的な落とし穴

### レイアウトシフトの回避（CLS）

順序どおりでないストリーミングには、準備ができると実際のコンテンツに置き換えられる一時的なプレースホルダーが含まれます。適切に処理されないと、ユーザーが読んでいたりインタラクションしているコンテンツがシフトし、ユーザーエクスペリエンスが低下する可能性があります。

- 正しいスペースを確保するプレースホルダーを使用します。
- コンテンツを正確に表すローディングインジケーター/スケルトン画面を利用します。
- 意味がある場合や、コンテンツサイズを決定できない場合は、順序どおりのストリーミングにフォールバックします

### バッファリングの回避

ストリーミングは数十年前からウェブでサポートされており、より多くのツールがそれを利用していますが、サードパーティのデフォルト設定の一部は、バッファリングされたレスポンスを前提としている場合があります。以下は、サーバーの出力 HTTP ストリームをバッファリングする可能性のある既知の原因です：

#### リバースプロキシ/ロードバランサー

- プロキシバッファリングをオフにするか、できない場合は、プロキシバッファサイズを合理的に小さく設定します。
- 「アップストリーム」HTTP バージョンが 1.1 以上であることを確認してください。HTTP/1.0 以下はストリーミングをサポートしていません。
- 一部のソフトウェアは、HTTP/2 以上の「アップストリーム」接続をまったくサポートしていないか、あまりうまくサポートしていません。Node サーバーが HTTP/2 を使用している場合は、ダウングレードが必要になる場合があります。
- 「アップストリーム」接続が `keep-alive` かどうかを確認してください：接続を閉じて再度開くオーバーヘッドがレスポンスを遅らせる可能性があります。
- 典型的な現代のウェブページファイルサイズの場合、以下の項目はおそらく重要ではありません。しかし、**最も低いレイテンシで小さなデータチャンクをストリーミングしたい**場合は、以下のバッファリングのソースを調査してください：
  - 自動 gzip/brotli 圧縮のバッファサイズが高すぎる設定になっている可能性があります。わずかに圧縮が悪化する代わりに、より高速なストリーミングのためにバッファを小さくチューニングできます。
  - [High Performance Browser Networking で説明されているように、低レイテンシのために HTTPS レコードサイズをチューニング](https://hpbn.co/transport-layer-security-tls/#optimize-tls-record-size)できます。
  - [`X-Content-Type-Options` ヘッダー](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options)で MIME スニッフィングをオフにすると、HTTP レスポンスの最初でのブラウザバッファリングが排除されます

<details>
  <summary><strong>NGiNX</strong></summary>

NGiNX の関連するパラメータのほとんどは[組み込みの `http_proxy` モジュール](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_buffering)内にあります：

```
proxy_http_version 1.1; # デフォルトは 1.0
proxy_buffering off; # デフォルトは on
```

</details>

<details>
  <summary><strong>Apache</strong></summary>

Apache のデフォルト設定はストリーミングで問題なく動作しますが、ホストが異なる設定をしている可能性があります。関連する Apache 設定は[`mod_proxy` および `mod_proxy_*` モジュール](https://httpd.apache.org/docs/2.4/mod/mod_proxy.html)と、それらの[関連する環境変数](https://httpd.apache.org/docs/2.4/env.html)内にあります。

</details>

#### CDN

コンテンツデリバリーネットワーク（CDN）は、効率的なストリーミングを最良の機能の1つと考えていますが、デフォルトでオフになっているか、特定の機能が有効になっている場合があります。

<details>
  <summary><strong>Fastly (Varnish)</strong></summary>

Fastly または VCL 設定を使用する別のプロバイダーの場合、[バックエンドレスポンスに `beresp.do_stream = true` が設定されているかどうか](https://developer.fastly.com/reference/vcl/variables/backend-response/beresp-do-stream/)を確認してください。

</details>
<details>
  <summary><strong>Akamai</strong></summary>

遅いバックエンドを軽減するように設計された[一部の Akamai 機能は、皮肉なことに高速チャンクレスポンスを遅くする可能性があります](https://community.akamai.com/customers/s/question/0D50f00006n975d/enabling-chunked-transfer-encoding-responses)。Adaptive Acceleration、Ion、mPulse、Prefetch、および/または類似のパフォーマンス機能をオフにしてみてください。また、設定内で以下を確認してください：

```
<network:http.buffer-response-v2>off</network:http.buffer-response-v2>
```

</details>

#### Node.js 自体

[Node が組み込みの圧縮モジュールで非常に小さな HTML チャンクをストリーミングする](https://github.com/marko-js/marko/pull/1641)極端なケースでは、コンプレッサーストリーム設定を調整する必要がある場合があります。以下は `createGzip` とその `Z_PARTIAL_FLUSH` フラグの例です：

```js
import http from "http";
import zlib from "zlib";

import MarkoTemplate from "./something.marko";

http
  .createServer(function (request, response) {
    response.writeHead(200, { "content-type": "text/html;charset=utf-8" });
    const templateStream = MarkoTemplate.stream({});
    const gzipStream = zlib.createGzip({
      flush: zlib.constants.Z_PARTIAL_FLUSH,
    });
    templateStream.pipe(outputStream).pipe(response);
  })
  .listen(80);
```
