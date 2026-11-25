# Install Marko

> [!NOTE]
> Experiment with Marko directly in the browser using the [Playground](/playground) with no local setup.

## Prerequisites

- [Node.js](https://nodejs.org/en) `22.12` or higher (see [Supported Environments](../reference/supported-environments.md)).
- An editor: [VS Code](https://code.visualstudio.com/) with the [Official Marko extension](https://marketplace.visualstudio.com/items?itemName=Marko-JS.marko-vscode), or any editor configured with the [Marko Language Server](./integrations.md#editor-tooling).
- A terminal for running the CLI and development server.

## Marko Run

[Marko Run](../marko-run/getting-started.md) is the official application framework, powered by [Vite](https://vite.dev/). It is the recommended starting point for new projects.

```bash
npm init marko -- -t basic -n my-marko-app
cd my-marko-app
npm run dev
```

Available starter templates come from [`marko-js/examples`](https://github.com/marko-js/examples/tree/main/examples):

| Template       | Description                                               |
| :------------- | :-------------------------------------------------------- |
| `basic`        | Marko Run starter with file-based routing                 |
| `app`          | Full Marko Run application with testing and styling setup |
| `library`      | Reusable component library with TypeScript and Storybook  |
| `vite-express` | Custom Express server integrated with `@marko/vite`       |

Non-interactive environments (CI, piped stdin) accept defaults automatically. Pass flags to control scaffolding directly: `-t` for the template, `-n` / `--name` for the project directory, `-y` / `--yes` to accept defaults, `--no-install` to skip dependency installation, and `--no-git` to skip Git initialization.

Edit `src/routes/+page.marko` to modify the index page, and see [File-based Routing](../marko-run/file-based-routing.md) to add routes.

## Manual Setup

Projects with custom server or bundler architectures can configure Marko directly with [`@marko/vite`](https://github.com/marko-js/vite) or another [supported bundler](./integrations.md#bundlers).

### Vite with Express

1. Initialize an ESM project:

   ```bash
   mkdir my-marko-app
   cd my-marko-app
   npm init -y
   npm pkg set type=module
   ```

2. Install Marko, Express, and Vite:

   ```bash
   npm install marko express
   npm install -D vite @marko/vite
   ```

3. Register the Marko plugin in `vite.config.ts`:

   ```ts
   import { defineConfig } from "vite";
   import marko from "@marko/vite";

   export default defineConfig({
     plugins: [marko()],
   });
   ```

4. Create a template at `src/routes/index.marko` and a route module at `src/routes/index.js`:

   ```marko
   /* src/routes/index.marko */
   <html lang="en">
     <body>
       <h1>Hello Marko!</h1>
     </body>
   </html>
   ```

   ```js
   /* src/routes/index.js */
   import template from "./index.marko";

   export default function (_req, res) {
     res.header("Content-Type", "text/html");
     template.render().pipe(res);
   }
   ```

   The page template rendered by a server route module is treated as a page entry by `@marko/vite`, which automatically injects client assets when rendered.

5. Create a development server in `index.js`:

   ```js
   import express from "express";
   import { createServer } from "vite";

   const app = express();
   const vite = await createServer({
     server: { middlewareMode: true },
     appType: "custom",
   });

   app.use(vite.middlewares);
   app.get("/", async (req, res, next) => {
     const handler = (await vite.ssrLoadModule("./src/routes/index.js"))
       .default;
     handler(req, res, next);
   });

   app.listen(3000);
   ```

   For production builds and full server examples, see the [`vite-express` example](https://github.com/marko-js/examples/tree/main/examples/vite-express).

6. Start the development server and open <http://localhost:3000>:

   ```bash
   node index.js
   ```

### Browser-Only Setup

By default, `@marko/vite` links a server build with a browser build. For client-only applications without a server build, pass `linked: false` to `marko()` and mount the root template with [`Template.mount`](../reference/template.md#templatemountinput-node-position):

```ts
/* vite.config.ts */
import { defineConfig } from "vite";
import marko from "@marko/vite";

export default defineConfig({
  plugins: [marko({ linked: false })],
});
```

```html
/* index.html */
<div id="app"></div>
<script type="module" src="/src/main.ts"></script>
```

```ts
/* src/main.ts */
import App from "./app.marko";

App.mount({}, document.getElementById("app")!);
```

> [!NOTE]
> With `linked: false`, `@marko/vite` cannot code-split [lazy-loaded tags](../reference/lazy-loading.md#bundler-support); `with { load }` imports compile as eager imports.

## TypeScript Setup

Adding a `tsconfig.json` at the project root enables TypeScript inside `.marko` templates:

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
    "types": ["vite/client"],
    "verbatimModuleSyntax": true
  }
}
```

For CLI and CI type checking, install `@marko/type-check` and run `mtc` instead of `tsc`:

```bash
npm install -D @marko/type-check
npx mtc
```

See the [TypeScript reference](../reference/typescript.md) for full type syntax and configuration details.

## IDE Support

The [Marko VS Code extension](https://marketplace.visualstudio.com/items?itemName=Marko-JS.marko-vscode) bundles syntax highlighting, formatting, TypeScript checking, and IntelliSense. Other editors can connect to the [Marko Language Server](./integrations.md#editor-tooling).

## Next Steps

- [Syntax Fundamentals](../tutorial/fundamentals.md)
- [Components & Reactivity](../tutorial/components-and-reactivity.md)
- [Tooling Integrations](./integrations.md)
