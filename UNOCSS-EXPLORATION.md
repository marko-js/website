# UnoCSS + compile-class exploration

Spike to evaluate migrating the site from SCSS + CSS Modules to
[UnoCSS](https://unocss.dev) with the
[compile-class transformer](https://unocss.dev/transformers/compile-class),
targeting two goals: **more maintainable styling** and **smaller CSS**.

> [!IMPORTANT]
> Three findings:
>
> 1. The stock `@unocss/transformer-compile-class` (a Vite transformer) **cannot
>    work with Marko** and breaks the build. This is inherent to how it hooks in,
>    not a config mistake (Finding 1).
> 2. **Compile mode can still be made to work** by moving the `:uno:` substitution
>    into Marko's own compiler with a ~30-line transform. This branch implements it
>    and it builds green in both `build` and `dev` (see "Getting compile mode
>    working").
> 3. Working or not, compile mode **does not reduce total bytes** for this site,
>    and the officially supported atomic mode grows the dominant HTML. So the size
>    goal is not met by any UnoCSS mode here.

## Baseline (current setup)

| Asset | Raw | Gzip |
| --- | --- | --- |
| **CSS** (8 code-split chunks) | 95,822 B | 15,119 B |
| **HTML** (211 static pages) | 3,365,463 B | 244,023 B |

HTML gzip (244 KB) is **~16x** the CSS gzip (15 KB). CSS is not the dominant
payload here, and it is already minified, code-split per route, and built on
CSS-variable tokens rather than repeated literals.

## Finding 1 — why the stock compile-class transformer breaks Marko

Authoring `class=":uno: flex gap-2 ..."` with `transformerCompileClass()` in the
Vite config fails the build with 15 errors like:

```
[MISSING_EXPORT] "$setup3" is not exported by ".../home-cta-button.marko".
[MISSING_EXPORT] "$template3" is not exported by ".../home-cta-button.marko".
[MISSING_EXPORT] "$walks3" is not exported by ".../home-cta-button.marko".
```

### Root cause (reproduced)

Marko mints each template's cross-module export ids (`$setup` / `$template` /
`$walks`) with a counter (`generateUid`) whose state lives in a **process-wide
cache keyed by filename, not by source content** (`uid-counts:<filename>` in
`marko/dist/translator`). Normally a separate, source-keyed output cache
short-circuits any second compile of an unchanged file, so the counter is only
touched once and ids stay stable.

`transformerCompileClass` is an `enforce: "pre"` **source rewriter**: it turns
`:uno: ...` into `uno-<hash>` before Marko compiles. But Marko's cross-template
analysis reads child `.marko` files **directly from disk through `@marko/compiler`**
(`resolveMarkoFile` → `markoOpts.fileSystem.readFileSync`), bypassing Vite and the
transformer. So in one build the compiler sees the **same filename as two different
byte sequences**: the Vite-rewritten module and the raw on-disk version a parent
reads during analysis. The output cache no longer short-circuits, `generateUid`
runs again, finds the counter already seeded, and bumps the ids
(`$setup` → `$setup2` → `$setup3`). The parent emits
`import { $setup3, ... } from "./child.marko"` for the ids it saw; the child module
exports different ids → `MISSING_EXPORT`.

Reproduced directly by compiling one filename twice with a shared cache: identical
source twice stays stable; two different sources for the same filename bump the
counter (`$setup` then `$setup2`), order-independent. This is the same category of
failure UnoCSS closes as unsupported on other split-compile frameworks: Next.js
[#4507](https://github.com/unocss/unocss/issues/4507) (not planned), Svelte
[#1676](https://github.com/unocss/unocss/issues/1676), React-SWC
[#2653](https://github.com/unocss/unocss/issues/2653).

**No Vite-level hook can fix this**, because the disk-read analysis pass never
enters Vite. The transform has to live inside `@marko/compiler`.

## Getting compile mode working

The fix follows directly from the root cause: run the `:uno:` → `uno-<hash>`
substitution **inside Marko's compile**, where it applies to every compilation
(the module and the disk-read dependency pass alike), so all passes see identical
bytes and the ids stay in sync. Marko exposes exactly the right hook: a taglib
`transform` runs as a Babel visitor in the compiler's `transform` stage, which
precedes the `analyze` stage that mints the export ids.

This branch implements it in ~30 lines:

- `uno-marko/transform.cjs` — a Marko compile-time transform (registered globally
  via `marko.json`) that rewrites any `":uno: <utilities>"` string literal to
  `"uno-<hash>"` and records the `class -> utilities` mapping on a shared store.
- `uno.config.ts` — no Vite transformer; instead a **dynamic shortcut**
  `[/^uno-[0-9a-z]+$/, ([name]) => store.get(name)]` resolves each compiled class
  back to its utilities so UnoCSS generates the CSS.
- Plugin order is `marko()` then `unocss()` (UnoCSS just extracts and generates;
  it no longer rewrites source).

Result, verified: `home-cta-button` (a child tag used by 5 parents — the exact
case that failed before) authored as inline `:uno:` utilities compiles to a single
`class="uno-mhb7vd"` in the HTML, with all 8 rules generated (base, `:hover::after`
shimmer + `@keyframes`, three media queries, dark-mode gradient). Build is green
(0 `MISSING_EXPORT`); the dev server serves the same compiled class with no raw
`:uno:` leaking into the HTML.

### Caveats of the custom transform

- It is a **custom integration**, not an off-the-shelf feature, though it is built
  entirely on supported extension points (Marko's taglib transform hook and
  UnoCSS's dynamic shortcuts).
- The transform is global (visits every string literal in project templates) and
  only acts on those starting with `:uno:`; the cost is negligible but the scope is
  broad.
- Variant groups (`hover:(a b)`) are stored verbatim; the examples here use the
  expanded form. Named classes (`:uno-badge:`) and group expansion are easy
  additions if wanted.
- It does not change the size story below.

## Finding 2 — size does not go down in any mode

**Single-class modes** (compile mode, or its stand-in `shortcuts`) fold every
declaration into one class with no atomic sharing, so they do not beat hand-written
CSS. Measured on `home-cta-button`, compiled and minified:

| | Bytes (min) |
| --- | --- |
| Original SCSS `.cta` | **854** |
| UnoCSS single class (same states) | **1,715** (~2x) |

The gradient alone expands to a `--un-gradient-from / -to / -stops / -shape` var
cascade (~300 B) versus a ~90 B hand-written `linear-gradient(...)`. The current
SCSS already factors color and theme through CSS variables, so there is little
duplication left for a utility engine to remove.

**Atomic mode** is the only mode that shares CSS across elements, but it moves bytes
into the markup, which is the payload that matters here. Converting one small
component (`home-cta-button`, used 5x on the home page) to atomic inline utilities
grew the home page HTML by **+2,778 B** — one component on one of 211 pages.

## Finding 3 — small wins available without UnoCSS

The Sass-generated utility modules emit every color and variant combination whether
used or not:

- `text.module.scss` — generates 25 classes, **8 used** (~68% dead). ~1.3 KB chunk.
- `section-colors.module.scss` — generates 5 `.xSection` classes, **2 used**.

Pruning this dead code is a genuine but small win (~1 to 1.5 KB raw) and needs no
UnoCSS. Separately, note that extracting utilities from `.marko` also picks up
ordinary words as spurious classes (`.block`, `.hidden`, `.border`, `.table`, ...);
tunable via blocklist/safelist but ongoing config upkeep.

## Recommendation

- **Compile mode is achievable** (this branch proves it) if inline utility
  authoring is desired, via the small Marko compiler transform above. It is the
  only robust integration; a Vite transformer cannot work.
- **But it does not meet the stated goals.** CSS is not the dominant payload, the
  current SCSS + token setup is already lean, and no UnoCSS mode reduces total
  bytes: single-class modes grow the CSS slightly, atomic grows the dominant HTML.
- If maintainability is the real driver, weigh the custom transform's upkeep
  against simply pruning the unused generated classes (Finding 3) and keeping the
  current, well-optimized pipeline. Worth raising the compiler-transform approach
  with the Marko team if there is appetite for a first-class utility-CSS story.

## Reproduction

```sh
npm install
NODE_ENV=production npm run build   # green: home-cta-button uses inline :uno: utilities
npm run dev                         # dev also serves the compiled uno- class
```

Files in this spike: `uno-marko/transform.cjs` + `marko.json` (the compile-time
transform), `uno.config.ts` (dynamic shortcut bridge, no Vite transformer),
`vite.config.ts` (`marko()` before `unocss()`), `src/routes/+layout.marko`
(`import "virtual:uno.css"`), `src/routes/_home/tags/home-cta-button/*` (inline
`:uno:` authoring). To see the stock-transformer failure from Finding 1, delete
`marko.json` and switch `uno.config.ts` back to `transformers: [transformerCompileClass()]`.
