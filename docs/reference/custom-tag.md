# Custom Tag Discovery

Custom Tags in Marko allow for reusing markup across the application.

## Priority

When you use a `<Tag>` in Marko it is resolved in the following order:

- [Custom Tag Discovery](#custom-tag-discovery)
  - [Priority](#priority)
  - [Local Variable Custom Tags](#local-variable-custom-tags)
  - [Relative Custom Tags](#relative-custom-tags)
  - [Installed Custom Tags](#installed-custom-tags)
  - [Supporting Files](#supporting-files)

## Local Variable Custom Tags

If a tag name starts with an uppercase letter, Marko first checks for a local variable with the same name.

This is useful for importing custom tags that can't be discovered using the [relative lookup]()

```marko
import MyTag from "./my-tag.marko"

<MyTag/>
```

or when using the [`<define>` tag](./core-tag.md#define)

```marko
<define/MyTag|input| foo=1>
  <span>Hello ${input.name}</span>
</>

<MyTag name="HTML"/>
<MyTag name="Marko"/>
```

> [!NOTE]
> If you need to reference a local variable that is _not_ `PascalCase`, you can do so using a [dynamic tag](./language.md#dynamic-tags).
>
> ```marko
> import { camelCaseTag } from "somewhere"
>
> <${camelCaseTag} />
> ```

## Relative Custom Tags

If Marko did not resolve a [local variable tag name](#local-variable-custom-tags) it checks the file system. From the current file, it looks recursively upward for:

- `tags/TAG_NAME.marko`
- `tags/TAG_NAME/index.marko`
- `tags/TAG_NAME/TAG_NAME.marko`

Let's take a look at an example directory structure to understand this better:

```fs
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

The file `pages/home/page.marko` can resolve:

- `<app-header>`
- `<app-footer>`
- `<home-banner>`

And the file `pages/about/page.marko` can resolve:

- `<app-header>`
- `<app-footer>`
- `<team-members>`

The `home` page can't resolve `<team-members>` and the `about` page can't resolve `<home-banner>`. By using nested `tag/` directories, we've scoped our page-specific tags to their respective pages.

## Installed Custom Tags

If no Local Variable or Relative Custom Tag is found, Marko checks installed tag libraries in your `node_modules`.

Packages that provide Marko Custom Tags must include a `marko.json` at the root which tells Marko where the exported tags are.

```json
/* marko.json */
{
  "exports": "./dist/tags"
}
```

This example file tells Marko to expose all Custom Tags directly under the `dist/tags/` directory to the application using your package.

> [!TIP]
> Often a tag library will have "private tags" and "exported tags". A common way to achieve this is to have a `tags/` folder _within_ the exported `tags/` folder 🤯.
>
> For example, when exporting `dist/tags`, `dist/tags/tags/` could contain private components only available _within_ the library.

<!--  -->

> [!CAUTION]
> If two packages export the tag name, Marko will choose the one it finds first. To prevent collisions, tag libraries are encouraged to prefix all exported tag names, e.g. `ebay-`. If you must use tags with conflicting names, you can import by path to disambiguate.

## Supporting Files

Marko discovers [`style`](./styling.md) and `marko-tag.json` files adjacent to the `.marko` file.

```fs
foo.marko
foo.style.css
foo.marko-tag.json
```

Here, the `<foo>` tag has associated styles and metadata.

When the file is named `index.marko` the prefix is optional.

```fs
tags/
  bar/
    index.marko
    style.css
  baz/
    index.marko
    marko-tag.json
```

Here, the `<bar>` tag has an associated `style.css` and the `<baz>` tag has an associated `marko-tag.json`.

For `style` files any extension may be used allowing for CSS preprocessors.

```fs
tags/
  less/
    index.marko
    style.less
  scss/
    index.marko
    style.scss
```
