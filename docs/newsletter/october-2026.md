# Marko in October 2026

> [!TLDR]
>
> - Marko Run gets an official Cloudflare adapter, and a security fix keeps its redirects on the app's origin
> - Classes from CSS modules get the same compile-time optimizations as literal classes
> - A `<try>` streams its `@catch` in place, so error fallbacks show without JavaScript
> - A first look at persisted pages from ViteConf, and at preval, template code that runs at build time
> - Smaller pages, leaner server renders, and more mistakes caught at compile time

October brought an official Cloudflare adapter for Marko Run and a broad push to make streaming, resuming, and the compiler's analysis more exact. Class toggles from CSS modules update a single class, error fallbacks work before any script loads, and a long run of fixes landed for tag variables, `<define>`, and lazily loaded tags. Looking ahead, persisted pages got a ViteConf talk, and preval offers a first look at template code that runs at build time.

## Cloudflare Adapter

Marko Run now has an official [Cloudflare Workers](https://developers.cloudflare.com/workers/) adapter, [`@marko/run-adapter-cloudflare`](https://github.com/marko-js/run/tree/main/packages/adapters/cloudflare) ([run#307](https://github.com/marko-js/run/pull/307)). As with the other [adapters](../marko-run/adapters.md#choosing-an-adapter), installing it is the whole setup. `marko-run dev` runs the app inside workerd, the Workers runtime, with local versions of the bindings the Wrangler config declares, `marko-run preview` serves the build with `wrangler dev` against that same local state ([run#310](https://github.com/marko-js/run/pull/310)), and `marko-run build` produces a Worker that `wrangler deploy` ships as is.

Route handlers read the Worker's bindings, execution context, and request properties from `ctx.platform`, typed from the bindings the app declares on `CloudflareEnv`:

```ts
export const GET = Run.GET((ctx, next) => {
  const { env, cf } = ctx.platform;
  return next({
    city: cf?.city,
    stock: env.INVENTORY.get(ctx.params.sku), // KV lookup, passed as a promise
  });
});
```

Given an entry of its own (`marko-run build src/index.ts`), that file becomes the Worker, so an app can export Durable Objects or handle other events beside its routes.

## Class Toggles

Classes from stylesheet modules, such as CSS modules, vanilla-extract `.css.ts` files, and [`<style/styles>`](../guide/styling.md#inline-css-modules) blocks, now get the same compile-time treatment as literal class names ([marko#4405](https://github.com/marko-js/marko/pull/4405)). The compiled template holds the classes that never change, a toggle adds or removes only its own class in the browser, and the server builds each combination's markup once as the module loads rather than on every render.

```marko
<style/styles>
  .chip { border-radius: 999px; padding: 2px 10px }
  .picked { outline: 2px solid currentColor }
</style>

<let/picked=false>
<button class=[styles.chip, picked && styles.picked] onClick() { picked = !picked }>
  ${input.label}
</button>
```

The button is created with `styles.chip` already in place, and a click toggles only `styles.picked`. Literal toggles such as `open && "expanded"` and constant computed keys work the same way.

> [!WARNING]
> Since a toggle now updates its class on its own, a toggled class may not repeat a name the rest of the [`class=`](../reference/native-tag.md#class) value writes. `class=["tab", { tab: active }]` is now a compile error.

## Error Boundaries

A [`<try>`](../reference/core-tag.md#try)'s `@catch` now streams in its body's place, so the fallback is part of the server-rendered HTML and shows without JavaScript ([marko#4391](https://github.com/marko-js/marko/pull/4391)). It used to always stream out of order for the client to swap in, so it never showed until scripts ran. When nothing of the body has streamed by the time it throws, the `@catch` takes its place outright; once part of it has, the `@catch` streams after that part, which the client then removes.

```marko
<ul>
  <try>
    <await|rates|=input.shippingRates>
      <for|rate| of=rates><li>${rate.carrier}: ${rate.price}</li></for>
    </await>
    <@catch><li>Shipping is calculated at checkout.</li></@catch>
  </try>
</ul>
```

When `input.shippingRates` rejects, the server writes the `@catch` item into the list where the shipping options would have gone, so the fallback is in the page before any script runs.

Streaming pages with many `<try>` tags also got faster. Each boundary used to add a listener to the one around it, so streaming cost grew quadratically with the number of `<try>` tags; boundaries now abort the ones nested in them directly ([marko#4388](https://github.com/marko-js/marko/pull/4388)).

## Coming Soon

### Persisted Pages

[Luke LaValva](https://github.com/LuLaValva) introduced persisted pages at ViteConf 2026 in [What Even is a Single-Page App?](https://www.youtube.com/watch?v=PfyIEgLzNYI&t=20885s), arguing that choosing between single-page and multi-page apps is now more about architecture than user experience. In the [demo](https://www.youtube.com/watch?v=PfyIEgLzNYI&t=21182s), turning on patches in a multi-page app built from links and forms stops its map from reloading on every navigation.

Persisted pages are still in progress. The new [Patch Protocol](../explanation/patch-protocol.md) page describes how they will work: a navigation updates the live page instead of loading a new document, so client state, focus, and handlers survive while the server sends only what changed. Marko Run fixes that came out of that work, such as stopping a render when its client disconnects, have already shipped on their own.

### Preval

Preval brings build-time code to Marko templates. Code marked `preval` runs in the compiler, and the template compiles from its results: a JSON file or a CMS can feed a template, build flags can drop whole sections, and none of it is left for the server or the browser to run. Consider a site's navigation, read from a config file, with a beta link behind a build flag:

```marko no-format
preval import links from "./nav.json";

<nav>
  <-for|link| of=links>
    <-if=!link.beta || flags.beta>
      <a href=link.href>${link.label}</a>
    </>
  </>
</nav>
```

`flags` is build data, passed in through the `preval: { data: { flags } }` compiler option and read by templates as a global. With the beta flag off, the template compiles as if it had been written by hand:

```marko
<nav>
  <a href="/">Home</a>
  <a href="/docs">Docs</a>
</nav>
```

Runtime code that reads a preval value gets the value written into the compiled template, and `-` named tags such as `<-data-table>` expand inline at each call, so content that changes only when the site rebuilds costs nothing per request.

## Improvements

The rest of the month's feature work went into page size, server rendering, compile-time checks, and documentation.

### Smaller Pages

Pages ship less without template changes. Content inside an [`<await>`](../reference/core-tag.md#await) body no longer ships code for the browser to create it, since a settled promise only updates the body its owner already made ([marko#4530](https://github.com/marko-js/marko/pull/4530)). A [`<define>`](../reference/core-tag.md#define) whose tag variable nothing references drops its content entirely, and a `<const>` alias, `<id>`, or controlled `<let>` that nothing reads is removed ([marko#4536](https://github.com/marko-js/marko/pull/4536), [marko#4374](https://github.com/marko-js/marko/pull/4374)). An `<if>`, `<for>`, or `<show>` whose siblings render nothing, including components that render nothing, is found through its parent element without a marker of its own ([marko#4374](https://github.com/marko-js/marko/pull/4374), [marko#4384](https://github.com/marko-js/marko/pull/4384)).

A template whose input never changes in the browser no longer ships just to register a function the server writes ([marko#4423](https://github.com/marko-js/marko/pull/4423)). Smaller cuts trim about 44 bytes (brotli) from the client runtime and a few bytes from generated setup code and lazy asset scripts ([marko#4476](https://github.com/marko-js/marko/pull/4476), [marko#4540](https://github.com/marko-js/marko/pull/4540), [marko#4436](https://github.com/marko-js/marko/pull/4436)).

### Server Rendering

Server renders do less work. Resumed loop rows and `<try>` bodies render without per-row closures, which makes a 100-row keyed list render about 5% faster with about 9% fewer allocations ([marko#4447](https://github.com/marko-js/marko/pull/4447)). Resume data is written through a single path with fewer allocations and slightly smaller output ([marko#4466](https://github.com/marko-js/marko/pull/4466)).

In Marko Run, a page now stops rendering when its client disconnects, so a render behind a buffering middleware no longer runs to completion for nobody ([run#302](https://github.com/marko-js/run/pull/302)).

### Compile Checks

More mistakes are caught at compile time instead of failing at runtime. Assigning a variable that came from array destructuring or a rest element, neither of which has a change handler to receive the value, is now an error ([marko#4392](https://github.com/marko-js/marko/pull/4392), [marko#4396](https://github.com/marko-js/marko/pull/4396)). So is module-level code, a `static`, `server`, `client`, or `export` statement, that references a name existing only while a template renders, such as `input` or a tag variable ([marko#4398](https://github.com/marko-js/marko/pull/4398)).

A [tag variable](../reference/language.md#tag-variables) is now an error on a custom tag without a `<return>`, a Class API tag, or a lazily loaded tag, none of which can give it a value ([marko#4420](https://github.com/marko-js/marko/pull/4420), [marko#4418](https://github.com/marko-js/marko/pull/4418), [marko#4422](https://github.com/marko-js/marko/pull/4422)). So are a `<define>` that renders itself outside a branch and a rest parameter on `<await>` ([marko#4469](https://github.com/marko-js/marko/pull/4469), [marko#4460](https://github.com/marko-js/marko/pull/4460)).

### Documentation

The [`<script>`](../reference/core-tag.md#script) reference states its one timing guarantee, that a script runs after the DOM has updated ([website#314](https://github.com/marko-js/website/pull/314)), and [`class=`](../reference/native-tag.md#class) documents the toggle rule above ([website#305](https://github.com/marko-js/website/pull/305)).

## Fixes

Fixes this month centered on Marko Run, streaming, tag variables, resume, and lazy loading.

### Marko Run

`@marko/run` 0.11.14 fixes an open redirect, so upgrading is recommended. A request path starting with `//` could make the trailing-slash redirect and `context.redirect()` send visitors to another host, and `context.back()` followed a `Referer` from any site. Redirects now stay on the app's origin, and `back()` follows only a same-origin referer ([run#305](https://github.com/marko-js/run/pull/305)).

Implicit `HEAD` requests apply the `GET` handler's validation options ([run#301](https://github.com/marko-js/run/pull/301)). The dev server no longer leaks a worker on each custom entry restart or answers every request with a 404 after a Vite config edit ([run#313](https://github.com/marko-js/run/pull/313)), and `Run.href` works in client modules that bind their own `href` ([run#303](https://github.com/marko-js/run/pull/303)). A page that fails before sending anything no longer passes its status and headers, such as `cache-control`, on to the error response ([run#302](https://github.com/marko-js/run/pull/302)).

### Streaming

A round of fixes hardened `<try>` while streaming. A `@placeholder` that throws no longer ends the stream early or leaves an outer placeholder on the page ([marko#4390](https://github.com/marko-js/marko/pull/4390)), and a `<try>` body stops rendering at an error thrown in lazily loaded content or in a nested `<try>` without a `@catch` ([marko#4389](https://github.com/marko-js/marko/pull/4389)). When a `@catch` replaces a body, content streamed before the `<try>` keeps its effects, and nothing of the caught body stays live after resume ([marko#4395](https://github.com/marko-js/marko/pull/4395), [marko#4400](https://github.com/marko-js/marko/pull/4400), [marko#4407](https://github.com/marko-js/marko/pull/4407)). Lazily loaded tags inside a `<try>` keep their stylesheets and scripts when a `@catch` or `@placeholder` swaps content out ([marko#4406](https://github.com/marko-js/marko/pull/4406), [marko#4408](https://github.com/marko-js/marko/pull/4408), [marko#4403](https://github.com/marko-js/marko/pull/4403), [marko#4411](https://github.com/marko-js/marko/pull/4411), [marko#4435](https://github.com/marko-js/marko/pull/4435)).

### Tag Variables

Tag variables stay current when one update changes the variable and another value read beside it, including through dynamic tags, lazy tags, remounted children, and `<for>` rows ([marko#4415](https://github.com/marko-js/marko/pull/4415), [marko#4417](https://github.com/marko-js/marko/pull/4417)). A property assigned in place, such as `dialog.open = true`, is read from the object instead of a stale copy ([marko#4396](https://github.com/marko-js/marko/pull/4396)), and a dynamic tag's variable updates after resume ([marko#4419](https://github.com/marko-js/marko/pull/4419)). Reading a variable hoisted out of one branch of an `<if>`/`<else>` chain no longer crashes the compile or returns the other branch's value ([marko#4387](https://github.com/marko-js/marko/pull/4387), [marko#4393](https://github.com/marko-js/marko/pull/4393)).

### Resume

Several pages that threw `_resumed[registryId] is not a function` on resume now work: a `<define>` body reading one of the page's functions, a `<define>` tag variable passed to a child or read in an `<if>`, and a child's returned function passed to another tag ([marko#4498](https://github.com/marko-js/marko/pull/4498), [marko#4472](https://github.com/marko-js/marko/pull/4472), [marko#4499](https://github.com/marko-js/marko/pull/4499)). A `<define>` called in a dynamic tag's body, and content passed as a value to a component, keep the outer values they read when re-rendered after resume ([marko#4542](https://github.com/marko-js/marko/pull/4542), [marko#4544](https://github.com/marko-js/marko/pull/4544)).

Switching between attribute tag content after resume, as tabs do, no longer crashes ([marko#4414](https://github.com/marko-js/marko/pull/4414)), and a handler inside an `<if>` or `<for>` whose condition reads server-only state no longer throws ([marko#4378](https://github.com/marko-js/marko/pull/4378)). A `<define>` that calls another `<define>` reading the template's values renders in the browser ([marko#4497](https://github.com/marko-js/marko/pull/4497)).

### Lazy Loading

Templates imported with the [`load`](../reference/lazy-loading.md) import attribute render inside module cycles, including a template that loads itself ([marko#4529](https://github.com/marko-js/marko/pull/4529)). They resume when the server writes them into state such as a `<let>` ([marko#4425](https://github.com/marko-js/marko/pull/4425), [marko#4423](https://github.com/marko-js/marko/pull/4423)), and their assets stay out of a server-only page's entry ([marko#4446](https://github.com/marko-js/marko/pull/4446)).

### Interop

Class API and Tags API components mix more reliably. A Tags `<try>` around Class API content stops it cleanly when it catches ([marko#4402](https://github.com/marko-js/marko/pull/4402)), and lazily loaded tags of either API resolve their assets on a page of the other ([marko#4409](https://github.com/marko-js/marko/pull/4409), [marko#4410](https://github.com/marko-js/marko/pull/4410)). A Tags page whose only client work is a self-hydrating Class API component passes it its input ([marko#4521](https://github.com/marko-js/marko/pull/4521)), and `<await client-reorder>` no longer crashes when a component type registers after its placeholder is replaced ([marko#4444](https://github.com/marko-js/marko/pull/4444)). A lazily loaded template imported by a server-only Class API component keeps its load trigger instead of joining the page's hydrate bundle ([marko#4443](https://github.com/marko-js/marko/pull/4443)).

### In Brief

- `<html-script>` escapes `</script`, `<script`, and `<!--` in its text, so JSON script types such as `application/ld+json`, `importmap`, and `speculationrules` stay valid ([marko#4428](https://github.com/marko-js/marko/pull/4428)).
- A form reset updates a controlled field that joined the form later, such as one inside a hidden `<show>` ([marko#4426](https://github.com/marko-js/marko/pull/4426)).
- A server-only page that imports a PostCSS, Stylus, SugarSS, or vanilla-extract stylesheet ships it ([marko#4432](https://github.com/marko-js/marko/pull/4432)).
- A tag imported in a `static`, `server`, or `client` statement resolves as a tag again ([marko#4486](https://github.com/marko-js/marko/pull/4486), [marko#4492](https://github.com/marko-js/marko/pull/4492)).
- A `<for>` row that throws while rendering no longer leaves the loop unable to update ([marko#4485](https://github.com/marko-js/marko/pull/4485)).
- A client-rendered `<style>` keeps declarations that read values from outside its control flow ([marko#4481](https://github.com/marko-js/marko/pull/4481)).
- `<const/[...chars]=text>` builds a new array, so array methods work on a string source ([marko#4399](https://github.com/marko-js/marko/pull/4399)).
- `class=` and `style=` values type-check with `0`, so `count && "has-items"` works when `count` is a number ([marko#4437](https://github.com/marko-js/marko/pull/4437)).
- `$global` and `$signal` work inside `<html-comment>` ([marko#4385](https://github.com/marko-js/marko/pull/4385)), and `autocorrect` type-checks on every element ([marko#4416](https://github.com/marko-js/marko/pull/4416)).
- The language server's accessibility checks run on axe-core 4.14 and flag a tab element without an accessible name ([language-server#611](https://github.com/marko-js/language-server/pull/611)).

Full details for every change are in the release notes of each package on [GitHub](https://github.com/marko-js).

## Further Reading

- [September 2026](september-2026.md)
