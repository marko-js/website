# Styling

Marko integrates CSS directly into components through inline `<style>` tags, auto-discovered stylesheets, CSS Modules, and explicit imports.

## Inline Styles

Marko [enhances `<style>`](../reference/core-tag.md#style) so styles are extracted, deduplicated, and optimized by the project's [bundler](../introduction/integrations.md#bundlers). A template may include any number of `<style>` tags.

By default, styles are **globally scoped**. Projects using global styles often follow a naming convention such as [BEM](https://getbem.com/introduction/) to prevent collisions.

```marko
<style>
  /* Bundled and loaded once */
  .fancy {
    color: green;
  }
</style>

<div class="fancy">Hello!</div>
```

Append a file extension to `<style>` to use CSS preprocessors such as [SCSS](https://sass-lang.com/documentation/syntax/#scss) or [Less](https://lesscss.org/):

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

Adding a [tag variable](../reference/language.md#tag-variables) to `<style>` compiles it as a [CSS Module](https://github.com/css-modules/css-modules), scoping class names automatically and exposing the class map as an object:

```marko
<style/styles>
  .foo { border: 1px solid red; }
  .bar { background: green; }
</style>

<div class=styles.foo/>
<div class=[styles.foo, styles.bar]/>
<div class={ [styles.bar]: true }/>
<div.${styles.foo}/>
```

File extensions combine with CSS Modules for preprocessor support:

```marko
<style.scss/styles>
  $primary-color: green;

  .fancy {
    color: $primary-color;
  }
</style>

<div class=styles.fancy>Hello</div>
```

### Dynamic Values

A `<style>` tag accepts `${...}` interpolations so reactive values can live alongside static rules:

```marko
<let/hue=200>

<style>
  .swatch {
    /* Updates whenever `hue` changes */
    background: hsl(${hue} 80% 50%);
    border-radius: 4px;
  }
</style>

<input type="range" min="0" max="360" value:parseFloat:=hue>
<div class="swatch"/>
```

The stylesheet is still extracted and bundled once. Each interpolation compiles to a [CSS custom property](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) updated by Marko as state changes.

> [!NOTE]
> Dynamic values work only in CSS declaration value positions and apply to subsequent sibling elements and their descendants. See [`<style>` Dynamic Values](../reference/core-tag.md#dynamic-values) for details.

### Per-Item Values

Because dynamic values apply to the siblings following each `<style>` tag, placing one inside a [`<for>`](../reference/core-tag.md#for) scopes the interpolated values to each iteration:

```marko
<nav class="brands">
  <for|brand| of=input.brands>
    <style>
      .brand {
        color: ${brand.color};
      }
    </style>
    <a class="brand" href=brand.url>${brand.name}</a>
  </for>
</nav>
```

> [!WARNING]
> Each iteration renders a `<style>` element among the items, so `:nth-child` counts those elements and misses its targets. Use [`:nth-of-type`](https://developer.mozilla.org/en-US/docs/Web/CSS/:nth-of-type) instead, which counts only elements of the same tag.

## Auto-Discovered Styles

A stylesheet adjacent to any `.marko` template is [discovered automatically](../reference/custom-tag.md#supporting-files) and bundled identically to an [inline `<style>`](#inline-styles). Name it `style.<ext>` next to `index.marko`, or `<name>.style.<ext>` next to `<name>.marko`.

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
> Moving styles into an adjacent file keeps large templates concise without adding explicit imports.

## Imported Styles

Stylesheets can also be [imported](../reference/language.md#import) explicitly, which is useful when sharing styles across templates:

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

### Imported CSS Modules

External [CSS Module](https://github.com/css-modules/css-modules) files (`*.module.css`) export their class map as the default export:

```css
/* something.module.css */
.fancy {
  color: red;
}
```

```marko
/* index.marko */
import styles from "./something.module.css";

<div class=styles.fancy/>
```

> [!NOTE]
> Vite and most modern bundlers support `*.module.css` out of the box.
