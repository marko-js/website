# Tooling Integrations

In addition to Marko itself, the core team maintains a variety of integrations and other tooling for the language.

## Editor Tooling

[Marko VSCode](https://marketplace.visualstudio.com/items?itemName=Marko-JS.marko-vscode) includes _all_ editor tooling, so if it is installed no other editor setup is necessary.

The [Language Server](https://github.com/marko-js/language-server) provides syntax highlighting, IntelliSense, type checking, and accessibility hints for Marko files in any editor that supports the Language Server Protocol.

> [!TIP]
> For more information about type checking in Marko, check out [the TypeScript reference](../reference/typescript.md).

If [Prettier](https://prettier.io/) is installed, the official plugin will also provide code formatting out of the box through [`prettier-plugin-marko`](https://github.com/marko-js/prettier).

## Bundlers

The official recommendation for using Marko in a project is [Marko Run](../marko-run/getting-started.md), which uses [Vite](#vite) and requires no configuration.

For projects that _aren't_ using Marko Run, the following options are available.

- [Vite](https://github.com/marko-js/vite)
- [Webpack](https://github.com/marko-js/webpack)
- [Rollup](https://github.com/marko-js/rollup)
- [Lasso](https://github.com/lasso-js/lasso-marko)

## Testing

Marko supports most test runners, through [`@marko/testing-library`](https://github.com/marko-js/testing-library). The official examples use [Vitest](https://vitest.dev/), but [Jest](https://jestjs.io/), [Mocha](https://mochajs.org/), and a variety of other testing frameworks may also be used.

## Development

[Storybook](https://storybook.js.org/) can be used to preview components using [`@storybook/marko`](https://github.com/storybookjs/marko).

