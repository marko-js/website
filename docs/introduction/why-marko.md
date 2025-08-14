# Why Marko?

Marko delivers fast, scalable, robust, and maintainable applications without sacrificing developer experience or user performance. It addresses three fundamental problems in web development by evolving HTML itself rather than replacing it with JavaScript abstractions.

## Three Problems

Modern web development faces a series of interconnected challenges that have shaped the evolution of frontend frameworks. Understanding these problems is essential to evaluating whether current solutions have overcorrected and created new issues.

### HTML Can't Scale

HTML was designed for static documents, not dynamic applications. This fundamental limitation creates several cascading problems as applications grow in complexity.

HTML provides no mechanism for coordinating dynamic state across different parts of an application. Consider a shopping cart page:

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

Every state change requires manual coordination across multiple DOM elements. The function must update the navigation badge, cart summary, and checkout button state independently. Each UI element that depends on cart state needs explicit updates, and as applications grow, this coordination becomes exponentially complex.

Componentization presents another challenge. Modern platform features like custom elements and `<template>` tags provide some encapsulation, but introduce their own complexity:

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

While this provides encapsulation, it requires significant boilerplate for basic functionality. State management across components still requires manual coordination, and the imperative API (calling `.open()` and `.close()`) doesn't compose well with reactive data flow.

### Component Coordination

Building reusable, encapsulated components requires significant boilerplate and manual coordination. Even modern platform features like custom elements impose complexity that grows with application requirements, making component development tedious and error-prone.

Consider implementing a modal component with custom elements:

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

The component provides encapsulation but requires extensive setup code for basic functionality. State management across components still requires manual coordination, and the imperative API (calling `.open()` and `.close()`) doesn't compose well with reactive data flow.

Component communication becomes increasingly complex. Consider a shopping cart that needs to coordinate between multiple interface elements:

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

Every component requiring cart data must manually subscribe to updates, handle cleanup, and coordinate its own state. Adding features like quantity management, discounts, or persistence requires touching multiple components and maintaining manual synchronization. The coordination overhead grows exponentially with application complexity.

### Runtime Burden

Development decisions impose ongoing costs on users rather than developers. Work that could happen once during the build process gets repeated millions of times across user sessions, creating unnecessary overhead that accumulates as applications scale.

Consider template parsing across user sessions. Every user's browser repeats identical analysis:

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

This analysis produces identical results for every user because the template structure is static. The parsing logic, dependency relationships, and update strategies remain constant, yet each browser performs this work independently.

Component optimization demonstrates the burden clearly. Simple implementations create ongoing costs, while optimized versions require extensive coordination:

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

The burden extends to server-side operations where identical work repeats across requests. Each request rebuilds the same component hierarchies and executes predictable render logic:

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

Every request performs template compilation, dependency resolution, and HTML generation work that could be pre-computed for static portions. This overhead multiplies across concurrent users, consuming server resources and increasing response times.

The burden shifts to users because frameworks prioritize developer convenience over runtime efficiency. Each user pays CPU cycles and battery life for analysis that benefits no one after the first calculation. Applications with millions of users repeat identical computations billions of times, consuming collective resources that could be eliminated through build-time analysis.

## Three Solutions

Marko addresses these problems through fundamental architectural decisions that eliminate the tradeoffs rather than managing them. The approach focuses on extending HTML's capabilities while preserving its strengths.

### Augment HTML

Rather than generating HTML from JavaScript, Marko enhances HTML with the language features modern applications require. This preserves platform alignment while addressing scalability limitations.

Templates begin as familiar HTML and evolve naturally. Almost all HTML code works as Marko code.

```marko
/* products.marko */
<h1>My Products</h1>
<ul>
  <li>Widget - $10</li>
  <li>Gadget - $15</li>
</ul>
```

State and control flow integrate directly into the markup:

```marko
/* products.marko */
<h1>My Products</h1>
<ul>
  <for|product| of=input.products>
    <li>${product.name} - $${product.price}</li>
  </for>
</ul>
```

Asynchronous operations become declarative:

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

This progression requires no architectural changes. State management becomes part of the markup language, eliminating the conceptual gap between document structure and application logic. The approach preserves HTML's readability and browser compatibility while adding necessary capabilities.

### Component Encapsulation

Marko provides true component encapsulation without the boilerplate and complexity of custom elements. Components group related HTML, styling, and behavior into cohesive units that work declaratively rather than imperatively.

The modal component that required extensive custom element setup becomes straightforward:

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

Usage requires no imperative API calls or manual state coordination:

```marko
<modal>
  <p>Modal content goes here</p>
</modal>
```

State flows declaratively through the component. Opening and closing behaviors integrate naturally with the markup structure.

This encapsulation extends to interactive components. Consider a rating component that coordinates between multiple elements:

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

Component communication happens through props and events rather than global references or manual coordination. State changes propagate automatically to dependent elements without explicit wiring.

### Compile-Time Intelligence

Marko's compilation approach enables optimizations that runtime-only solutions cannot achieve. By analyzing templates during the build process, the compiler makes decisions about code generation, dependency tracking, and performance optimizations that would be impossible or expensive at runtime.

Selective code generation produces minimal JavaScript bundles:

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

The compiler generates client-side JavaScript only for components requiring interactive behavior. Static content compiles to plain HTML, while dynamic sections include only necessary JavaScript for their specific behavior.

Reactivity analysis happens at compile time rather than runtime:

```marko
<let/firstName="John">
<let/lastName="Doe">
<const/fullName=`${firstName} ${lastName}`>

<input value:=firstName>
<input value:=lastName>

<h1>Hello, ${fullName}!</h1>
<p>Your initials are ${firstName[0]}${lastName[0]}</p>
```

When `firstName` changes, the compiler ensures updates to the input value, derived `fullName`, h1 text, and paragraph initials. This analysis generates optimal update code affecting only dependent elements, eliminating runtime dependency tracking overhead while enabling surgical DOM updates.

Dual environment optimization compiles templates separately for server and client, each optimized for specific constraints. Server compilation prioritizes HTML generation throughput with efficient string concatenation and streaming support. Client compilation focuses on bundle size and precise updates, generating direct DOM manipulation rather than framework abstractions.

## The Result

These architectural decisions produce applications with characteristics that improve rather than degrade over time. The compilation approach handles complexity at build time, allowing development teams to focus on feature implementation rather than framework coordination.

Performance becomes automatic rather than effortful. Default streaming delivers content as soon as available. Selective JavaScript generation minimizes bundle sizes while maintaining full functionality. Precise updates affect only dependent DOM nodes. Progressive loading renders critical content first while interactive features enhance progressively.

Maintainability emerges from systematic design. Co-located concerns ensure component structure, styling, and behavior remain unified, eliminating coordination overhead that typically grows with application complexity. TypeScript integration provides template-level type checking equivalent to JavaScript analysis. The compiler identifies error categories at build time that would otherwise manifest as runtime failures.

Component flexibility supports evolving requirements without architectural changes. Applications can start with simple uncontrolled components and add coordination as needed, or implement complex validation and synchronization patterns when appropriate.

Progressive enhancement occurs naturally from the architecture. Applications function without JavaScript and enhance with it, supporting diverse user environments and improving resilience. This characteristic becomes increasingly valuable as applications serve broader user bases with varying device capabilities and network conditions.

The result is a development approach that aligns with web platform evolution rather than working against it, producing applications that achieve high performance and maintainability through systematic design rather than optimization techniques.

## Next Steps

- [Welcome to Marko](./welcome-to-marko.md)
- [Components & Reactivity Tutorial](../tutorial/components-and-reactivity.md)
- [Language Reference](../reference/language.md)
