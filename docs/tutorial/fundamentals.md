# Marko Fundamentals

The web is built on HTML and JavaScript. Marko is a **programming language** that attempts to rethink what web development might look like if HTML and JavaScript were a single, unified language.

## HTML

There are countless guides and tutorials already on the internet for learning HTML, and these docs won't do them any justice. Marko builds on top of HTML, so everything you learn about it can be applied to Marko.

We'll provide a brief overview of HTML and JS here, but for a more comprehensive guide some of our favorites are [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML) and [Free Code Camp](https://www.freecodecamp.org/news/introduction-to-html-basics/).

### HTML Tags

HTML tags are the basic building blocks of web pages. They are written using angle brackets (`<` and `>`) with a name inside, like `<div>` or `<p>`. Most tags come in pairs with an opening and closing tag, where the closing tag includes a forward slash:

```marko
<p>This is a paragraph</p>
<div>This is a div element</div>
```

Tags can be nested inside each other to create structure:

```marko
<section>
  <h1>My Title</h1>
  <p>Some text content</p>
</section>
```

Tags can also have attributes which provide additional information or modify their behavior:

```marko
<img src="photo.jpg" alt="A beautiful sunset">
<a href="https://example.com">Click me</a>
```

### Comments

HTML comments are written between `<!--` and `-->`. These are useful for documenting your code or temporarily disabling parts of it:

```marko
<!-- This is a comment -->
<div>
  <!-- This section is temporarily disabled
  <p>Some content</p>
  -->
</div>
```

Comments can span multiple lines, but they cannot be nested inside other comments.

## JavaScript

JavaScript is the programming language of the web that enables interactive and dynamic content. When working with traditional HTML and JavaScript, you often need to write code that interacts with the DOM (Document Object Model).

### Basic DOM Interaction

In traditional JavaScript and HTML, handling interactions looks like this:

```marko
<button id="myButton">Click me</button>

<script>
  document.getElementById("myButton").addEventListener("click", function() {
    alert("Button clicked!");
  });
</script>
```

This approach has several drawbacks:

- You need to assign IDs or find elements by selectors
- The connection between elements and their behavior is indirect
- As applications grow, this becomes difficult to maintain

Marko addresses these issues by integrating JavaScript expressions directly into templates and providing simpler ways to handle events, which we'll explore later in this tutorial.

## Marko

Everything we've seen so far isn't just HTML and JavaScript— it's actually valid Marko code too! The vast majority of HTML code that you find on the internet can be copy-pasted into a `.marko` file and it will work, just as expected!

But Marko extends HTML with powerful features that make building interactive web applications easier.

Next, check out the [components and reactivity tutorial](./components-and-reactivity.md)
