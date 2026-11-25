# Tooling Integrations

The Marko core team maintains official integrations for editors, bundlers, testing, and component development.

## Editor Tooling

[Marko for VS Code](https://marketplace.visualstudio.com/items?itemName=Marko-JS.marko-vscode) bundles syntax highlighting, formatting, IntelliSense, type checking, and accessibility diagnostics out of the box.

For other editors that support the Language Server Protocol, install [`@marko/language-server`](https://github.com/marko-js/language-server) and run `marko-language-server --stdio` to enable IntelliSense, type checking, and accessibility diagnostics.

> [!TIP]
> See the [TypeScript reference](../reference/typescript.md) for type checking configuration and CLI usage with `mtc`.

When [Prettier](https://prettier.io/) is installed, [`prettier-plugin-marko`](https://github.com/marko-js/prettier) formats `.marko` files automatically.

## Bundlers

[Marko Run](../marko-run/getting-started.md) is the recommended setup for applications; it wraps [`@marko/vite`](https://github.com/marko-js/vite) with zero required configuration.

For custom bundler setups, the following official plugins are maintained:

- [Vite](https://github.com/marko-js/vite) (primary bundler plugin)
- [Webpack](https://github.com/marko-js/webpack)
- [Rollup](https://github.com/marko-js/rollup)
- [Lasso](https://github.com/lasso-js/lasso-marko)

## Testing

[`@marko/testing-library`](https://github.com/marko-js/testing-library) renders and tests Marko components across standard test runners, including [Vitest](https://vitest.dev/), [Jest](https://jestjs.io/), and [Mocha](https://mochajs.org/).

The official starters configure Vitest with two projects (`server` in Node and `browser` via Playwright/Preview) using `@marko/vite` so templates can be verified in both environments.

## Component Development

[Storybook](https://storybook.js.org/) previews and documents Marko components through [`@storybook/marko`](https://github.com/storybookjs/marko) and `@storybook/marko-vite`.
