import postcssImport from "postcss-import";
import autoprefixer from "autoprefixer";
import postcssPresetEnv from "postcss-preset-env";
import colorSchemeClasses from "./scripts/postcss-color-scheme-classes.mjs";

export default {
  plugins: [
    postcssImport(),
    // Makes every `prefers-color-scheme` media query overridable by the
    // `theme-light`/`theme-dark` classes toggled on `<html>` (see theme-select).
    colorSchemeClasses(),
    autoprefixer(),
    postcssPresetEnv(),
  ],
};
