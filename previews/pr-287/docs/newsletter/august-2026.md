# Marko in August 2026

> [!TLDR]
>
> - Shorthand methods accept `async`, with parser, editor, and formatter support landing together
> - Layouts without interactivity stay out of the client bundle, and runtime a page does not use is tree-shaken away
> - Marko Run supports the `QUERY` method and answers malformed requests with proper status codes
> - More compiler diagnostics name the variable, the rule, and the fix
> - Work is well underway on persisted pages, which keep browser state alive across navigations

August paired a small syntax addition with a large amount of hardening. Shorthand methods can now be `async`, a round of tree-shaking work cut what pages and servers load, Marko Run tightened its HTTP handling, and the compiler's error messages kept getting more specific. Behind the scenes, a lot of work went into persisted pages, which are not finished yet and are covered under Coming Soon.

## Async Methods

Shorthand methods on tags and attributes accept the `async` keyword, so a handler can `await` inside its body without wrapping it in a separate function ([htmljs-parser#236](https://github.com/marko-js/htmljs-parser/pull/236), [marko#3925](https://github.com/marko-js/marko/pull/3925)).

```marko
<let/saving=false/>

<button async onClick() {
  saving = true;
  await saveDraft();
  saving = false;
}>
  ${saving ? "Saving" : "Save draft"}
</button>
```

This follows from how Marko attributes already work. A tag's attributes read like the properties of a JavaScript object, and a shorthand method is the object method shorthand, so `async` goes exactly where it would in an object literal: before the method name, or before the parameter list for the default attribute (`<my-tag async (event) { ... }>`). Using `await` in a method that is not `async` was always an error, but it surfaced later in the toolchain; the compiler now reports it directly and points at the missing keyword ([marko#3952](https://github.com/marko-js/marko/pull/3952)).

Tooling shipped alongside the syntax. The language server type checks the body as an async function and highlights the keyword ([language-server#588](https://github.com/marko-js/language-server/pull/588)), Prettier prints it ([prettier#141](https://github.com/marko-js/prettier/pull/141)), the tree-sitter grammar recognizes it ([tree-sitter#10](https://github.com/marko-js/tree-sitter/pull/10)), and the [language reference](../reference/language.md#shorthand-methods) documents it ([website#276](https://github.com/marko-js/website/pull/276)).

## Bundle Size

A series of changes made the runtime tree-shake around what a page actually uses, so pages ship less without changing a line of their templates.

Two changes to the client entry work together. First, templates with no interactivity of their own are pruned from it: a page entry now links the topmost templates that have client work rather than the root template, so a layout or root that only renders HTML stays out of the client bundle entirely. Second, a `client` statement no longer implies reactivity. Running code in the browser and resuming a page are different things, and a page that only does the former no longer loads the resume runtime to do it ([marko#4037](https://github.com/marko-js/marko/pull/4037)).

```marko
client console.log("hello from the browser");

<h1>${input.title}</h1>
```

A page like this one, whose only client-side code is a [`client`](../reference/language.md#server-and-client) statement, now bundles just that statement and none of Marko's runtime.

Runtime that a page has no use for is dropped. A page that never uses `$signal` or subscribes to anything no longer carries the teardown sweeps that exist to clean those up, and a page without [lazy tags](../reference/lazy-loading.md) no longer carries the bookkeeping that lets a lazily loaded module enable a branch after resume. Most pages use neither, so most pages get both savings ([marko#3969](https://github.com/marko-js/marko/pull/3969), [marko#3971](https://github.com/marko-js/marko/pull/3971)).

Smaller changes point the same direction: empty template setups are skipped, inert resume metadata is left out of the payload, async render completions in the same turn flush once, forms that use a single kind of control tree-shake the reset handling for the others, and the server runtime carries pure annotations so bundlers can drop the parts a server bundle never reaches ([marko#3960](https://github.com/marko-js/marko/pull/3960), [marko#3962](https://github.com/marko-js/marko/pull/3962), [marko#3963](https://github.com/marko-js/marko/pull/3963), [marko#3964](https://github.com/marko-js/marko/pull/3964), [marko#4055](https://github.com/marko-js/marko/pull/4055)).

## Marko Run

`@marko/run` supports the `QUERY` HTTP method. A `+handler` file exports it like any other verb, it takes the same `json` and `form` [body validation](../marko-run/validation.md#request-bodies) as `POST`, `PUT`, and `PATCH`, and calling `next` from it renders the page when the route has one ([run#275](https://github.com/marko-js/run/pull/275)).

```ts
export const QUERY = Run.QUERY(
  { json: ReportFilters },
  (ctx) => Response.json(runReport(ctx.body)),
);
```

Request handling got stricter about what it accepts. A body that fails to parse, whether invalid JSON, invalid UTF-8, or bad multipart data, answers 400 instead of a 500 page, and one over the configured size limit answers 413 ([run#257](https://github.com/marko-js/run/pull/257)). A content type no body option handles answers 415, where a route configured only for `json` used to quietly parse `text/plain` as a form and skip the validator ([run#258](https://github.com/marko-js/run/pull/258)). `ctx.body` is now only defined once a validator is merged in, so a middleware that sets a `maxBytes` limit alone does not create an untyped body ([run#282](https://github.com/marko-js/run/pull/282)).

`HEAD` requests on a route with a `Run.GET` handler run the handler and return a body-less response without executing the page template ([run#245](https://github.com/marko-js/run/pull/245)). When a client disconnects, `request.signal` aborts and an idle stream is cancelled, so a server-sent events or long-poll handler no longer leaks a timer per connection ([run#236](https://github.com/marko-js/run/pull/236)). Exporting a verb that is not a handler, such as `export const GET = Run.POST(...)`, fails at load with a message naming the export instead of registering a route that answers 204 ([run#240](https://github.com/marko-js/run/pull/240)).

## Diagnostics

The work on diagnostics that began in July continued, with another round of compile errors becoming specific about what went wrong and how to fix it.

Assignment mistakes around tag variables now name the variable and the rule, for instance that a [tag variable](../reference/language.md#tag-variables) is declared by a tag below the assignment and the tag needs to move above it ([marko#3800](https://github.com/marko-js/marko/pull/3800)). An invalid tag variable such as `<div/my-el>` reports that the name is not a valid identifier or destructuring pattern instead of a Babel parse error ([marko#3795](https://github.com/marko-js/marko/pull/3795)). A module-level `function`, `class`, `type`, or `interface` written without [`static`](../reference/language.md#static) explains the prefix rather than suggesting a similarly named tag ([marko#4044](https://github.com/marko-js/marko/pull/4044)), and a statement tag written with angle brackets, like `<static const x=1>`, says to write it at the root without them ([marko#3728](https://github.com/marko-js/marko/pull/3728)).

Several tags check their inputs more carefully. `<show if=condition>` is rejected in favor of [`<show=condition>`](../reference/core-tag.md#show) ([marko#4068](https://github.com/marko-js/marko/pull/4068)); `<try>` rejects an attribute tag other than `<@placeholder>` and `<@catch>`, with a suggestion for a near miss ([marko#3797](https://github.com/marko-js/marko/pull/3797)); and a `<script>` body that returns a cleanup function warns that the value is discarded and points at `$signal.onabort` or `<lifecycle onDestroy>` ([marko#3796](https://github.com/marko-js/marko/pull/3796)). Reading `event.currentTarget` in a native event handler is a type error whose message explains that Marko delegates events and the handler's second parameter is the element ([marko#3817](https://github.com/marko-js/marko/pull/3817)).

Errors also surface from more places. A child template that fails to compile reports its own error on the parent build rather than disappearing behind a "tag not found" ([marko#4035](https://github.com/marko-js/marko/pull/4035)). In debug mode, an unserializable value is named by the variable, attribute, or handler it came from instead of an internal slot id ([marko#3888](https://github.com/marko-js/marko/pull/3888)), a client-reactive read of a `$global` key missing from `serializedGlobals` says so ([marko#4025](https://github.com/marko-js/marko/pull/4025)), and a lazy module that fails to load logs which server-rendered content cannot become interactive ([marko#4048](https://github.com/marko-js/marko/pull/4048)). Links inside error messages point at the current reference docs again ([marko#3791](https://github.com/marko-js/marko/pull/3791)).

The agent fix guide appended to compile errors, which tells a coding agent to read the cheat sheet before attempting a fix, can be forced on or off with a `MARKO_AGENT_FIX_GUIDE` override, and it now reaches editors through recovered diagnostics as well ([marko#3784](https://github.com/marko-js/marko/pull/3784), [marko#3943](https://github.com/marko-js/marko/pull/3943)).

## Improvements

The remaining feature work touched attribute parsing and the Marko 5 packages.

### Attribute Comparisons

A `>=` preceded by whitespace inside an unenclosed attribute value now parses as a comparison, matching how `<=` already behaved, so `<if=count >= 10>` needs no parentheses. A bare `>` split by whitespace, as in `<if=count > 10>`, used to silently end the tag and leave `10>` as text; the parser now recognizes the shape and reports an error asking for parentheses or no whitespace. A whitespace-preceded `</` after such a value is treated as the close tag it is, replacing a misleading "missing ending tag" report ([htmljs-parser#234](https://github.com/marko-js/htmljs-parser/pull/234)). The tree-sitter grammar and language server follow the same rules ([tree-sitter#10](https://github.com/marko-js/tree-sitter/pull/10), [language-server#588](https://github.com/marko-js/language-server/pull/588)), and the [attribute termination](../reference/language.md#attribute-termination) docs were updated ([website#273](https://github.com/marko-js/website/pull/273)).

### Marko 5

The `marko` Class API package README and getting-started guide now state that Marko 5 is in maintenance mode, that new projects should start on Marko 6, and that both APIs [run side by side](../guide/marko-5-interop.md) ([marko#4056](https://github.com/marko-js/marko/pull/4056)). The same change gives `CompileError` flat `file`, `line`, and `column` properties. Marko 5's native tag types are now derived from Marko 6's, which adds SVG element types; the older camelCase handler names remain as deprecated aliases, and attributes on SVG elements that were previously unchecked may now report type errors ([marko#3999](https://github.com/marko-js/marko/pull/3999)).

## Fixes

Correctness work ran across Marko Run, Class API interop, streaming, and rendered output.

### Routing

Routing handles unusual URLs. Catch-all params are URL-decoded like dynamic segments ([run#238](https://github.com/marko-js/run/pull/238)), static segments that arrive percent-encoded, such as a `café/` directory, match ([run#274](https://github.com/marko-js/run/pull/274)), `Run.href` omits `undefined` search values instead of writing `page=undefined` ([run#272](https://github.com/marko-js/run/pull/272)), and the [Netlify](../marko-run/adapters.md#netlify) edge adapter serves paths containing dots ([run#249](https://github.com/marko-js/run/pull/249)).

The dev server lost several ways to silently stop working. Adding or removing a `+layout` file takes effect without an unrelated edit ([run#242](https://github.com/marko-js/run/pull/242)), a second dev server picks a free HMR port instead of colliding with the first ([run#248](https://github.com/marko-js/run/pull/248)), a permanent `504 Outdated Optimize Dep` under multi-environment plugins is gone ([run#260](https://github.com/marko-js/run/pull/260)), and app code importing `@marko/run/router` no longer forms an import cycle ([run#267](https://github.com/marko-js/run/pull/267)). Builds resolve import conditions per Vite environment ([run#230](https://github.com/marko-js/run/pull/230)), and the static adapter fails the build when a crawled route errors rather than shipping a site with missing pages ([run#234](https://github.com/marko-js/run/pull/234)).

### Class API Interop

A stateful Tags API child under a non-interactive Class API component hydrates ([marko#3939](https://github.com/marko-js/marko/pull/3939)), inline function props passed from a Class parent resume on a Tags child ([marko#3997](https://github.com/marko-js/marko/pull/3997)), a Class parent's `on-*` events are no longer injected into a dynamic Class child's input, where they serialized as attribute text ([marko#4061](https://github.com/marko-js/marko/pull/4061)), and a Class API layout with no interactivity of its own no longer pulls the Marko 5 runtime into the client bundle ([marko#4037](https://github.com/marko-js/marko/pull/4037)).

### Streaming

A catch boundary in `<try>` aborts with its parent render, so a disconnected stream does not leave [`<await>`](../reference/core-tag.md#await) regions running ([marko#4053](https://github.com/marko-js/marko/pull/4053)); one throwing write, such as writing after a disconnect, no longer stalls other in-flight renders ([marko#3865](https://github.com/marko-js/marko/pull/3865)); and `pipe()` closes its target on abort so a gzip transform does not strand the response ([marko#3738](https://github.com/marko-js/marko/pull/3738)).

### In Brief

- Page assets are emitted after the doctype rather than before it, which had triggered quirks mode ([marko#3866](https://github.com/marko-js/marko/pull/3866)).
- A regular expression containing `<` serializes correctly; named groups and lookbehinds previously broke the resume script ([marko#4043](https://github.com/marko-js/marko/pull/4043)).
- Template ids percent-encode unusual characters so distinct route paths no longer collide in the resume registry ([marko#4045](https://github.com/marko-js/marko/pull/4045)).
- A page whose only interactivity is in a dynamic tag hydrates ([marko#3830](https://github.com/marko-js/marko/pull/3830)).
- `<textarea>` bodies decode character references, matching Marko 5 ([marko#4018](https://github.com/marko-js/marko/pull/4018)), and carriage returns in server-rendered text and attributes survive the HTML parser ([marko#3897](https://github.com/marko-js/marko/pull/3897), [marko#3858](https://github.com/marko-js/marko/pull/3858)).
- Dynamic [`<style>`](../reference/core-tag.md#dynamic-values) values work inside SVG ([marko#3955](https://github.com/marko-js/marko/pull/3955)), and an interpolation inside an unquoted `url()` is a compile error explaining to interpolate the whole `url(...)` ([marko#3872](https://github.com/marko-js/marko/pull/3872)).
- Typing emoji or other astral characters into a controlled input no longer jumps the caret to the end ([marko#3860](https://github.com/marko-js/marko/pull/3860)).
- Two-way binding to a value destructured with a computed string key works ([marko#3875](https://github.com/marko-js/marko/pull/3875)), and a dynamic `<select>` with `value` gets its own controlled scope ([marko#3924](https://github.com/marko-js/marko/pull/3924)).
- The compiler cache invalidates a parent when an analyzed child changes ([marko#3932](https://github.com/marko-js/marko/pull/3932)).
- `@marko/vite` works with [vanilla-extract](https://vanilla-extract.style) and similar zero-runtime CSS libraries, whose `*.css.ts` modules were previously tree-shaken away so pages rendered unstyled ([vite#305](https://github.com/marko-js/vite/pull/305)); it also only applies its side-effect override when linked, restoring Storybook and Vitest ([vite#308](https://github.com/marko-js/vite/pull/308)).
- Generated `.d.marko` files no longer leak an internal `~api` export ([language-server#584](https://github.com/marko-js/language-server/pull/584)).
- The tree-sitter grammar passes six more of its fixtures against the current parser ([tree-sitter#10](https://github.com/marko-js/tree-sitter/pull/10)).

Full details for every change are in the release notes of each package on [GitHub](https://github.com/marko-js).

## Coming Soon

A large body of work this month went into persisted pages, a mode in which a page stays alive across navigations. When the URL changes, the server renders the next page as it always has, but instead of replacing the document it sends only what changed, and the browser patches the live page in place. There is no HTML diff involved on either side. The compiler already knows every hole a server value can land in, so the server writes new values straight to those holes and the browser applies them straight to the nodes it already resumed, the same way an in-page update works today.

The effect is that state in the browser survives while server-driven content updates around it. A counter keeps counting, an open menu stays open, and text in an input stays put, while the heading, the list, and the promo banner the server decides on all change underneath. There is no client-side router to adopt and no rendering logic to duplicate: templates are ordinary Marko, the compiler works out which structure the server drives and which the browser owns, and anything the patch cannot express faithfully falls back to a full navigation, so a page is never left half updated.

Consider a page with a server-driven banner beside a client-side counter.

```marko
<let/count=0/>

<main>
  <h1>${input.title}</h1>
  <if=input.promo>
    <aside class="promo banner">${input.promo}</aside>
  </if>
  <button onClick() { count++ }>Count ${count}</button>
</main>
```

The first render is ordinary Marko HTML, with the same markers a resumable page already carries. Those markers are the holes the server can write into later.

```html
<main>
  <h1>Store<!--M_$1 a--></h1>
  <!--M_[-->
  <aside class="promo banner">Sale<!--M_$2 a--></aside>
  <!--M_]1 b 2-->
  <button>Count <!>0<!--M_$1 d--></button><!--M_$1 c-->
</main>
<script>/* resume data */</script>
```

On a normal navigation every later render looks like this too: the server sends the whole document again and the counter starts over at zero. On a persisted page, after the user has clicked twice and the server drops the promo, the wire carries only this (debug output, with the template path shortened):

```js
{ "PatchText:#text/0": "Store!", "PatchBranch:#text/1": 0 }
```

The heading's text hole gets its new value and the branch is told to hide. `count` is never mentioned, because the browser owns it. When the promo comes back, the frame carries the branch's markup once, as a shell the browser can build from, along with the values for its holes:

```js
[
  `template.marko_1*shell;D ;<aside class="promo banner"> </aside>`,
  {
    "PatchText:#text/0": "Store!",
    "PatchBranch:#text/1": [{ "PatchText:#text/0": "Back" }, "template.marko_1*shell"],
  },
]
```

In optimized output the same two frames shrink to single-letter kinds and accessors, the same ones the resumed page already uses to find its nodes:

```js
{ ta: "Store!", bb: 0 }
```

```js
[`a0;D ;<aside class="promo banner"> </aside>`, { ta: "Store!", bb: [{ ta: "Back" }, "a0"] }]
```

Later renders cost a fraction of the HTML they replace, and nothing else about the page changes to get there. It is still streamed and resumed the same way, updates stay as fine grained as they are today, and the client bundle grows by only a small amount to apply the frames. The format is still being worked on and will change before release.

This is not available to try yet. The work lives on the [`persisted-pages`](https://github.com/marko-js/marko/tree/persisted-pages) branch, where August built out the patch protocol and the analysis behind it, and an experimental release is expected in September.

## Project Velocity

The volume behind this edition is not an accident. Marko merged 36 pull requests in January, 357 in July, and 323 in August, and two changes to how the project works account for most of the difference.

The first is the test suite. In January the full `marko` suite ran serially in about four minutes; a parallel runner in July fanned it across CPU cores to about 87 seconds, later trimmed to around 81, with the snapshot and size output byte-identical to the serial run ([marko#3326](https://github.com/marko-js/marko/pull/3326), [marko#3387](https://github.com/marko-js/marko/pull/3387)). August capped the runner's memory, let concurrent runs share CPU rather than fight over it, and made the Class API suite about 20% faster ([marko#4066](https://github.com/marko-js/marko/pull/4066)). A suite that finishes in a minute and a half gets run on every change, including by agents.

The second is agent feedback. Every marko-js repository carries an `agent-feedback/` directory where an agent that notices something actionable outside its current task, a suspected bug, a confusing error, a missing type, files it as a small item with a reproduction rather than fixing it in an unrelated diff or dropping it. A triage pass then works the backlog one item per pull request: reproduce, fix with a guarding test, delete the item. In `marko` alone, August filed 137 items and closed 30, and a large share of this edition's diagnostics and correctness fixes started life that way. The convention and the skills that drive it are now public at [dylanPiercey/skills](https://github.com/dylanPiercey/skills), so any project can adopt the same loop ([marko#4003](https://github.com/marko-js/marko/pull/4003)).

## Community

### go-marko

[@svallory](https://github.com/svallory) released [go-marko](https://go-marko.saulo.tech/), which compiles Marko templates to Go. In the author's words, it lets a developer "write UI in Marko, TS-typed templates, custom tags, and real client-side reactivity via Marko's resumability, and serve it from a Go server with zero Node in production." Templates compile at build time into typed Go render functions, and pages with client-side state get a small bundle through resumability while pages without ship no JavaScript. It is at v0.1.0 and is an independent project, not an official Marko integration.

### marko-zag

[marko-zag](https://github.com/svallory/marko-zag), the same author's Marko 6 bindings for the [Zag](https://zagjs.com) state machine library, reached 1.2 and is now listed on zagjs.com as a [community adapter](https://zagjs.com/guides/framework-adapters), alongside the official React, Solid, Vue, and Svelte ones. It runs Zag's framework-agnostic machines inside Marko components with server rendering and resume in mind.

## Further Reading

- [July 2026](july-2026.md)
