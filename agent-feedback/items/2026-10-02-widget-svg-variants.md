---
type: dx
impact: med
effort: low
site: public/assets/widget › <name>-light.svg, <name>-dark.svg
---

# Generate the widget light and dark SVGs from the adaptive files

Each mascot ships six SVGs, and the four `-light`/`-dark` files are hand-kept derivations of `<name>.svg` and `<name>-legs.svg`: drop `id="dark"` from the root, drop the `--f` `<style>`, and replace `var(--f)` with the `:root` value (for `-dark`) or the `prefers-color-scheme: light` value (for `-light`). Every art or animation edit must be repeated in four more files, and nothing catches a missed copy. A script under `scripts/` that writes the variants, plus a vitest that fails when a committed variant differs from its derivation, would stop the drift. The same script could render the PNG exports with `@resvg/resvg-js`, which is already a dependency.

Check: apply that derivation to each adaptive file and compare with the committed variant after collapsing whitespace and normalising `/>` spacing; all 36 match.
