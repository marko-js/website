# Markoの基礎

> [!TLDR]
>
> MarkoはHTMLをベースに構築されており、コンポーネントとJavaScriptベースの補間を可能にします

Markoは、HTMLを知っていれば親しみやすく感じられるように設計されており、動的でインタラクティブなウェブサイトを簡単に構築できます。コアコンセプトを見ていきましょう。

## テンプレートはHTML

ほぼすべての有効なHTMLは、有効なMarkoコードでもあります。通常のHTMLから始めて、必要に応じて徐々に機能を追加できます。

```marko
<h1>My Blog</h1>
<nav>
  <a href="/about">About</a>
  <a href="/contact">Contact</a>
</nav>
```

## 属性はJS

ほぼすべての有効なJavaScript式を属性値として記述できます。

```marko
<a href=`/user/${user.id}`>My Profile</a>
<a href=getRandomPage()>Discover Something New</a>
```

> [!NOTE]
> リファレンスドキュメントでは、[`...spreads`](../reference/language.md#spread-attributes)や[`methods()`](../reference/language.md#shorthand-methods)のサポートを含む[属性の詳細](../reference/language.md#attributes)について説明しています。


## 動的コンテンツ

Markoのタグコンテンツは、JavaScriptの[テンプレートリテラル](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)に似ており、[補間された`${式}`](../reference/language.md#dynamic-text)で動的なテキストを追加できます

```marko
<p>Today is ${new Date().toDateString()}</p>
<p>Random number: ${Math.floor(Math.random() * 100)}</p>
```

## コンポーネント

コードを再利用するには、別のファイルに移動できます。各`.marko`ファイルは、HTMLタグのように使用できるコンポーネントです。

```marko
/* tags/card.marko */
<div>
  <h3>Alice</h3>
  <p>Designer</p>
  <p>Joined 2023</p>
</div>
```

この`<card>`コンポーネントは、ページ内のどこでも使用できます：

```marko
<h1>Our Team</h1>
<card/>
<card/>
<card/>
```

> [!NOTE]
> `tags/`ディレクトリ内のコンポーネントは[自動的に検出](../reference/custom-tag.md#custom-tag-discovery)されます。`import`する必要はありません。

> [!TIP]
> [`<define>`タグ](../reference/core-tag.md#define)を使用して、単一のファイルに複数の「コンポーネント」を記述することもできます。

### コンポーネントへのデータの受け渡し

カスタムコンポーネントの属性は、[`input`](../reference/language.md#input)と呼ばれる特別なオブジェクトを通じて利用できます。

```marko
/* card.marko */
export interface Input {
  name: string;
  role: string;
  year: number;
}

<div>
  <h3>${input.name}</h3>
  <p>${input.role}</p>
  <p>Joined ${input.year}</p>
</div>
```

これで、`card`の各インスタンスに異なるデータを渡すことができます：

```marko
<h1>Our Team</h1>
<card name="Alice" role="Designer" year=2023/>
<card name="Bob" role="Developer" year=2024/>
<card name="Charlie" role="Product Manager" year=2022/>
```

> [!NOTE]
> コンポーネントに名前付きコンテンツを渡すために使用できる[属性タグ](../reference/language.md#attribute-tags)もチェックしてください

## コアタグ

Markoは多くの便利な[コアタグ](../reference/core-tag.md)を提供しています。たとえば、[`<if>`と`<else>`](../reference/core-tag.md#if--else)を使用して、条件に基づいてコンテンツを表示または非表示にできます。

```marko
/* tags/product.marko */
<div>
  <h3>${input.name}</h3>
  <p>$${input.price}</p>
  <if=input.stock>
    <button>Add to Cart</button>
  </if>
  <else>
    <button disabled>Out of Stock</button>
  </else>
</div>
```

これで、製品データに基づいて異なる状態を表示できます：

```marko
<product name="T-Shirt" price=25 stock=10/>
<product name="Hoodie" price=45 stock=0/>
<product name="Hat" price=15 stock=5/>
```

また、[`<for>`タグ](../reference/core-tag.md#for)を使用して繰り返しコンテンツを表示できます

```marko
<for|product| of=productsList>
  <product name=product.name price=product.price stock=product.stock/>
</for>
```

## 次のステップ

- [コンポーネントとリアクティビティ](./components-and-reactivity.md)
- [アプリの構築](../marko-run/getting-started.md)
