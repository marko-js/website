// Prettier and its plugins are a sixth of the playground's bundle, and nothing
// needs them until the editor's format command runs, so they are fetched on
// first use rather than shipped with the page.
const parsers: Record<string, string> = {
  marko: "marko",
  js: "babel",
  jsx: "babel",
  mjs: "babel",
  cjs: "babel",
  ts: "babel-ts",
  tsx: "babel-ts",
  json: "json",
  css: "css",
};

export function formatCode(content: string, cursorOffset: number, ext: string) {
  const parser = parsers[ext];
  if (!parser) return;
  return formatStable(content, cursorOffset, parser);
}

async function formatStable(
  content: string,
  cursorOffset: number,
  parser: string,
) {
  const { format, formatWithCursor, options } = await load(parser);
  const [withCursor, formatted] = await Promise.all([
    formatWithCursor(content, { ...options, cursorOffset }),
    format(content, options),
  ]);
  return withCursor.formatted === formatted
    ? withCursor
    : { formatted, cursorOffset: withCursor.cursorOffset };
}

async function load(parser: string) {
  const [{ format, formatWithCursor }, babel, estree, postcss, marko] =
    await Promise.all([
      import("prettier/standalone"),
      import("prettier/plugins/babel"),
      import("prettier/plugins/estree"),
      import("prettier/plugins/postcss"),
      import("prettier-plugin-marko"),
    ]);

  // Marko embeds js/ts/css, so those plugins come along for the embedded code.
  const plugins =
    parser === "marko"
      ? [marko, babel.default, estree.default, postcss.default]
      : parser === "css"
        ? [postcss.default]
        : [babel.default, estree.default];

  return { format, formatWithCursor, options: { parser, plugins } };
}
