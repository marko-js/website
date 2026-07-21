# Publishing Components

Reusable Marko tags are ordinary packages that ship `.marko` files (and optional CSS, types, and `marko.json`). Consumers discover them the same way as local tags once the package is installed.

## Package Layout

A small component package often looks like this:

```text
my-widget/
  package.json
  marko.json
  index.marko
  style.css
  README.md
```

```json
/* marko.json */
{
  "tags-dir": "."
}
```

With `tags-dir` pointing at the package root (or a `tags/` folder), Marko [auto-discovers](../reference/custom-tag.md#installed-custom-tags) tag files for importers. Nested private helpers can live under a nested `tags/` directory so only the public entry is discoverable from outside; see [Grouping Folders](../reference/custom-tag.md#grouping-folders) and [Lazy Loading facades](../reference/lazy-loading.md#facade-tags).

## Best Practices

- Target the Tags API (`marko@6`) and document peer dependency ranges for `marko`.
- Prefer pure, serializable `input` and [controllable](../explanation/controllable-components.md) attributes over hidden globals.
- Co-locate styles with [auto-discovered style files](./styling.md#auto-discovered-styles) or `<style>` tags so consumers do not wire CSS by hand.
- Export TypeScript `Input` types from the template so [type checking](../reference/typescript.md) works for consumers.
- Keep side effects in [`<lifecycle>`](../reference/core-tag.md#lifecycle) / [`<script>`](../reference/core-tag.md#script) and clean up with [`$signal`](../reference/language.md#signal).
- For heavy optional UI, ship a [lazy facade](../reference/lazy-loading.md#facade-tags) so the default import path code-splits.

```json
/* package.json (excerpt) */
{
  "name": "@example/my-widget",
  "peerDependencies": {
    "marko": "^6"
  },
  "files": ["*.marko", "marko.json", "style.css", "dist"]
}
```

## Storybook Integration

[Storybook for Marko](https://github.com/storybookjs/marko) previews tags in isolation. Point stories at the same `.marko` files the package publishes so docs and examples stay aligned with the real entrypoints.

```js
/* my-widget.stories.js */
import MyWidget from "./index.marko";

export default {
  title: "MyWidget",
  component: MyWidget,
};

export const Default = {
  args: { label: "Save" },
};
```

> [!NOTE]
> Storybook setups that disable linked assets may treat [lazy `load` imports](../reference/lazy-loading.md#bundler-support) as eager imports. Templates still render; only the code-split boundary is skipped.

## Further Reading

- [Custom Tag Discovery](../reference/custom-tag.md)
- [Library Integration](./library-integration.md)
- [TypeScript](../reference/typescript.md)
