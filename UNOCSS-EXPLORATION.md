# UnoCSS + compile-class exploration

Spike to evaluate migrating the site from SCSS + CSS Modules to
[UnoCSS](https://unocss.dev) with the
[compile-class transformer](https://unocss.dev/transformers/compile-class),
targeting two goals: **more maintainable styling** and **smaller CSS**.

> [!IMPORTANT]
> Headline result: the compile-class transformer **cannot be used with the
> `@marko/run` build** (it breaks compilation), and none of the UnoCSS modes
> that _do_ work reduce total bytes for this site. The current SCSS + design-token
> setup is already close to optimal for a 211-page static site. Recommendation is
> to **not** pursue this migration as framed. Details and evidence below.

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

## Finding 1 — compile-class breaks the Marko build (hard blocker)

Authoring `class=":uno: flex gap-2 ..."` and building fails with 15 errors like:

```
[MISSING_EXPORT] "$setup3" is not exported by ".../home-cta-button.marko".
[MISSING_EXPORT] "$template3" is not exported by ".../home-cta-button.marko".
[MISSING_EXPORT] "$walks3" is not exported by ".../home-cta-button.marko".
```

This happens for **both** child-tag components and route entries (`+404.marko`),
so it is not a niche case.

Root cause: compile-class is a **source-rewriting Vite transformer**. It runs
`enforce: "pre"` and replaces the `:uno: ...` string in the `.marko` source with
a hashed class (`uno-mhb7vd`) before Marko compiles. But Marko and `@marko/run`
build each `.marko` through **two passes that must see identical source**:

1. The module itself, compiled through Vite (sees the UnoCSS-rewritten source).
2. Cross-template linking. Marko reads referenced `.marko` files **directly from
   disk**, bypassing Vite (confirmed: the translator's `getStyleFile` scans the
   component directory on disk). This pass sees the **raw** `:uno:` source.

Marko emits content-coordinated resumability bindings (`$setup`, `$template`,
`$walks`) for composition. Because the two passes see different source, the
bindings the importer expects do not match the ones the rewritten module
exports, and the link fails.

Control tests (same component, same structure):

| Class form on the element | Build |
| --- | --- |
| `styles.cta` (original CSS Module) | pass |
| `"cta"` (plain static string) | pass |
| `"home-cta"` (UnoCSS **shortcut**, see below) | pass |
| `":uno: relative overflow-hidden ..."` (**compile-class**) | fail, 15 errors |

The only thing that changed between a passing and failing build is that
compile-class rewrites the file mid-build. Workarounds all require either a
filesystem pre-pass that mutates `.marko` source (breaks HMR and dev ergonomics)
or moving the transform inside the Marko compiler itself (a custom integration,
not the stock transformer). Neither is "use the compile-class transformer".

## Finding 2 — the Marko-compatible modes, and their trade-offs

UnoCSS still works with Marko as long as the class string on disk is the class
string Marko compiles (no rewrite):

- **Atomic inline** — `class="relative overflow-hidden inline-flex ..."` directly
  in the template. Co-located, but puts many classes in the markup, and complex
  selectors (`:has`, `> input`, `::before` background images, keyframes) need
  verbose arbitrary variants (`[&>input]:hidden`, `hover:after:...`). For those
  cases it is arguably _less_ readable than the SCSS it replaces.
- **Named shortcuts** — define the utility group in `uno.config.ts`
  (`{ "home-cta": "relative overflow-hidden ..." }`) and reference `"home-cta"`
  in the template. Produces one clean semantic class (the compile-class outcome),
  keeps the markup clean, and builds fine. But it moves style definitions _out_
  of the component and into a central config, which is a different maintainability
  trade-off than co-located `.module.scss`, not an obvious win.

`home-cta-button` in this branch is converted to the **shortcut** form as a
working proof that this path builds green (including its `:hover::after` shimmer
and `@keyframes`, expressed via the UnoCSS `theme.animation`).

## Finding 3 — size does not go down

The single-class model (shortcut, and by extension what compile-class _would_
produce) folds every declaration into one class with no atomic cross-element
sharing, so it does not beat hand-written CSS. Measured on `home-cta-button`,
compiled and minified both ways:

| | Bytes (min) |
| --- | --- |
| Original SCSS `.cta` (base + dark + 2 breakpoints + shimmer) | **854** |
| UnoCSS `.home-cta` (same states) | **1,715** (~2x) |

Net effect of wiring UnoCSS in and converting that one component:

| | Raw | Gzip |
| --- | --- | --- |
| Total CSS delta | **+1,790 B** | **+363 B** |

Why bigger, not smaller:

- UnoCSS's generic utility output is more verbose than purpose-written CSS. The
  gradient alone expands to a `--un-gradient-from / -to / -stops / -shape` var
  cascade (~300 B) versus a ~90 B hand-written `linear-gradient(...)`.
- No atomic sharing in single-class mode, so nothing is reclaimed.
- The current SCSS already factors color and theme through CSS variables, so
  there is little duplication left for a utility engine to remove.

The only mode that _would_ shrink CSS is **pure atomic** (many shared utility
classes). But that moves bytes from CSS into the markup, and on this site the
markup is the payload that matters: HTML is **16x** the CSS after gzip and is
repeated across **211** statically rendered pages. Trading 15 KB of shared,
cached CSS for added weight on every page is a net loss in total transfer.

## Finding 4 — where there _is_ a real (small) win

The Sass-generated utility modules emit every color and variant combination
whether used or not, which an on-demand engine would prune:

- `text.module.scss` — generates 25 classes, **8 used** (~68% dead). ~1.3 KB chunk.
- `section-colors.module.scss` — generates 5 `.xSection` classes, **2 used**.

Pruning this dead code is a genuine but small win (~1 to 1.5 KB raw, less after
gzip), and it does **not** require UnoCSS. The same generators could be trimmed to
the used set, or these two files could move to on-demand utilities specifically,
independent of any broader migration.

## Finding 5 — scanning `.marko` produces spurious utilities

With `.marko` in the UnoCSS content pipeline, ordinary words and identifiers in
markup, prose, and embedded JS get extracted as utilities. A single-component
build already emitted unused `.block`, `.hidden`, `.border`, `.table`,
`.relative`, `.static`, `.rounded`, `.px`, `.uppercase`, ... (~32 utility rules).
This is tunable (blocklist, safelist, or a class-attribute-only extractor) but is
ongoing config maintenance, and it partly offsets Finding 4's savings.

## Recommendation

**Do not migrate to UnoCSS + compile-class as framed.**

- Goal "smaller CSS" is unlikely to be met: CSS is not the dominant payload, the
  current setup is already lean, and the compatible UnoCSS modes either grow CSS
  (single-class) or grow the dominant HTML (atomic).
- Goal "more maintainable" is not clearly advanced either: compile-class (the
  ergonomic inline mode) is blocked by the Marko build, atomic inline is verbose
  for this site's selector patterns, and shortcuts re-centralize what is currently
  co-located.

If maintainability is the real driver, cheaper targeted moves that keep the
current pipeline:

1. Prune the unused generated classes in `text.module.scss` and
   `section-colors.module.scss` (Finding 4).
2. Consider a Marko-compiler-level utility transform (not the Vite transformer) if
   inline utility authoring is desired later; that is the only integration that
   would sidestep Finding 1, and it is a real project, not a config change.

## Reproduction

```sh
npm install
NODE_ENV=production npm run build   # green: home-cta-button uses a shortcut

# reproduce the compile-class blocker:
#   edit any .marko element to  class=":uno: flex gap-2"  and rebuild
```

Files in this spike: `uno.config.ts`, `vite.config.ts` (unocss plugin),
`src/routes/+layout.marko` (`import "virtual:uno.css"`),
`src/routes/_home/tags/home-cta-button/*` (shortcut conversion).
