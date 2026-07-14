# UnoCSS + compile-class exploration

Spike to evaluate migrating the site from SCSS + CSS Modules to
[UnoCSS](https://unocss.dev) with the
[compile-class transformer](https://unocss.dev/transformers/compile-class),
targeting two goals: **more maintainable styling** and **smaller CSS**.

> [!IMPORTANT]
> Two separate conclusions:
>
> 1. **compile-class is not a supported UnoCSS + Marko configuration** and breaks
>    the `@marko/run` build. This is a known class of failure for compile-class,
>    not a bug in our setup (see Finding 1).
> 2. UnoCSS **atomic** utilities _are_ officially supported with Marko and build
>    fine, but they do not reduce total bytes for this site (they grow the HTML,
>    which is the dominant payload). The current SCSS + design-token setup is
>    already close to optimal for a 211-page static site.
>
> Net recommendation: do not pursue this migration as framed.

## How this was tested

- `unocss@66.7.5` + `@unocss/transformer-compile-class`, wired into
  `vite.config.ts` (`unocss/vite`), config in `uno.config.ts`.
- The existing color design tokens (`src/styles/colors.scss`, which emit
  dark-mode-aware CSS custom properties) were mapped into the UnoCSS `theme` so
  utilities like `bg-section` / `text-red` resolve to those vars and keep the
  runtime theming.
- Baseline and converted builds measured with `NODE_ENV=production npm run build`.

Reproduce the blocker: put a `:uno:` class on any `.marko` element and build.

## Baseline (current setup)

| Asset | Raw | Gzip |
| --- | --- | --- |
| **CSS** (8 code-split chunks) | 95,822 B | 15,119 B |
| **HTML** (211 static pages) | 3,365,463 B | 244,023 B |

The single most important number here: **HTML gzip (244 KB) is ~16x the CSS gzip
(15 KB).** On this site CSS is not the dominant payload, and it is already
minified, code-split per route, and built on CSS-variable tokens rather than
repeated literals.

## Finding 1 — why compile-class breaks the Marko build

Authoring `class=":uno: flex gap-2 ..."` and building fails with 15 errors like:

```
[MISSING_EXPORT] "$setup3" is not exported by ".../home-cta-button.marko".
[MISSING_EXPORT] "$template3" is not exported by ".../home-cta-button.marko".
[MISSING_EXPORT] "$walks3" is not exported by ".../home-cta-button.marko".
```

This happens for **both** child-tag components and route entries (`+404.marko`).

### The mechanism (verified)

compile-class is a **source-rewriting Vite transformer**: it runs `enforce: "pre"`
in the `transform` phase and replaces a `:uno: ...` string with a content-hashed
class (`uno-mhb7vd`), expecting to edit template **markup** before the framework
compiles it. That assumption does not hold for Marko:

- `@marko/vite` compiles `.marko` to JS inside a Vite **`load`** hook
  (`node_modules/@marko/vite/dist/index.mjs`: the `/\.marko$/` load handler reads
  the file with `this.fs.readFile` and runs `@marko/compiler`). It also discovers
  child-tag dependencies by reading them **raw from disk** (`fs.readFileSync` in
  `scanFile`). No Vite `transform` hook ever sees `.marko` markup.
- Because `load` runs before `transform`, UnoCSS's compile-class transform runs on
  Marko's **already-compiled JavaScript**, not on markup. It finds the `:uno:`
  string embedded in the compiled output and rewrites it there, then calls
  `invalidate()`.
- In isolation that rewrite is harmless: I compiled the component both ways and the
  generated exports (`$template`, `$walks`, `$setup`) are **identical** regardless
  of the class string, and the rewrite only overwrites the string literal.
- The break appears in Marko's **linked** build, which compiles each template for
  two environments (server streaming-HTML and client DOM) and reconciles their
  generated export identifiers across a shared manifest (`generateBundle` in
  `@marko/vite`, using `cachedSources` and a `serverManifest`). A downstream
  transform that mutates and invalidates a compiled `.marko` module after that
  analysis breaks the coordination, so a parent's import of the child's
  cross-template bindings (`$setup3` / `$template3` / `$walks3`, suffixed per the
  linked graph) no longer resolves. Hence `MISSING_EXPORT`.

Control tests (same component, same structure):

| Class form on the element | Build |
| --- | --- |
| `styles.cta` (original CSS Module) | pass |
| `"cta"` (plain static string) | pass |
| `"home-cta"` (UnoCSS **shortcut**) | pass |
| `"relative overflow-hidden ..."` (atomic inline utilities) | pass |
| `":uno: relative overflow-hidden ..."` (**compile-class**) | fail, 15 errors |

The differentiator is not the final class string (the compile-class output
`uno-mhb7vd` is just as static as `"cta"`); it is the transform+invalidate step
acting on Marko's compiled, cross-linked modules.

### This is a known compile-class limitation, not our bug

UnoCSS's compile-class is documented as fragile with exactly this situation, a
compiler that re-reads or separately compiles the source, and the maintainers have
closed such reports as unsupported:

- Next.js (separate server/client compile): the `:uno:` groups are not compiled,
  [unocss/unocss#4507](https://github.com/unocss/unocss/issues/4507), closed **not
  planned**.
- Svelte: both plugins use `enforce: "pre"`; the Svelte plugin restores the file
  from its own cache and discards the rewrite,
  [unocss/unocss#1676](https://github.com/unocss/unocss/issues/1676).
- `@vitejs/plugin-react-swc` (SWC transforms first):
  [unocss/unocss#2653](https://github.com/unocss/unocss/issues/2653).
- The content-hash class name also causes duplicate-class errors on edit in dev,
  [unocss/unocss#4926](https://github.com/unocss/unocss/issues/4926).

Marko, with its separate server + client compiles and disk-based dependency
analysis, is the same category.

## Is UnoCSS supported with Marko at all? Yes, for atomic utilities

Marko is a first-class citizen for **atomic** UnoCSS:

- `.marko` is in UnoCSS's **default content pipeline**
  (`defaultPipelineInclude` includes `marko`), so class extraction works with no
  extra config.
- There is an official [`examples/marko-run`](https://github.com/unocss/unocss/tree/main/examples/marko-run)
  using `presetWind3` + `presetIcons` + `presetWebFonts` and **no transformers**.
- The [Vite integration docs](https://unocss.dev/integrations/vite) have a Marko
  section: order `@marko/vite` (or `@marko/run/vite`) **before** `UnoCSS()`.

Verified here: the atomic config (plugins ordered `marko()` then `unocss()`, no
compile-class transformer) builds green. So "is it supported properly" has a clear
answer: **atomic yes, compile-class no.**

## Finding 2 — size does not go down in any usable mode

**Single-class modes** (compile-class, or its Marko-compatible stand-in, named
`shortcuts`) fold every declaration into one class with no atomic sharing, so they
do not beat hand-written CSS. Measured on `home-cta-button`, compiled and minified:

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
component (`home-cta-button`, used 5x on the home page) to atomic inline utilities:

| Home page HTML | Bytes |
| --- | --- |
| Clean single class | 52,929 |
| Atomic inline | 55,707 (**+2,778 for one component**) |

That is one component on one page; the home page has ~12 components and there are
211 pages, all of which would carry the repeated utility strings. Trading 15 KB of
shared, cached CSS for added weight on every static page is a net loss in transfer.

## Finding 3 — where there _is_ a real (small) win

The Sass-generated utility modules emit every color and variant combination whether
used or not, which an on-demand engine would prune:

- `text.module.scss` — generates 25 classes, **8 used** (~68% dead). ~1.3 KB chunk.
- `section-colors.module.scss` — generates 5 `.xSection` classes, **2 used**.

Pruning this dead code is a genuine but small win (~1 to 1.5 KB raw, less after
gzip), and it does **not** require UnoCSS. The generators can simply be trimmed to
the used set.

## Finding 4 — scanning `.marko` produces spurious utilities

With `.marko` extraction on, ordinary words and identifiers in markup, prose, and
embedded JS get picked up as utilities. A single-component build already emitted
unused `.block`, `.hidden`, `.border`, `.table`, `.relative`, `.static`,
`.rounded`, `.px`, `.uppercase`, ... (~32 utility rules). Tunable (blocklist,
safelist, or a class-attribute-only extractor) but ongoing config maintenance.

## Recommendation

**Do not migrate to UnoCSS + compile-class.** It is not a supported configuration
and breaks the build; there is no config that fixes it (only heavy workarounds:
a filesystem pre-pass that mutates `.marko` source, or a custom `@marko/compiler`
plugin that applies the class transform during Marko's own compile so both the
server and client passes agree).

**The supported UnoCSS mode (atomic) does not meet the goals either:** CSS is not
the dominant payload, the current setup is already lean, and atomic grows the HTML
that dominates a 211-page static site.

If maintainability is the real driver, cheaper targeted moves that keep the current
pipeline:

1. Prune the unused generated classes in `text.module.scss` and
   `section-colors.module.scss` (Finding 3).
2. If inline utility authoring is genuinely wanted later, the only robust
   integration is a Marko-compiler-level transform (not a Vite transformer), which
   is a real project rather than a config change. Worth an upstream conversation
   with the Marko team before investing.

## Reproduction

```sh
npm install
NODE_ENV=production npm run build   # green: home-cta-button uses a shortcut

# reproduce the compile-class blocker:
#   edit any .marko element to  class=":uno: flex gap-2"  and rebuild
```

Files in this spike: `uno.config.ts`, `vite.config.ts` (unocss plugin),
`src/routes/+layout.marko` (`import "virtual:uno.css"`),
`src/routes/_home/tags/home-cta-button/*` (shortcut conversion). The committed POC
uses the shortcut form (Marko-compatible) so the build stays green; swap in a
`:uno:` class to reproduce Finding 1.
