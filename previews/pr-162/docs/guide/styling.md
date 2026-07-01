# Styling

This section explains some different ways to style HTML within Marko. From simple inline styles to powerful techniques like CSS Modules for organized and maintainable stylesheets.

## Inline Styles

Marko [enhances the HTML `<style>` tag](../reference/core-tag.md#style) to be processed and optimized by the [bundler used in the project](TODO). A template may specify any number of `<style>` tags.

By default, all styles defined in the template are **globally scoped**. As such, many Marko projects use patterns like [BEM](https://getbem.com/introduction/) to avoid name conflicts.

```marko
<style>
  /* Bundled and loaded once */
  .fancy {
    color: green;
  }
</style>

<div class="fancy">Hello!</div>
```

The `<style>` may include a file extension to enable css preprocessors such as [scss](https://sass-lang.com/documentation/syntax/#scss) and [less](https://lesscss.org/).

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

### Inline CSS Modules

If the `<style>` tag has a [Tag Variable](../reference/language.md#tag-variables), it leverages [CSS Modules](https://github.com/css-modules/css-modules) to expose its classes as an object.

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

This approach allows for scoping of CSS class names without needing to follow naming conventions such as [BEM](https://getbem.com/introduction/).

You may still provide a custom file extension to enable to use of preprocessors.

```marko
<style.scss/styles>
  $primary-color: green;

  .fancy {
    color: $primary-color;
  }
</style>

<div class=styles.fancy>Hello</div>
```

## Auto-Discovered Styles

Styling files adjacent a [custom tag are automatically discovered](../reference/custom-tag.md#supporting-files). These files are imported and processed the same as [inline styles](#inline-styles).

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
> When a template is becoming too large it can be helpful to pull its styling into an associated style file such as this.

## Imported Styles

Styles may also be [imported](../reference/language.md#import).

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
> Although generally [inline](#inline-styles) or [auto-discovered](#auto-discovered-styles) styles are preferred, importing styles can be helpful when sharing across templates.

### Imported CSS Modules

[CSS Module files](https://github.com/css-modules/css-modules) may also be imported.

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
> Since most bundlers are configured by default to support css modules for `*.module.css` files, this should work out of the box. If it is not supported by a bundler there is almost certainly a plugin.
