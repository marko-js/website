import { defineConfig, presetWind3 } from "unocss";

// Populated by uno-marko/transform.cjs during Marko's compile: class -> utilities.
const unoMarkoStore: Map<string, string> = ((globalThis as any)
  .__UNO_MARKO_STORE__ ||= new Map());

// The design tokens in `src/styles/colors.scss` emit CSS custom properties that
// already flip for dark mode. Mapping them into the theme lets utilities like
// `text-red` or `bg-section` resolve to those vars, so most components need no
// explicit dark: variants: the token adapts on its own.
const COLOR_NAMES = ["red", "green", "blue", "yellow", "gray"];
const COLOR_SUFFIXES: [string, string][] = [
  ["DEFAULT", ""],
  ["alt", "-alt"],
  ["light", "-light"],
  ["dark", "-dark"],
  ["dim", "-dim"],
  ["dim-alt", "-dim-alt"],
  ["alt-dim", "-alt-dim"],
  ["alt-dim-alt", "-alt-dim-alt"],
  ["light-tint", "-light-tint"],
  ["light-shade", "-light-shade"],
  ["dark-tint", "-dark-tint"],
  ["dark-shade", "-dark-shade"],
];

function tokenColor(base: string) {
  return Object.fromEntries(
    COLOR_SUFFIXES.map(([key, suffix]) => [key, `var(--${base}${suffix})`]),
  );
}

const colors: Record<string, unknown> = {
  foreground: "var(--color-foreground)",
  background: "var(--color-background)",
  black: "var(--color-black)",
  white: "var(--color-white)",
  section: tokenColor("section-color"),
};
for (const name of COLOR_NAMES) {
  colors[name] = tokenColor(`color-${name}`);
}

export default defineConfig({
  // The site ships its own reset in +layout.style.scss, so UnoCSS preflight is
  // disabled to measure only the utility cost against the SCSS it replaces.
  presets: [presetWind3({ dark: "media", preflight: false })],
  // The `:uno:` -> `uno-<hash>` substitution happens inside Marko's compiler
  // (uno-marko/transform.cjs, registered via marko.json), not as a Vite transformer,
  // so both the module compile and Marko's disk-read dependency pass stay in sync.
  transformers: [],
  content: {
    pipeline: {
      include: [/\.marko($|\?)/],
      exclude: [/node_modules/, /\.(css|scss)($|\?)/],
    },
  },
  theme: {
    colors,
    animation: {
      keyframes: {
        shimmer:
          "{from{transform:translateX(-100%)}50%,to{transform:translateX(100%)}}",
      },
      durations: { shimmer: "2s" },
      counts: { shimmer: "infinite" },
    },
  },
  shortcuts: [
    // Replaces the generated `.<name>Gradient` classes from text.module.scss.
    [
      /^text-gradient-(.+)$/,
      ([, c]) =>
        `text-transparent bg-clip-text bg-gradient-to-r from-${c}-dark to-${c}-light`,
    ],
    // Resolve the compiled `uno-<hash>` classes (produced by the Marko compile-time
    // transform) back to their utilities, so UnoCSS generates the CSS for each one.
    [/^uno-[0-9a-z]+$/, ([name]) => unoMarkoStore.get(name)],
  ],
});
