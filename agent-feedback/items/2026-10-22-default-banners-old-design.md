---
type: cleanup
impact: low
effort: med
site: src/util/og-banner.ts › defaultBanner
---

# Restyle the default and playground banners to match the docs banners

`docsBanner` renders the standing-widget layout (rule along the bottom, a faint logo watermark behind it). `defaultBanner`, used for `/og/default.png` and `/og/playground.png`, still goes through `frame()`: a top-right radial gradient, a four-color chevron stripe, and a centered wordmark. The two sets of previews now look unrelated, and `frame()`, `chevronStripe` and the `STRIPE` and `COLUMN_PADDING` constants exist only for the default banner. Either restyle it on the docs layout (wordmark where the title goes, a widget on the rule) and delete `frame()`, or decide the difference is intended and comment it at `defaultBanner`.

Check: `pnpm run build`, then compare `dist/public/og/default.png` with any `dist/public/og/docs/**/*.png`.
