# Marko Fundamentals

> [!TLDR]
>
> - Marko builds on HTML with JavaScript expressions and component tags
> - Files in `tags/` become reusable components automatically
> - Core tags like `<if>` and `<for>` handle control flow directly in markup

Marko feels familiar to anyone who writes HTML, while adding dynamic expressions, components, and control flow. Let's walk through the fundamentals.

## Templates are HTML

Nearly any valid HTML is valid Marko. We can start with plain HTML and layer in dynamic features only where needed:

```marko
<h1>My Blog</h1>
<nav>
  <a href="/about">About</a>
  <a href="/contact">Contact</a>
</nav>
```

## Attributes are JS

Attribute values accept JavaScript expressions directly:

```marko
<a href=`/user/${input.user.id}`>Profile</a>
<a href=getRandomPage()>Discover Something New</a>
```

> [!NOTE]
> See [Attributes](../reference/language.md#attributes) for [`...spreads`](../reference/language.md#spread-attributes), [`methods()`](../reference/language.md#shorthand-methods), and other shorthands.

## Dynamic Content

Tag content behaves like a JavaScript [template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals), so dynamic values interpolate with [`${expression}`](../reference/language.md#dynamic-text):

```marko
<p>Today is ${new Date().toDateString()}</p>
<p>Random number: ${Math.floor(Math.random() * 100)}</p>
```

## Components

Each `.marko` file is a component that can be used like an HTML tag. Placing a file in a `tags/` directory makes it available by filename:

```marko
/* tags/card.marko */
<div>
  <h3>Alice</h3>
  <p>Designer</p>
  <p>Joined 2023</p>
</div>
```

```marko
/* index.marko */
<h1>Our Team</h1>
<card/>
<card/>
<card/>
```

> [!NOTE]
> Components in `tags/` are [discovered automatically](../reference/custom-tag.md#relative-custom-tags), so no `import` is required.

<!---->

> [!TIP]
> Reusable markup snippets can also live in the same file with [`<define>`](../reference/core-tag.md#define).

### Passing Data

Attributes passed to a component are available on [`input`](../reference/language.md#input):

```marko
/* tags/card.marko */
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

```marko
/* index.marko */
<h1>Our Team</h1>
<card name="Alice" role="Designer" year=2023/>
<card name="Bob" role="Developer" year=2024/>
<card name="Charlie" role="Product Manager" year=2022/>
```

> [!NOTE]
> Components can also accept named sections of markup with [attribute tags](../reference/language.md#attribute-tags).

## Core Tags

Marko ships built-in [core tags](../reference/core-tag.md) for control flow and state. Use [`<if>` and `<else>`](../reference/core-tag.md#if--else) for conditional markup:

```marko
/* tags/product.marko */
export interface Input {
  name: string;
  price: number;
  stock: number;
}

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

```marko
/* index.marko */
<product name="T-Shirt" price=25 stock=10/>
<product name="Hoodie" price=45 stock=0/>
<product name="Hat" price=15 stock=5/>
```

Use [`<for>`](../reference/core-tag.md#for) to render a list:

```marko
static const products = [
  { name: "T-Shirt", price: 25, stock: 10 },
  { name: "Hoodie", price: 45, stock: 0 },
  { name: "Hat", price: 15, stock: 5 },
];

<for|product| of=products>
  <product name=product.name price=product.price stock=product.stock/>
</for>
```

## Next Steps

- [Components and Reactivity](./components-and-reactivity.md)
- [Build an App](../marko-run/getting-started.md)
