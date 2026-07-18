import postcssImport from "postcss-import";
import autoprefixer from "autoprefixer";
import postcssPresetEnv from "postcss-preset-env";
import darkThemeClass from "postcss-dark-theme-class";

// Rewrites `prefers-color-scheme` media queries so the theme-light/theme-dark
// classes toggled on <html> by the theme-select tag override the OS
// preference. This runs before Vite's CSS modules pass, which would hash the
// theme class names, so files compiled as modules get the selectors wrapped
// in :global().
const themeClasses = () => ({
  postcssPlugin: "theme-classes",
  prepare(result) {
    const from = (result.opts.from || "").split("?")[0];
    const global = /\.module\.[^/\\]*$/.test(from)
      ? (selector) => `:global(${selector})`
      : (selector) => selector;
    return darkThemeClass({
      darkSelector: global(".theme-dark"),
      lightSelector: global(".theme-light"),
    });
  },
});

export default {
  plugins: [
    postcssImport(),
    themeClasses(),
    autoprefixer(),
    postcssPresetEnv(),
  ],
};
