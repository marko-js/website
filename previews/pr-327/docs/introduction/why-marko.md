# Why Marko?

Marko builds fast, maintainable web applications by evolving HTML directly rather than replacing it with JavaScript abstractions. Its architecture resolves three core web development tradeoffs at compile time.

## Three Problems

### HTML Can't Scale

HTML was built for static documents, not coordinated application state. Updating several parts of a page from one interaction requires manual DOM bookkeeping across elements:

```html
/* index.html */
<!DOCTYPE html>
<html>
  <head>
    <title>Store</title>
    <script src="script.js"></script>
  </head>
  <body>
    <nav>
      <span>Cart (<span id="nav-count">0</span>)</span>
    </nav>

    <div class="products">
      <button onclick="addItem('Widget', 10)">Add Widget ($10)</button>
      <button onclick="addItem('Gadget', 15)">Add Gadget ($15)</button>
    </div>

    <div id="cart">
      <p>Items: <span id="cart-count">0</span></p>
      <p>Total: $<span id="cart-total">0</span></p>
    </div>

    <button id="checkout" disabled>Checkout</button>
  </body>
</html>
```

```js
/* script.js */
function addItem(name, price) {
  const navCount = document.getElementById("nav-count");
  const nextCount = parseInt(navCount.textContent, 10) + 1;
  navCount.textContent = nextCount;

  const cartCount = document.getElementById("cart-count");
  const cartTotal = document.getElementById("cart-total");
  cartCount.textContent = nextCount;
  cartTotal.textContent = parseFloat(cartTotal.textContent) + price;

  if (nextCount > 0) {
    document.getElementById("checkout").disabled = false;
  }
}
```

Every new element that depends on cart state adds another imperative update site.

### Component Coordination

Platform primitives like Custom Elements encapsulate markup and styles, but still require imperative wiring and boilerplate for basic interaction:

```js
/* modal-dialog.js */
class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <div class="modal hidden">
        <div class="modal-content">
          <button id="close">&times;</button>
          <slot></slot>
        </div>
      </div>
    `;
    this.modal = this.shadowRoot.querySelector(".modal");
    this.shadowRoot.querySelector("#close").onclick = () => this.close();
  }

  open() {
    this.modal.classList.remove("hidden");
  }
  close() {
    this.modal.classList.add("hidden");
  }
}

customElements.define("modal-dialog", ModalDialog);
```

```html
/* index.html */
<button onclick="nextElementSibling.open()">Open Modal</button>
<modal-dialog>
  <p>Modal content...</p>
</modal-dialog>
```

Sharing state across multiple custom elements forces manual pub-sub buses, subscription cleanup in `connectedCallback` / `disconnectedCallback`, and imperative `.open()` / `.close()` APIs that resist declarative composition.

### Runtime Burden

When template analysis, dependency tracking, and virtual tree diffing happen at runtime, every user session repeats work that is static at build time:

- On the client, browsers download component trees for static markup, re-execute templates during hydration, and maintain runtime dependency graphs just to update a few dynamic nodes.
- On the server, building an intermediate tree before serializing to HTML allocates memory and delays the first byte on every request.

Moving static analysis from runtime to compile time eliminates work for both servers and browsers.

## Three Solutions

### Augment HTML

Marko extends HTML directly so templates grow from static markup to dynamic, asynchronous interfaces without switching paradigms.

Static HTML works as a Marko template:

```marko
<h1>Products</h1>
<ul>
  <li>Widget ($10)</li>
  <li>Gadget ($15)</li>
</ul>
```

Control flow integrates directly into markup:

```marko
<h1>Products</h1>
<ul>
  <for|product| of=input.products>
    <li>${product.name} ($${product.price})</li>
  </for>
</ul>
```

Async rendering, placeholders, and error boundaries follow the same tag syntax:

```marko
<h1>Products</h1>
<try>
  <await|products|=fetchProducts()>
    <ul>
      <for|product| of=products>
        <li>${product.name} ($${product.price})</li>
      </for>
    </ul>
  </await>

  <@placeholder>Loading products...</@placeholder>
  <@catch|error|>Failed to load: ${error.message}</@catch>
</try>
```

### Component Encapsulation

Components colocate markup, scoped styles, and reactive state in a single `.marko` file with declarative inputs and no imperative setup:

```marko
/* tags/modal.marko */
<let/open=false>

<button onClick() { open = true }>Open Modal</button>

<div style={ display: open ? "block" : "none" } class=styles.modalContent>
  <button onClick() { open = false }>&times;</button>
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

```marko
/* index.marko */
<modal>
  <p>Modal content goes here</p>
</modal>
```

Interactive components coordinate state across elements through reactive declarations rather than manual subscriptions:

```marko
<let/rating=0>
<let/hovering=0>

<div>
  <for|i| from=1 to=5>
    <button
      class=((hovering || rating) >= i && "filled")
      onPointerEnter() { hovering = i }
      onPointerLeave() { hovering = 0 }
      onClick() {
        rating = i;
        hovering = 0;
      }
    >
      *
    </button>
  </for>
  <span>
    <if=(hovering > 0)>
      ${hovering} star${hovering > 1 ? "s" : ""}
    </if>
    <else if=(rating > 0)>
      Rated ${rating} star${rating > 1 ? "s" : ""}
    </else>
    <else>
      Click to rate
    </else>
  </span>
</div>
```

### Compile-Time Intelligence

Analyzing templates at build time lets Marko generate output tailored to each runtime environment.

Only interactive expressions ship JavaScript to the browser; static markup renders on the server and contributes zero bytes to the client bundle:

```marko
<div>
  // Static: zero client JavaScript
  <p>Product overview</p>

  // Stateful: targeted client update code only
  <let/count=0>
  <button onClick() { count++ }>Clicked ${count} times</button>
</div>
```

Dependency graphs resolve at build time rather than runtime:

```marko
<let/firstName="Ada">
<let/lastName="Lovelace">
<const/fullName=`${firstName} ${lastName}`>

<input value:=firstName>
<input value:=lastName>

<h1>Hello, ${fullName}!</h1>
<p>Initials: ${firstName[0] ?? ""}${lastName[0] ?? ""}</p>
```

When `firstName` updates, compiled code updates only the dependent `fullName`, heading text, and initials without diffing the rest of the template.

Server builds concatenate HTML strings directly into a stream; browser builds emit surgical DOM updates and deserialize only the state needed for interactivity.

## The Result

Shifting complexity to the compiler makes performance the default outcome. Pages stream HTML immediately, ship JavaScript proportional to interactivity rather than template size, and update affected DOM nodes directly.

Because components colocate markup, styling, and state with full TypeScript checking, code stays modular as applications grow, and uncontrolled components can adopt parent control through [controllable patterns](../explanation/controllable-components.md) without rewriting their internals.

## Next Steps

- [Welcome to Marko](./welcome-to-marko.md)
- [Why is Marko Fast?](../explanation/why-is-marko-fast.md)
- [Components & Reactivity Tutorial](../tutorial/components-and-reactivity.md)
- [Language Reference](../reference/language.md)
