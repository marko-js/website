# Marko in September 2026

> [!TLDR]
>
> - `<try>` boundaries are more efficient, with `<@catch>` and `<@placeholder>` written directly inside them
> - Unkeyed loops, dynamic tags, and lazily loaded pages ship less JavaScript
> - The Prettier plugin no longer deletes code after a syntax error or drops comments
> - Clearer compile errors and a new Compiler API reference
> - Persisted pages are close, built on a more rigorous compiler analysis that already benefits every app

September shipped 25 releases across the compiler, runtime, editor tooling, and integrations. `<try>` boundaries got more efficient, pages got smaller, the formatter stopped losing code, and compile errors got clearer. Persisted pages are nearly here, and the compiler analysis behind them has already landed for every app.

## Try Boundaries

`<@catch>` and `<@placeholder>` are now written directly inside their [`<try>`](../reference/core-tag.md#try), once each, so the browser sets the boundary up once instead of on every update ([marko#4343](https://github.com/marko-js/marko/pull/4343), [marko#4344](https://github.com/marko-js/marko/pull/4344)). A catch or placeholder chosen with `<if>` or `<for>` moves the condition inside it.

```marko
<try>
  <order-history customer=input.customer/>
  <@catch|err|>
    <if=input.customer.isStaff>
      <pre>${err.stack}</pre>
    </if>
    <else>
      Order history is unavailable right now.
    </else>
  </@catch>
</try>
```

Other changes that can surface when upgrading:

- Extra `<for>` parameters, a `load` import used before its `import` statement, and a string `content` on native tags are now errors ([marko#4179](https://github.com/marko-js/marko/pull/4179), [marko#4279](https://github.com/marko-js/marko/pull/4279), [marko#4304](https://github.com/marko-js/marko/pull/4304)).
- Errors thrown from `onDestroy` propagate like those from `onMount` ([marko#4350](https://github.com/marko-js/marko/pull/4350)).

## Smaller Bundles

Pages ship less without any template changes.

A `<for>` without `by=` no longer ships the code for reordering keyed rows, saving about 190 to 240 bytes brotli on pages with only unkeyed loops ([marko#4231](https://github.com/marko-js/marko/pull/4231)), and a `by=` key is treated as constant within its row ([marko#4254](https://github.com/marko-js/marko/pull/4254)).

A [dynamic tag](../reference/language.md#dynamic-tags)'s body is bundled only when the browser can render it, so string tag names, names that resolve to known templates, and wrappers chosen only by `input` stay out of the client bundle ([marko#4203](https://github.com/marko-js/marko/pull/4203), [marko#4222](https://github.com/marko-js/marko/pull/4222), [marko#4164](https://github.com/marko-js/marko/pull/4164)). The same goes for static content passed to a local `<define>`, content passed only through a native spread, and attribute tags a child never reads ([marko#4202](https://github.com/marko-js/marko/pull/4202), [marko#4249](https://github.com/marko-js/marko/pull/4249), [marko#4341](https://github.com/marko-js/marko/pull/4341)).

With [lazy loading](../reference/lazy-loading.md), a parent template that only revives through its lazily loaded child stays out of the eager bundle ([marko#4314](https://github.com/marko-js/marko/pull/4314)), and tags lazily loading the same template share one loader ([marko#4269](https://github.com/marko-js/marko/pull/4269)). Registrations, streamed resume data, and `<try>` renderers also got smaller ([marko#4201](https://github.com/marko-js/marko/pull/4201), [marko#4188](https://github.com/marko-js/marko/pull/4188), [marko#4093](https://github.com/marko-js/marko/pull/4093)).

## Formatting

The Prettier plugin no longer changes what a template means. A template with a syntax error used to print only the part before the error, so `prettier --write` deleted the rest of the file; it now fails with a code frame and leaves the file alone ([prettier#147](https://github.com/marko-js/prettier/pull/147)).

Comments inside an open tag are kept ([prettier#154](https://github.com/marko-js/prettier/pull/154), [prettier#153](https://github.com/marko-js/prettier/pull/153)), backslashes in text no longer multiply on each run ([prettier#151](https://github.com/marko-js/prettier/pull/151)), spaces that render beside inline tags are preserved ([prettier#156](https://github.com/marko-js/prettier/pull/156)), and formatting without a JavaScript parser keeps `async` methods and scriptlet `$` ([prettier#150](https://github.com/marko-js/prettier/pull/150)). In editors, Format Document works alongside other Prettier plugins such as Tailwind's ([language-server#603](https://github.com/marko-js/language-server/pull/603)), and quick fixes keep comments, types, and escapes ([marko#4238](https://github.com/marko-js/marko/pull/4238), [marko#4247](https://github.com/marko-js/marko/pull/4247), [marko#4302](https://github.com/marko-js/marko/pull/4302)).

## Improvements

The rest of the month's feature work went into error messages and documentation.

### Error Messages

`<DIV>` reports that tag names are case-sensitive ([marko#4178](https://github.com/marko-js/marko/pull/4178)), spreading arguments into a custom tag is caught at compile time ([marko#4092](https://github.com/marko-js/marko/pull/4092)), a root `interface` or `enum` gets the hint to use [`static`](../reference/language.md#static) ([marko#4265](https://github.com/marko-js/marko/pull/4265)), and `<effect>` with a body points at `<script>` ([marko#4266](https://github.com/marko-js/marko/pull/4266)). `@marko/vite` prints compile errors with their `file:line:column` and one code frame, naming the child template when the error is in one ([vite#318](https://github.com/marko-js/vite/pull/318), [marko#4223](https://github.com/marko-js/marko/pull/4223)). Long lines are trimmed in code frames, and parsing is linear in sibling count, so a template with 16,000 siblings parses in 0.35 seconds rather than 2.9 ([marko#4300](https://github.com/marko-js/marko/pull/4300)).

### TypeScript Syntax

More TypeScript works directly in templates. A trailing non-null assertion ends an attribute value instead of swallowing the next attribute or the end of the tag, `void` ends a type annotation, and `delete` and `...new` read as the JavaScript they are ([htmljs-parser#253](https://github.com/marko-js/htmljs-parser/pull/253), [htmljs-parser#254](https://github.com/marko-js/htmljs-parser/pull/254), [htmljs-parser#255](https://github.com/marko-js/htmljs-parser/pull/255)).

```marko
static const flags = new Map([
  ["en", "/flags/gb.svg"],
  ["fr", "/flags/fr.svg"],
]);

<img alt="" src=flags.get(input.locale)!/>
```

Highlighting in VS Code, tree-sitter editors, and TextMate follows the same rules ([language-server#608](https://github.com/marko-js/language-server/pull/608), [tree-sitter#15](https://github.com/marko-js/tree-sitter/pull/15), [marko-tmbundle#21](https://github.com/marko-js/marko-tmbundle/pull/21)).

### Documentation

A new [Compiler API](../reference/compiler.md) reference covers compiling templates and every compiler option ([website#298](https://github.com/marko-js/website/pull/298)), and [let vs const](../explanation/let-vs-const.md) is now a full article ([website#289](https://github.com/marko-js/website/pull/289)). The [TypeScript](../reference/typescript.md#enabling-typescript-in-your-marko-project) guide recommends that tag libraries publish the `.d.marko` files `@marko/type-check` emits ([website#294](https://github.com/marko-js/website/pull/294)), and [`<html-script>` and `<html-style>`](../reference/core-tag.md#html-script--html-style) now note that their interpolations run as code ([website#299](https://github.com/marko-js/website/pull/299)).

### Docs Site

The [playground](/playground) can install component libraries through `package.json` ([website#292](https://github.com/marko-js/website/pull/292)), docs search finds the section for a bare symbol such as `@` or `${` ([website#295](https://github.com/marko-js/website/pull/295)), and the mobile docs menu fits a whole section on one screen ([website#239](https://github.com/marko-js/website/pull/239)).

### Native Tags

The native `<search>` element compiles and type-checks like any other HTML element ([marko#3313](https://github.com/marko-js/marko/pull/3313)).

## Fixes

Fixes this month centered on streaming, resume, and less common template shapes.

- Interacting with a page while `<await>` content streams keeps the newest value, and `@placeholder` no longer flickers or stays up ([marko#4258](https://github.com/marko-js/marko/pull/4258), [marko#4264](https://github.com/marko-js/marko/pull/4264), [marko#4272](https://github.com/marko-js/marko/pull/4272), [marko#4349](https://github.com/marko-js/marko/pull/4349), [marko#4350](https://github.com/marko-js/marko/pull/4350), [marko#4359](https://github.com/marko-js/marko/pull/4359)).
- Tag variables, controllable `<let>` handlers, spread attributes, and derived values stay correct after resume ([marko#4347](https://github.com/marko-js/marko/pull/4347), [marko#4317](https://github.com/marko-js/marko/pull/4317), [marko#4270](https://github.com/marko-js/marko/pull/4270), [marko#4197](https://github.com/marko-js/marko/pull/4197)).
- Dynamic tags with nullable names or a choice between templates, and recursive `<define>` tags, render correctly ([marko#4274](https://github.com/marko-js/marko/pull/4274), [marko#4340](https://github.com/marko-js/marko/pull/4340), [marko#4318](https://github.com/marko-js/marko/pull/4318), [marko#4321](https://github.com/marko-js/marko/pull/4321)).
- Attribute tags built with `<if>` and `<for>` keep every item and their loop values ([marko#4232](https://github.com/marko-js/marko/pull/4232), [marko#4256](https://github.com/marko-js/marko/pull/4256)).
- `load: "render"` imports stay lazy, and a lazily loaded template with only styles links its stylesheet ([marko#4279](https://github.com/marko-js/marko/pull/4279), [vite#316](https://github.com/marko-js/vite/pull/316)).
- A `marko@5` app that also lists `@marko/runtime-tags` keeps compiling its Class API templates ([marko#4268](https://github.com/marko-js/marko/pull/4268)).

Full details for every change are in the release notes of each package on [GitHub](https://github.com/marko-js).

## Coming Soon

[Persisted pages](august-2026.md#coming-soon), which keep a page alive across navigations by patching it in place, are very close. Every template now renders as patches, the server no longer resends shells the page already holds, and lazy templates, `<try>`, and streaming content patch the way they render in a document.

The work also pushed the compiler's analysis to be exact about which values the server drives and which the browser owns. That rework has already landed on `main` for every app, and several of this month's fixes came out of it.

Marko has also joined the Opus 5.5 video generation bandwagon with a persisted pages trailer. Check it out!

<video src="/assets/newsletter/persisted-pages-trailer.mp4" poster="/assets/newsletter/persisted-pages-trailer.jpg" controls playsinline preload="metadata" aria-label="Persisted pages trailer" style="display: block; width: 100%; height: auto; border-radius: 8px"></video>

## Community

[loman](https://github.com/its-loman) wrote [Apparently the Frontend Framework I Wanted Already Existed](https://daily.dev/posts/a1R5v80Fk) on daily.dev, about discovering that Marko already was the framework they had wanted to build: HTML first, with reactive dependencies worked out at compile time and static content left static.

## Further Reading

- [August 2026](august-2026.md)
