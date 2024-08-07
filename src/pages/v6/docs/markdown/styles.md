# Styles in Marko

This section explains the different ways to style your Marko components, from simple inline styles to powerful techniques like CSS Modules for organized and maintainable stylesheets.

## Basic Styling Options

### 1. Internal Styles with `<style>` Tags

You can add CSS styles directly within your Marko components using the `<style>` tag. Just like in HTML, styles defined within a `<style>` tag will apply to the HTML elements within that component.

Here's a simple example:

```marko
<style>
  .message {
    background-color: lightblue;
    padding: 10px;
    border-radius: 5px;
  }
</style>

<div class="message">
  This is a styled message!
</div>
```

> **Note:** Styles defined within `<style>` tags have **global scope** by default. This means that they could potentially affect the styling of other components in your application.

### 2. Inline Styles

For simple, element-specific styling, you can use inline styles directly on HTML elements using the `style` attribute. The value of the `style` attribute should be a JavaScript string containing CSS property-value pairs.

Here's an example:

```marko
<p style="color: blue; font-size: 16px;">
  This is a paragraph with blue text.
</p>
```

> **Recommendation:** Inline styles are generally best suited for simple styling or for dynamically applying styles based on component state or props. For more complex or reusable styles, it's better to use internal or external stylesheets.

## External Stylesheets

You can keep your CSS organized in separate files and link them to your Marko components. This approach is generally recommended for larger applications or when you want to reuse styles across multiple components.

### Autodiscovered Stylesheets

Marko makes it incredibly easy to include CSS stylesheets. By default, Marko will automatically look for a stylesheet with the same name as your component file (but with a `.css` extension) and include it.

For example, if you have a component file named `profile-card.marko`, Marko will automatically load the styles from a `profile-card.css` file in the same directory.

### Importing Stylesheets

You can also import stylesheets explicitly using the `import` statement. This gives you more control over the loading order of your stylesheets and is useful for importing styles from node modules.

Here's an example:

```marko
import "./styles/global.css"; // Importing a stylesheet from a relative path

<div>This content has styles from the imported stylesheet.</div>
```

> **Note:** Similar to styles defined in `<style>` tags, styles from external stylesheets also have **global scope** by default. This means they could potentially affect other parts of your application.

## Scoping with CSS Modules

To prevent style conflicts and ensure that your CSS styles are applied specifically to the intended components, Marko supports **CSS Modules**. CSS Modules allow you to write modular and reusable CSS without worrying about naming collisions or unintended side effects. With CSS Modules, class names in your CSS files are scoped locally by default, which means they won't clash with class names in other parts of your application. This is especially beneficial when working with component-based architectures, as it promotes true style encapsulation.

### CSS Modules with `<style>` Tags

You can use CSS Modules directly within `<style>` tags in your Marko components. To do this, you'll use a tag variable with the `<style>` tag, like this:

```marko
<style/styles>
  .message {
    background-color: lightblue;
    padding: 10px;
    border-radius: 5px;
  }
</style>

<div class=styles.message>
  This is a styled message!
</div>
```

The `styles` variable (you can name it anything) now acts as an object that holds the locally scoped class names from your CSS. By using `styles.message`, you ensure that this style is applied only to the intended element within this component.

### CSS Modules with External Stylesheets

To use CSS modules with external stylesheets, you need to import the stylesheet using an alias and access the class names as properties of that alias. Most bundlers (like Webpack and Rollup) have built-in support for CSS modules and you only need to name your css files with the `.module.css` extension. For example, given the file `styles/button.module.css`:

```marko
import styles from "./styles/button.module.css";

<button class=styles.primary>
  Submit
</button>
```

In this example, `styles.primary` will contain a unique class name generated by the CSS Modules system, preventing any styling conflicts.

## Preprocessors (Optional)

Marko can be used with CSS preprocessors like Sass, Less, and Stylus. However, the setup for preprocessors is typically handled by your build tools rather than Marko itself. Most modern JavaScript bundlers provide plugins or loaders to integrate with CSS preprocessors.

If you'd like to use a CSS preprocessor with your Marko project, consult the documentation for your chosen bundler (like Webpack or Rollup) on how to set it up.
