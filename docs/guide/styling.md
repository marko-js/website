# スタイリング

このセクションでは、Marko 内で HTML をスタイリングするためのいくつかの異なる方法を説明します。シンプルなインラインスタイルから、整理された保守可能なスタイルシートのための CSS モジュールのような強力な手法まで。

## インラインスタイル

Marko は[HTML `<style>` タグを拡張](../reference/core-tag.md#style)して、[プロジェクトで使用されているバンドラー](TODO)によって処理および最適化されるようにします。テンプレートは任意の数の `<style>` タグを指定できます。

デフォルトでは、テンプレートで定義されたすべてのスタイルは**グローバルスコープ**です。そのため、多くの Marko プロジェクトは[BEM](https://getbem.com/introduction/)のようなパターンを使用して名前の競合を回避しています。

```marko
<style>
  /* 一度バンドルされ、読み込まれる */
  .fancy {
    color: green;
  }
</style>

<div class="fancy">Hello!</div>
```

`<style>` には、[scss](https://sass-lang.com/documentation/syntax/#scss) や [less](https://lesscss.org/) などの CSS プリプロセッサを有効にするためのファイル拡張子を含めることができます。

```marko
<style.scss>
  $primary-color: green;

  .fancy-scss {
    color: $primary-color;
  }
</style>

<div class="fancy-scss">Hello!</div>

<style.less>
  @primary-color: blue;

  .fancy-less {
    color: @primary-color;
  }
</style>

<div class="fancy-less">Hello!</div>
```

### インライン CSS モジュール

`<style>` タグに[タグ変数](../reference/language.md#tag-variables)がある場合、[CSS モジュール](https://github.com/css-modules/css-modules)を活用して、そのクラスをオブジェクトとして公開します。

```marko
<style/styles>
  .foo { border: 1px solid red }
  .bar { background: green }
</style>

<div class=styles.foo />
<div class=[styles.foo, styles.bar] />
<div class={ [styles.bar]: true } />
<div.${styles.foo} />
```

このアプローチにより、[BEM](https://getbem.com/introduction/)のような命名規則に従う必要なく、CSS クラス名のスコープを設定できます。

プリプロセッサを使用するために、カスタムファイル拡張子を提供することもできます。

```marko
<style.scss/styles>
  $primary-color: green;

  .fancy {
    color: $primary-color;
  }
</style>

<div class=styles.fancy>Hello</div>
```

## 自動検出されるスタイル

[カスタムタグに隣接するスタイリングファイルは自動的に検出されます](../reference/custom-tag.md#supporting-files)。これらのファイルは、[インラインスタイル](#inline-styles)と同じようにインポートおよび処理されます。

```css
/* style.css */
.fancy {
  color: green;
}
```

```marko
/* index.marko */
<div class="fancy">Hello!</div>
```

> [!TIP]
> テンプレートが大きくなりすぎた場合、このようにスタイリングを関連するスタイルファイルに抽出すると便利です。

## インポートされたスタイル

スタイルは[インポート](../reference/language.md#import)することもできます。

```css
/* fancy.css */
.fancy {
  color: red;
}
```

```marko
/* index.marko */
import "./fancy.css";

<div class="fancy">Hello!</div>
```

> [!TIP]
> 一般的には[インライン](#inline-styles)または[自動検出](#auto-discovered-styles)スタイルが好まれますが、テンプレート間で共有する場合は、スタイルをインポートすると便利です。

### インポートされた CSS モジュール

[CSS モジュールファイル](https://github.com/css-modules/css-modules)もインポートできます。

```css
/* something.module.css */
.fancy {
  color: red;
}
```

```marko
/* index.marko */
import * as styles from "./something.module.css";
<div class=styles.fancy/>
```

> [!CAUTION]
> ほとんどのバンドラーは、デフォルトで `*.module.css` ファイルに対して CSS モジュールをサポートするように設定されているため、これはそのまま動作するはずです。バンドラーでサポートされていない場合でも、ほぼ確実にプラグインがあります。
