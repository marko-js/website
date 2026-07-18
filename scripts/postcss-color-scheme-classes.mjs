/**
 * PostCSS plugin that makes every `prefers-color-scheme` media query
 * overridable by a `theme-light`/`theme-dark` class on the root element.
 *
 * Each scheme media query is processed in two steps:
 *
 * 1. The original media query's selectors are guarded so the styles stop
 *    applying when the opposite theme is forced:
 *      @media (prefers-color-scheme: dark) { .foo { … } }
 *    becomes
 *      @media (prefers-color-scheme: dark) {
 *        :where(:root:not(.theme-light)) .foo { … }
 *      }
 *
 * 2. A copy of the rules is emitted keyed off the forced theme class (with
 *    the scheme condition removed, keeping any other media conditions):
 *      :where(:root.theme-dark) .foo { … }
 *
 * `:where()` keeps the specificity of every transformed selector unchanged,
 * so cascade order between existing rules is preserved. When the source file
 * is a CSS module the injected theme classes are wrapped in `:global()` so
 * they are not hashed by CSS modules processing (which runs after this
 * plugin in Vite's pipeline).
 */
const SCHEME_RE = /\(\s*prefers-color-scheme\s*:\s*(dark|light)\s*\)/i;
const ROOT_RE = /^(?::root|html|body)(?![\w-])/i;

const plugin = () => ({
  postcssPlugin: "postcss-color-scheme-classes",
  Once(root, { result }) {
    const from = (result.opts.from || "").split("?")[0];
    const isModule = /\.module\.[^/\\]*$/.test(from);
    const global = (sel) => (isModule ? `:global(${sel})` : sel);

    root.walkAtRules("media", (atRule) => {
      const match = SCHEME_RE.exec(atRule.params);
      if (!match) return;
      if (atRule.params.includes(",")) {
        throw atRule.error(
          "Media query lists with prefers-color-scheme are not supported",
        );
      }

      const scheme = match[1].toLowerCase();
      const forced = `.theme-${scheme}`;
      const opposite = scheme === "dark" ? ".theme-light" : ".theme-dark";

      // Copy the rules for the forced theme class, dropping the scheme
      // condition but keeping any other media conditions.
      const copy = atRule.clone();
      guard(
        copy,
        `:where(${global(forced)})`,
        `:where(:root${global(forced)})`,
      );
      const params = copy.params
        .split(/\s+and\s+/i)
        .filter((part) => !SCHEME_RE.test(part))
        .join(" and ");

      if (params) {
        copy.params = params;
        atRule.after(copy);
      } else {
        atRule.after(copy.nodes);
      }

      // Guard the original media query against the opposite forced theme.
      guard(
        atRule,
        `:where(:not(${global(opposite)}))`,
        `:where(:root:not(${global(opposite)}))`,
      );
    });

    /**
     * Prefixes every style rule in the container with the ancestor guard, or
     * appends the attached guard when the selector already targets the root.
     */
    function guard(container, attached, ancestor) {
      container.walkRules((rule) => {
        if (inKeyframes(rule)) return;
        rule.selectors = rule.selectors.map((selector) => {
          const trimmed = selector.trim();
          const rootMatch = ROOT_RE.exec(trimmed);
          return rootMatch
            ? rootMatch[0] + attached + trimmed.slice(rootMatch[0].length)
            : `${ancestor} ${trimmed}`;
        });
      });
    }

    function inKeyframes(rule) {
      for (let node = rule.parent; node; node = node.parent) {
        if (node.type === "atrule" && /keyframes$/i.test(node.name)) {
          return true;
        }
      }
      return false;
    }
  },
});

plugin.postcss = true;

export default plugin;
