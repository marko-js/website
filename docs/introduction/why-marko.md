# なぜMarkoなのか？

Markoは、開発者エクスペリエンスやユーザーパフォーマンスを犠牲にすることなく、高速でスケーラブル、堅牢で保守性の高いアプリケーションを提供します。JavaScriptの抽象化で置き換えるのではなく、HTML自体を進化させることで、ウェブ開発における3つの基本的な問題に対処します。

## 3つの問題

最新のウェブ開発は、フロントエンドフレームワークの進化を形成してきた一連の相互接続された課題に直面しています。これらの問題を理解することは、現在のソリューションが過剰に修正され、新しい問題を生み出しているかどうかを評価するために不可欠です。

### HTMLはスケールできない

HTMLは動的なアプリケーションではなく、静的なドキュメント用に設計されました。この基本的な制限により、アプリケーションの複雑さが増すにつれて、いくつかの連鎖的な問題が発生します。

HTMLは、アプリケーションのさまざまな部分にわたって動的な状態を調整するメカニズムを提供しません。ショッピングカートページを考えてみましょう：

```html
/* index.html */
<!DOCTYPE html>
<html>
<head>
  <title>My Store</title>
  <script src="script.js"></script>
</head>
<body>
  <!-- Navigation with cart badge -->
  <nav>
    <span>Cart (<span id="nav-count">0</span>)</span>
  </nav>
  
  <!-- Product list -->
  <div class="products">
    <button onclick="addItem('Widget', 10)">Add Widget - $10</button>
    <button onclick="addItem('Gadget', 15)">Add Gadget - $15</button>
  </div>
  
  <!-- Cart summary -->
  <div id="cart">
    <p>Items: <span id="cart-count">0</span></p>
    <p>Total: $<span id="cart-total">0</span></p>
  </div>
  
  <!-- Maybe also a checkout button that should be disabled when empty -->
  <button id="checkout" disabled>Checkout</button>
</body>
</html>
```

```javascript
/* script.js */
function addItem(name, price) {
  // Update navigation badge
  const navCount = document.getElementById('nav-count');
  const newNavCount = parseInt(navCount.textContent) + 1;
  navCount.textContent = newNavCount;

  // Update cart summary
  const cartCount = document.getElementById('cart-count');
  const cartTotal = document.getElementById('cart-total');

  cartCount.textContent = newNavCount;
  cartTotal.textContent = parseFloat(cartTotal.textContent) + price;

  // Enable checkout button if it was disabled
  const checkout = document.getElementById('checkout');
  if (newNavCount > 0) {
    checkout.disabled = false;
  }

  // Any other UI that depends on cart state also needs manual updates...
}
```

すべての状態変更には、複数のDOM要素にわたる手動の調整が必要です。この関数は、ナビゲーションバッジ、カートサマリー、チェックアウトボタンの状態を独立して更新する必要があります。カートの状態に依存する各UI要素には明示的な更新が必要であり、アプリケーションが成長するにつれて、この調整は指数関数的に複雑になります。

コンポーネント化は別の課題を提示します。カスタム要素や`<template>`タグのような最新のプラットフォーム機能は、ある程度のカプセル化を提供しますが、独自の複雑さをもたらします：

```javascript
/* modal-dialog.js */
class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <div class="modal hidden">
        <div class="modal-content">
          <button id="close">×</button>
          <slot></slot>
        </div>
      </div>
    `;
    
    this.modal = this.shadowRoot.querySelector('.modal');
    this.shadowRoot.querySelector('#close').onclick = () => this.close();
  }
  
  open() { this.modal.classList.remove('hidden'); }
  close() { this.modal.classList.add('hidden'); }
}

customElements.define('modal-dialog', ModalDialog);
```

```html
/* index.html */
<button onclick="nextElementSibling.open()">
  Open Modal
</button>
<modal-dialog>
  <p>Modal content...</p>
</modal-dialog>
```

これはカプセル化を提供しますが、基本的な機能には大量のボイラープレートが必要です。コンポーネント間の状態管理には依然として手動の調整が必要であり、命令的API（`.open()`と`.close()`の呼び出し）はリアクティブなデータフローとうまく組み合わせることができません。

### コンポーネントの調整

再利用可能でカプセル化されたコンポーネントを構築するには、大量のボイラープレートと手動の調整が必要です。カスタム要素のような最新のプラットフォーム機能でさえ、アプリケーション要件とともに増大する複雑さを課し、コンポーネント開発を面倒でエラーが発生しやすいものにします。

カスタム要素でモーダルコンポーネントを実装することを考えてみましょう：

```javascript
/* modal-dialog.js */
class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <div class="modal hidden">
        <div class="modal-content">
          <button id="close">×</button>
          <slot></slot>
        </div>
      </div>
    `;
    
    this.modal = this.shadowRoot.querySelector('.modal');
    this.shadowRoot.querySelector('#close').onclick = () => this.close();
  }
  
  open() { this.modal.classList.remove('hidden'); }
  close() { this.modal.classList.add('hidden'); }
}

customElements.define('modal-dialog', ModalDialog);
```

```html
/* index.html */
<!-- Usage -->
<button onclick="nextElementSibling.open()">Open Modal</button>
<modal-dialog>
  <p>Modal content...</p>
</modal-dialog>
```

このコンポーネントはカプセル化を提供しますが、基本的な機能には広範なセットアップコードが必要です。コンポーネント間の状態管理には依然として手動の調整が必要であり、命令的API（`.open()`と`.close()`の呼び出し）はリアクティブなデータフローとうまく組み合わせることができません。

コンポーネント間の通信はますます複雑になります。複数のインターフェース要素間で調整する必要があるショッピングカートを考えてみましょう：

```javascript
// Manual coordination across components
class CartManager {
  constructor() {
    this.items = [];
    this.subscribers = [];
  }

  addItem(item) {
    this.items.push(item);
    this.notifySubscribers();
  }

  subscribe(callback) {
    this.subscribers.push(callback);
  }

  notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.items));
  }
}

// Each component needs manual subscription management
class CartBadge extends HTMLElement {
  connectedCallback() {
    cartManager.subscribe(items => {
      this.textContent = items.length;
    });
  }
}

class CartTotal extends HTMLElement {
  connectedCallback() {
    cartManager.subscribe(items => {
      const total = items.reduce((sum, item) => sum + item.price, 0);
      this.textContent = `$${total}`;
    });
  }
}
```

カートデータを必要とするすべてのコンポーネントは、更新を手動でサブスクライブし、クリーンアップを処理し、独自の状態を調整する必要があります。数量管理、割引、または永続化などの機能を追加するには、複数のコンポーネントに触れ、手動の同期を維持する必要があります。調整のオーバーヘッドは、アプリケーションの複雑さとともに指数関数的に増大します。

### ランタイムの負担

開発の決定は、開発者ではなくユーザーに継続的なコストを課します。ビルドプロセス中に1回で済む作業が、ユーザーセッション全体で何百万回も繰り返され、アプリケーションのスケールとともに蓄積される不必要なオーバーヘッドを生み出します。

ユーザーセッション全体でのテンプレート解析を考えてみましょう。すべてのユーザーのブラウザが同一の分析を繰り返します：

```javascript
// This analysis happens for every user, every session
function processTemplate(template) {
  // Parse component structure
  const ast = parseTemplate(template);

  // Identify dynamic parts
  const dynamicNodes = findDynamicNodes(ast);

  // Build dependency graph
  const dependencies = analyzeDependencies(dynamicNodes);

  // Generate update strategies
  const updatePlan = createUpdatePlan(dependencies);

  return { ast, dynamicNodes, dependencies, updatePlan };
}

// Identical analysis repeated across millions of users
const userSession1 = processTemplate(blogTemplate); // Same result
const userSession2 = processTemplate(blogTemplate); // Same result
const userSession3 = processTemplate(blogTemplate); // Same result
```

この分析は、テンプレート構造が静的であるため、すべてのユーザーに対して同一の結果を生成します。解析ロジック、依存関係、更新戦略は一定のままですが、各ブラウザはこの作業を独立して実行します。

コンポーネントの最適化は、負担を明確に示します。シンプルな実装は継続的なコストを生み出し、最適化されたバージョンには広範な調整が必要です：

```javascript
// Creates burden: every render recalculates everything
class ProductList extends Component {
  render() {
    const sortedProducts = this.props.products
      .sort((a, b) => a.price - b.price)  // Repeated calculation
      .filter(p => p.inStock);            // Repeated filtering

    return sortedProducts.map(product =>   // Repeated mapping
      `<div class="product">${product.name}: $${product.price}</div>`
    ).join('');
  }
}

// Reduces burden: pre-computed, cached, code-split
class OptimizedProductList extends Component {
  constructor(props) {
    super(props);
    this.memoizedSort = framework.createMemo();
    this.virtualizer = framework.createVirtualizer();
  }

  render() {
    const sorted = this.memoizedSort(
      () => this.props.products.sort((a, b) => a.price - b.price),
      [this.props.products]
    );

    return this.virtualizer.render(sorted, this.renderProduct);
  }
}
```

負担はサーバーサイドの操作にも及び、同一の作業がリクエスト全体で繰り返されます。各リクエストは同じコンポーネント階層を再構築し、予測可能なレンダリングロジックを実行します：

```javascript
app.get('/product/:id', async (req, res) => {
  // 1. Parse and compile component tree structure
  const componentTree = buildServerComponents();

  // 2. Resolve data dependencies
  const productData = await fetchProduct(req.params.id);
  const recommendations = await fetchRecommendations(productData.category);

  // 3. Execute render logic
  const html = framework.renderToString('ProductPage', {
    product: productData,
    recommendations: recommendations
  });

  // 4. Generate final HTML with boilerplate
  res.send(wrapWithLayout(html));
});
```

すべてのリクエストは、テンプレートのコンパイル、依存関係の解決、静的部分に対して事前計算できるHTML生成作業を実行します。このオーバーヘッドは同時ユーザー全体で倍増し、サーバーリソースを消費し、応答時間を増加させます。

フレームワークがランタイム効率よりも開発者の利便性を優先するため、負担はユーザーに転嫁されます。各ユーザーは、最初の計算後は誰にも利益をもたらさない分析のためにCPUサイクルとバッテリー寿命を支払います。数百万人のユーザーを持つアプリケーションは、同一の計算を数十億回繰り返し、ビルド時の分析によって排除できる集合的なリソースを消費します。

## 3つのソリューション

Markoは、トレードオフを管理するのではなく排除する基本的なアーキテクチャの決定を通じて、これらの問題に対処します。このアプローチは、HTMLの強みを保持しながら、その機能を拡張することに焦点を当てています。

### HTMLを拡張する

JavaScriptからHTMLを生成するのではなく、Markoは最新のアプリケーションが必要とする言語機能でHTMLを強化します。これにより、スケーラビリティの制限に対処しながら、プラットフォームの整合性が保たれます。

テンプレートは馴染みのあるHTMLとして始まり、自然に進化します。ほぼすべてのHTMLコードがMarkoコードとして機能します。

```marko
/* products.marko */
<h1>My Products</h1>
<ul>
  <li>Widget - $10</li>
  <li>Gadget - $15</li>
</ul>
```

状態と制御フローはマークアップに直接統合されます：

```marko
/* products.marko */
<h1>My Products</h1>
<ul>
  <for|product| of=input.products>
    <li>${product.name} - $${product.price}</li>
  </for>
</ul>
```

非同期操作は宣言的になります：

```marko
/* products.marko */
<h1>My Products</h1>
<try>
  <await|products|=fetchProducts()>
    <ul>
      <for|product| of=products>
        <li>${product.name} - $${product.price}</li>
      </for>
    </ul>
  </await>

  <@placeholder>
    Loading products...
  </@placeholder>

  <@catch|error|>
    Failed to load: ${error.message}
  </@catch>
</try>
```

この進化にはアーキテクチャの変更は必要ありません。状態管理はマークアップ言語の一部となり、ドキュメント構造とアプリケーションロジック間の概念的なギャップが解消されます。このアプローチは、必要な機能を追加しながら、HTMLの可読性とブラウザの互換性を保持します。

### コンポーネントのカプセル化

Markoは、カスタム要素のボイラープレートと複雑さなしに、真のコンポーネントカプセル化を提供します。コンポーネントは、関連するHTML、スタイリング、動作を、命令的ではなく宣言的に機能する凝集性のある単位にグループ化します。

広範なカスタム要素のセットアップが必要だったモーダルコンポーネントは、シンプルになります：

```marko
/* modal.marko */
<let/open=false>

<button onClick() { open = true }>Open Modal</button>

<div style={ display: open ? "block" : "none" } class=styles.modalContent>
  <button onClick() { open = false }>×</button>
  <${input.content}/>
</div>

<style/styles>
  .modalContent {
    background: white;
    margin: 50px auto;
    padding: 20px;
    width: 300px;
  }
</style>
```

使用には命令的なAPI呼び出しや手動の状態調整は必要ありません：

```marko
<modal>
  <p>Modal content goes here</p>
</modal>
```

状態はコンポーネントを通じて宣言的に流れます。開閉動作はマークアップ構造と自然に統合されます。

このカプセル化はインタラクティブなコンポーネントにも拡張されます。複数の要素間で調整する評価コンポーネントを考えてみましょう：

```marko
<let/rating=0>
<let/hovering=0>

<div>
  <for|i| from=1 to=5>
    <button
      class=((hovering || rating) >= i && 'filled')
      onPointerEnter() { hovering = i }
      onPointerLeave() { hovering = 0 }
      onClick() { rating = i; hovering = 0 }
    >*</button>
  </for>
  <span>
    <if=(hovering > 0)>
      ${hovering} star${hovering > 1 ? 's' : ''}
    </if>
    <else if=(rating > 0)>
      Rated ${rating} star${rating > 1 ? 's' : ''}
    </else>
    <else>
      Click to rate
    </else>
  </span>
</div>
```

コンポーネント間の通信は、グローバル参照や手動調整ではなく、プロパティとイベントを通じて行われます。状態の変更は、明示的な配線なしで、依存する要素に自動的に伝播します。

### コンパイル時のインテリジェンス

Markoのコンパイルアプローチにより、ランタイムのみのソリューションでは達成できない最適化が可能になります。ビルドプロセス中にテンプレートを分析することで、コンパイラはコード生成、依存関係の追跡、ランタイムでは不可能または高コストなパフォーマンス最適化について決定を下します。

選択的なコード生成により、最小限のJavaScriptバンドルが生成されます：

```marko
<div>
  // Static content: no JavaScript generated
  <p>This is static content</p>

  // Stateful content: targeted JavaScript generated
  <let/count=0>
  <button onClick() { count++ }>
    Clicked ${count} times
  </button>
</div>
```

コンパイラは、インタラクティブな動作を必要とするコンポーネントに対してのみクライアント側のJavaScriptを生成します。静的コンテンツはプレーンなHTMLにコンパイルされ、動的セクションには特定の動作に必要なJavaScriptのみが含まれます。

リアクティビティの分析は、ランタイムではなくコンパイル時に行われます：

```marko
<let/firstName="John">
<let/lastName="Doe">
<const/fullName=`${firstName} ${lastName}`>

<input value:=firstName>
<input value:=lastName>

<h1>Hello, ${fullName}!</h1>
<p>Your initials are ${firstName[0]}${lastName[0]}</p>
```

`firstName`が変更されると、コンパイラは入力値、派生した`fullName`、h1テキスト、段落のイニシャルへの更新を保証します。この分析により、依存する要素のみに影響する最適な更新コードが生成され、ランタイムの依存関係追跡オーバーヘッドを排除しながら、外科的なDOM更新が可能になります。

デュアル環境最適化は、サーバーとクライアント用にテンプレートを個別にコンパイルし、それぞれが特定の制約に最適化されます。サーバーコンパイルは、効率的な文字列連結とストリーミングサポートによりHTML生成のスループットを優先します。クライアントコンパイルは、バンドルサイズと正確な更新に焦点を当て、フレームワークの抽象化ではなく直接的なDOM操作を生成します。

## 結果

これらのアーキテクチャの決定により、時間の経過とともに劣化するのではなく改善する特性を持つアプリケーションが生成されます。コンパイルアプローチはビルド時に複雑さを処理し、開発チームがフレームワークの調整ではなく機能実装に集中できるようにします。

パフォーマンスは努力の結果ではなく自動的なものになります。デフォルトのストリーミングは、コンテンツが利用可能になり次第配信します。選択的なJavaScript生成は、完全な機能を維持しながらバンドルサイズを最小化します。正確な更新は依存するDOMノードのみに影響します。プログレッシブローディングは、インタラクティブな機能が段階的に強化される間、重要なコンテンツを最初にレンダリングします。

保守性は体系的な設計から生まれます。共同配置された関心事により、コンポーネント構造、スタイリング、動作が統一され、アプリケーションの複雑さとともに通常増大する調整オーバーヘッドが排除されます。TypeScript統合により、JavaScript分析と同等のテンプレートレベルの型チェックが提供されます。コンパイラは、ランタイムの失敗として現れるであろうエラーカテゴリをビルド時に識別します。

コンポーネントの柔軟性は、アーキテクチャの変更なしに進化する要件をサポートします。アプリケーションは、シンプルな非制御コンポーネントから始めて必要に応じて調整を追加したり、適切な場合に複雑な検証と同期パターンを実装したりできます。

プログレッシブエンハンスメントは、アーキテクチャから自然に発生します。アプリケーションはJavaScriptなしで機能し、JavaScriptで強化され、多様なユーザー環境をサポートし、回復力を向上させます。この特性は、アプリケーションがさまざまなデバイス機能とネットワーク条件を持つより広いユーザーベースにサービスを提供するにつれて、ますます価値が高まります。

結果として、最適化技術ではなく体系的な設計を通じて高いパフォーマンスと保守性を達成するアプリケーションを生み出す、ウェブプラットフォームの進化と対立するのではなく整合する開発アプローチが得られます。

## 次のステップ

- [Markoへようこそ](./welcome-to-marko.md)
- [コンポーネントとリアクティビティのチュートリアル](../tutorial/components-and-reactivity.md)
- [言語リファレンス](../reference/language.md)
