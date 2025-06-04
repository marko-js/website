# Install Marko

> [!NOTE]
> If you'd like to experiment and learn about Marko directly in your browser, head over to our [Playground](/playground). You can develop a Marko application right there without any local setup.

## Prerequisites

- [Node.js](https://nodejs.org/en) `v18`, `v20`, `v22` or higher.
- IDE - We recommend [VS Code](https://code.visualstudio.com/) and our [Official Marko extension](https://marketplace.visualstudio.com/items?itemName=Marko-JS.marko-vscode)
- Terminal - You will use the command-line interface (CLI) to set up and start the application.

## Marko Run Setup (Recommended)

[Marko Run](https://github.com/marko-js/run) makes it easy to get started with little to no config and is the recommended starting point for a new Marko project. It's the official application framework from the Marko team and powered by [Vite](https://vite.dev/).

To set up your project:

```bash
npm init marko -- -t basic-tags
cd ./my-marko-application
npm run dev
```

Open `src/routes/_index/+page.marko` in your editor to modify the index page. See the [routing documentation](https://github.com/marko-js/run#file-based-routing) to learn how to add additional pages to your project.

## Manual Setup

If you prefer to create your own application structure, you can set up your project with your bundler of choice. The Marko team maintains the plugins for [Vite](https://github.com/marko-js/vite), [Webpack](https://github.com/marko-js/webpack) and [Rollup](https://github.com/marko-js/rollup). The following guide will help you setup Vite.

1. **Create your project directory**

    Create an empty directory with your project's name and navigate into it:

    ```bash
    mkdir my-marko-application
    cd my-marko-application
    ```

    Once inside the directory, initialize your `package.json` file, which is used to manage your project's dependencies:

    ```bash
    npm init --yes
    ```

1. **Install Marko**

    Lets install the dependencies required for Marko.

    First, install `marko` 6 as your dependency.

    ```bash
    npm install marko@next
    ```

    Next, install Vite and the Marko plugin as development dependencies using the npm `-D` flag:

    ```bash
    npm install -D vite @marko/vite
    ```

1. **Create the `vite.config.ts` file**

    Create `vite.config.ts` file to export the [Vite configuration](https://vite.dev/config/) and add the `marko()` plugin to the `plugins` list.

    ```typescript
    import { defineConfig } from "vite";
    import marko from "@marko/vite";

    export default defineConfig({
      plugins: [marko()],
    });
    ```

1. **Create your first Marko page**

    In your text editor, create a `src/routes/index.marko` file. This will be your first Marko page of the project. Copy and paste the following content into the new file:

    ```marko
    <html lang="en">
        <body>
            <h1>Hello Marko!</h1>
        </body>
    </html>
    ```

1. **Add a server**

    By default, the `marko()` plugin requires the use of [Vite Server Side Rendering (SSR) mode](https://vite.dev/guide/ssr.html#server-side-rendering-ssr) (this can be disabled with the Marko plugin's `linked` option). Therefore, you need to create a server file to start your application. This guide will use [`express`](https://expressjs.com/).

    First, install `express`:

    ```bash
    npm install express
    ```

    Now, create the server logic inside an `index.js` file. This code sets up an Express server and integrates with Vite for handling server-side rendering of a Marko template. For simplicity, this setup is intended for development environments only. For more examples, refer to the [Marko JS examples repository](https://github.com/marko-js/examples/tree/master/examples).

    ```javascript
    import express from "express";
    import { createServer } from "vite";

    const app = express();

    const vite = await createServer({
      server: {
        middlewareMode: true,
      },
      appType: "custom",
    });

    app.use(vite.middlewares);

    app.get("/", async (req, res) => {
      const template = (await vite.ssrLoadModule("./src/routes/index.marko?marko-server-entry"))
        .default;
      const result = template.render();
      res.header("Content-Type", "text/html");
      result.pipe(res);
    });

    app.listen(3000)
    ```

    Note that `?marko-server-entry` is used to indicate the server code's entry point to the Vite plugin.

1. **Start the application**

    You can now start the application using the command below and access http://localhost:3000 to see the preview of your code while you build your app!

    ```bash
    node index.js
    ```

## Set up TypeScript

Marko’s TypeScript support offers in-editor error checking, makes refactoring less scary, verifies that data matches expectations, and even helps with API design.

Or perhaps you simply want more autocomplete in VS Code—that works too!

To add TypeScript support to your Marko application, add a `tsconfig.json` file in the project's root directory. You can you use the following `tsconfig.json` as a starting point:

```json
{
  "include": ["src/**/*"],
  "compilerOptions": {
    "allowSyntheticDefaultImports": true,
    "lib": ["dom", "ESNext"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "noEmit": true,
    "noImplicitOverride": true,
    "noUnusedLocals": true,
    "outDir": "dist",
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "strict": true,
    "target": "ESNext",
    "verbatimModuleSyntax": true
  }
}
```

For type checking Marko files in the CLI, you can install `@marko/type-check` in your project with the following command:

```bash
npm install -D @marko/type-check
```

You can then use `mtc` (Marko type check) instead of `tsc`:

```bash
mtc
```

For more information about working with Marko and TypeScript check [this reference page](../reference/typescript.md).

## IDE Plugin

The Marko team maintains a [Marko VS Code extension](https://marketplace.visualstudio.com/items?itemName=Marko-JS.marko-vscode) that provides Marko syntax highlighting, pretty-printing, TypeScript, IntelliSense, and more.

For other editors, you can use the Marko [language server](https://github.com/marko-js/language-server/tree/main) to enhance the developer experience with Marko in your IDE.

## Next steps

- [Components & Reactivity tutorial](../tutorial/components-and-reactivity.md)
