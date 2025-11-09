# カスタムタグの検出

Markoのカスタムタグは、アプリケーション全体でマークアップを再利用することを可能にします。

## 優先順位

Markoで`<Tag>`を使用する場合、以下の順序で解決されます:

- [カスタムタグの検出](#カスタムタグの検出)
  - [優先順位](#優先順位)
  - [ローカル変数カスタムタグ](#ローカル変数カスタムタグ)
  - [相対カスタムタグ](#相対カスタムタグ)
  - [インストール済みカスタムタグ](#インストール済みカスタムタグ)
  - [サポートファイル](#サポートファイル)

## ローカル変数カスタムタグ

タグ名が大文字で始まる場合、Markoはまず同じ名前のローカル変数を確認します。

これは、[自動的に検出](#相対カスタムタグ)できないカスタムタグをインポートする際に便利です。

```marko
import MyTag from "./my-tag.marko"

<MyTag/>
```

または、[`<define>`タグ](./core-tag.md#define)を使用する場合:

```marko
<define/MyTag|input: { name: string }| foo=1>
  <span>Hello ${input.name}</span>
</>

<MyTag name="HTML"/>
<MyTag name="Marko"/>
```

> [!NOTE]
> `PascalCase`では_ない_ローカル変数を参照する必要がある場合は、[動的タグ](./language.md#dynamic-tags)を使用できます。
>
> ```marko
> import { camelCaseTag } from "somewhere"
>
> <${camelCaseTag} />
> ```

## 相対カスタムタグ

Markoが[ローカル変数タグ名](#ローカル変数カスタムタグ)を解決できなかった場合、ファイルシステムをチェックします。現在のファイルから、以下を再帰的に上方向へ探します:

- `tags/TAG_NAME.marko`
- `tags/TAG_NAME/index.marko`
- `tags/TAG_NAME/TAG_NAME.marko`

これをよりよく理解するために、ディレクトリ構造の例を見てみましょう:

```
tags/
    app-header.marko
    app-footer.marko
pages/
    about/
        tags/
            team-members.marko
        page.marko
    home/
        tags/
            home-banner.marko
        page.marko
```

ファイル`pages/home/page.marko`は以下を解決できます:

- `<app-header>`
- `<app-footer>`
- `<home-banner>`

そして、ファイル`pages/about/page.marko`は以下を解決できます:

- `<app-header>`
- `<app-footer>`
- `<team-members>`

`home`ページは`<team-members>`を解決できず、`about`ページは`<home-banner>`を解決できません。ネストされた`tag/`ディレクトリを使用することで、ページ固有のタグをそれぞれのページにスコープしています。

## インストール済みカスタムタグ

ローカル変数または相対カスタムタグが見つからない場合、Markoは`node_modules`内のインストール済みタグライブラリをチェックします。

Markoカスタムタグを提供するパッケージは、ルートに`marko.json`を含める必要があり、これがエクスポートされたタグの場所をMarkoに伝えます。

```json
/* marko.json */
{
  "exports": "./dist/tags"
}
```

この例のファイルは、パッケージを使用するアプリケーションに対して、`dist/tags/`ディレクトリ直下のすべてのカスタムタグを公開するようMarkoに指示します。

> [!TIP]
> タグライブラリには「プライベートタグ」と「エクスポートされたタグ」があることがよくあります。これを実現する一般的な方法は、エクスポートされた`tags/`フォルダの_内部_に`tags/`フォルダを配置することです🤯。
>
> 例えば、`dist/tags`をエクスポートする場合、`dist/tags/tags/`にはライブラリ_内部_でのみ利用可能なプライベートコンポーネントを含めることができます。

> [!CAUTION]
> 2つのパッケージが同じタグ名をエクスポートする場合、Markoは最初に見つけたものを選択します。衝突を防ぐために、タグライブラリはすべてのエクスポートされたタグ名にプレフィックスを付けることが推奨されます（例: `ebay-`）。競合する名前のタグを使用する必要がある場合は、パスでインポートして曖昧さを解消できます。

## サポートファイル

Markoは、`.marko`ファイルに隣接する[`style`](./styling.md)および`marko-tag.json`ファイルを検出します。

```
foo.marko
foo.style.css
foo.marko-tag.json
```

ここでは、`<foo>`タグに関連するスタイルとメタデータがあります。

ファイル名が`index.marko`の場合、プレフィックスはオプションです。

```
tags/
  bar/
    index.marko
    style.css
  baz/
    index.marko
    marko-tag.json
```

ここでは、`<bar>`タグに関連する`style.css`があり、`<baz>`タグに関連する`marko-tag.json`があります。

`style`ファイルには任意の拡張子を使用でき、CSSプリプロセッサが利用できます。

```
tags/
  less/
    index.marko
    style.less
  scss/
    index.marko
    style.scss
```
