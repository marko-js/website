# Marko Fundamentals

> [!TLDR]
>
> Marko builds on top of HTML, enabling components and JavaScript-based interpolation

Marko is designed to feel familiar if you know HTML, while making it easy to build dynamic, interactive websites. Let's walk through the core concepts.

## Templates are HTML

Nearly any valid HTML is also valid Marko code. We can start with regular HTML and gradually add features as needed.

```marko
<h1>My Blog</h1>
<nav>
  <a href="/about">About</a>
  <a href="/contact">Contact</a>
</nav>
```

## Attributes are JS

Almost all valid JavaScript expressions can be written as attribute values.

```marko
<a href=`/user/${user.id}`>My Profile</a>
<a href=getRandomPage()>Discover Something New</a>
```

> [!NOTE]
> The Reference Docs explain [more about Attributes](../reference/language.md#attributes) including how they support [`...spreads`](../reference/language.md#spread-attributes) and [`methods()`](../reference/language.md#shorthand-methods).


## Dynamic Content

Tag content in Marko is similar to [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) in JavaScript, so dynamic text can be added with [interpolated `${expressions}`](../reference/language.md#dynamic-text)

```marko
<p>Today is ${new Date().toDateString()}</p>
<p>Random number: ${Math.floor(Math.random() * 100)}</p>
```

## Components

To reuse code, we can move it into a separate file. Each `.marko` file is a component that can be used like an HTML tag.

```marko
/* tags/card.marko */
<div>
  <h3>Alice</h3>
  <p>Designer</p>
  <p>Joined 2023</p>
</div>
```

This `<card>` component can now be used anywhere in the page:

```marko
<h1>Our Team</h1>
<card/>
<card/>
<card/>
```

> [!NOTE]
> Components in the `tags/` directory are [automatically discovered](../reference/custom-tag.md#custom-tag-discovery). No need to `import` them.

> [!TIP]
> We can also write multiple "components" in a single file using the [`<define>` tag](../reference/core-tag.md#define).

### Passing Data to Components

Attributes on custom components are available through a special object called [`input`](../reference/language.md#input).

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

Now we can pass different data to each instance of `card`:

```marko
<h1>Our Team</h1>
<card name="Alice" role="Designer" year=2023/>
<card name="Bob" role="Developer" year=2024/>
<card name="Charlie" role="Product Manager" year=2022/>
```

> [!NOTE]
> Also check out [attribute tags](../reference/language.md#attribute-tags) which we can use to pass named content to a component

## Core Tags

Marko provides many helpful [Core Tags](../reference/core-tag.md). For example, we can use [`<if>` and `<else>`](../reference/core-tag.md#if--else) to show or hide content based on conditions.

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

Now we can show different states based on the product data:

```marko
<product name="T-Shirt" price=25 stock=10/>
<product name="Hoodie" price=45 stock=0/>
<product name="Hat" price=15 stock=5/>
```

And we can use the [`<for>` tag](../reference/core-tag.md#for) to display repeated content

```marko
<for|product| of=productsList>
  <product name=product.name price=product.price stock=product.stock/>
</for>
```

## Next Steps

- [Components and Reactivity](./components-and-reactivity.md)
- [Build an App](./app-from-scratch.md)
