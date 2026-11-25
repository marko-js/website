# Publishing Components

Marko component libraries distribute `.marko` templates, compiled type declarations, and styles as standard npm packages discovered through `marko.json`.

## Package Configuration

Place a `marko.json` at the package root pointing `"exports"` to the directory of public tags:

```json
/* marko.json */
{
  "exports": "./dist/tags"
}
```

When `package.json` defines an `"exports"` map, it must expose that same on-disk directory because compiled consumer templates import discovered tags directly by package path (for example `@acme/ui/dist/tags/acme-icon/index.marko`):

```json
/* package.json */
{
  "name": "@acme/ui",
  "type": "module",
  "files": ["dist", "marko.json"],
  "exports": {
    "./dist/*": "./dist/*"
  },
  "peerDependencies": {
    "marko": "5 - 6"
  }
}
```

Prefix exported tag names (such as `acme-button`) to avoid collisions with other libraries. Place internal helper tags inside a nested `tags/` directory (such as `dist/tags/tags/`) so only the library itself can resolve them.

## Building Declarations

Run `mtc` (`@marko/type-check`) to emit type-stripped `.marko` files alongside `.d.marko.ts` declaration files into `dist/`. Consumers get full autocomplete and type checking without requiring TypeScript compilation of `node_modules`. See the [`library` starter](https://github.com/marko-js/examples/tree/main/examples/library) for a complete build and CSS pipeline setup.

## Storybook

Preview and document library components with [`@storybook/marko`](https://github.com/storybookjs/marko) and `@storybook/marko-vite`, which build stories using `@marko/vite` in browser mode.
