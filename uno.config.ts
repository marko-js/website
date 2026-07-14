import { defineConfig, presetWind3, transformerCompileClass } from "unocss";

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
  // compile-class expands variant groups internally; the standalone variant-group
  // transformer is omitted because it would rewrite JS ternaries in .marko files.
  transformers: [transformerCompileClass()],
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
    // Named shortcut = single semantic class, authored as utilities, with NO
    // source rewrite (compatible with Marko's dual-pass compile, unlike :uno:).
    {
      "home-cta":
        "relative overflow-hidden inline-flex mt-6 rounded-[2rem] px-16 py-4 no-underline text-white bg-section text-[1.1rem] font-medium justify-center self-start justify-self-end w-full dark:text-foreground dark:bg-gradient-to-r dark:from-section-dark dark:to-section-light min-[30rem]:w-auto lg:px-[2.4rem] lg:py-[0.8rem] hover:after:content-empty hover:after:absolute hover:after:-top-1/2 hover:after:-left-1/4 hover:after:w-[150%] hover:after:h-[200%] hover:after:bg-[linear-gradient(-45deg,transparent,rgba(255,255,255,0.3),transparent)] hover:after:animate-shimmer",
    },
  ],
});
