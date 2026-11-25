# Custom Tag Discovery

Custom tags are reusable `.marko` components discovered automatically from the filesystem or installed packages without explicit imports.

## Priority

Marko resolves a tag name in the following order:

1. [Local variables](#local-variables) (`PascalCase` identifiers in scope)
2. [Core tags](./core-tag.md) (built-in tags cannot be shadowed by custom tags)
3. [Relative custom tags](#relative-custom-tags) in `tags/` directories up to the nearest `package.json`
4. [Installed custom tags](#installed-custom-tags) from dependencies in `package.json`
5. [Native HTML, SVG, and MathML tags](./native-tag.md)

## Local Variables

When a tag name starts with an uppercase letter, Marko checks local scope first. This handles explicitly imported templates and [`<define>`](./core-tag.md#define) snippets:

```marko
import MyTag from "./my-tag.marko";

<MyTag/>
```

```marko
<define/MyTag|input: { name: string }|>
  <span>Hello ${input.name}</span>
</define>

<MyTag name="HTML"/>
<MyTag name="Marko"/>
```

> [!NOTE]
> Reference a non-`PascalCase` local variable using [dynamic tag syntax](./language.md#dynamic-tags):
>
> ```marko
> import { camelCaseTag } from "somewhere";
>
> <${camelCaseTag}/>
> ```

## Relative Custom Tags

For tags not matched in local scope, Marko walks upward from the current template's directory to the package root (`package.json`), checking each `tags/` directory in precedence order:

1. `tags/TAG_NAME.marko`
2. `tags/TAG_NAME/index.marko`
3. `tags/TAG_NAME/TAG_NAME.marko`
4. One level deep inside a [grouping folder](#grouping-folders)

```text
tags/
  app-header.marko
  app-footer.marko
pages/
  about/
    tags/
      team-members.marko
    page.marko
  home/
    tags/
      home-banner.marko
    page.marko
```

`pages/home/page.marko` resolves:

- `<app-header>`
- `<app-footer>`
- `<home-banner>`

`pages/about/page.marko` resolves:

- `<app-header>`
- `<app-footer>`
- `<team-members>`

The `home` page cannot resolve `<team-members>` and the `about` page cannot resolve `<home-banner>`, scoping page-specific tags to their respective subtrees.

> [!NOTE]
> Marko 5 discovered relative tags in `components/` directories, which are now used as a heuristic for [Marko 5 interop](../guide/marko-5-interop.md).

### Grouping Folders

Related tags can be organized one level deep inside a folder that is not itself a tag. The folder name organizes files on disk without changing tag names:

```text
tags/
  menu-button.marko
  icons/
    icon-chevron.marko
    icon-plus.marko
```

This discovers `<menu-button>`, `<icon-chevron>`, and `<icon-plus>`.

Grouping rules:

- Grouping applies one level deep (`tags/icons/outline/icon-star.marko` is not discovered).
- A folder containing `index.marko`, a matching `FOLDER_NAME.marko`, or `marko-tag.json` is treated as a single tag rather than a grouping folder, so helper files alongside it are not crawled.
- `tags`, `components`, and `node_modules` folders are never treated as grouping folders.
- Dot-prefixed folders (such as `.hidden`) are skipped; non-leading dots (such as `legacy.v1`) still group.

## Installed Custom Tags

Marko inspects packages listed in `package.json` (`dependencies`, `peerDependencies`, and `devDependencies`) for a root `marko.json` with an `"exports"` directory:

```json
/* marko.json */
{
  "exports": "./dist/tags"
}
```

If the package defines a `package.json` `"exports"` map, it must also expose the directory named in `marko.json` because compiled consumer templates import discovered tags by their package path (such as `@acme/ui/dist/tags/acme-icon/index.marko`):

```json
/* package.json */
{
  "exports": {
    "./dist/*": "./dist/*"
  }
}
```

TypeScript tag libraries publish `.d.marko.ts` declarations emitted by `@marko/type-check` alongside their templates (see [TypeScript](./typescript.md#enabling-typescript-in-your-marko-project)).

> [!TIP]
> To keep internal helper tags private to a library, place them in a nested `tags/` directory inside the exported directory (for example `dist/tags/tags/`).

<!---->

> [!CAUTION]
> When two packages export the same tag name, Marko selects the first one discovered. Prefix library tag names (for example `ebay-`) to avoid collisions, or import by path to disambiguate.

## Native Tag Registration

The compiler recognizes standard HTML, SVG, and MathML tags. To emit non-standard elements or [custom elements](./typescript.md#custom-elements) verbatim as native HTML tags, register them in a `marko.json` beside the template or in an ancestor directory:

```json
{
  "<x-datepicker>": { "html": true }
}
```

## Supporting Files

Marko automatically discovers adjacent [stylesheets](../guide/styling.md#auto-discovered-styles) for any `.marko` template using a single extension (`<name>.style.<ext>`, or `style.<ext>` next to `index.marko`). A tag directory may also include a `marko-tag.json`:

```text
tags/
  card.marko
  card.style.css
  modal/
    index.marko
    style.scss
  widget/
    index.marko
    marko-tag.json
```

Any single preprocessor extension (`.css`, `.scss`, `.less`, etc.) is supported.
