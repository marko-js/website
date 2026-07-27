/**
 * The playground bundles `@marko/compiler` for the browser, where terminal
 * colors are meaningless: marko strips ANSI from a `CompileError` message
 * anyway, and the playground renders the code frame itself.
 *
 * Beyond being unnecessary, kleur is actively broken in that bundle. It arrives
 * as a lazily-initialized CJS module whose initializer has not run by the time
 * the compiler formats an error, so `kleur.default.cyan` is undefined and every
 * compile error surfaces as `TypeError: cyan is not a function` in place of the
 * real diagnostic. Identity functions sidestep both problems, and drop kleur's
 * ANSI machinery from the client bundle.
 *
 * The compiler reaches these through `require("kleur")` wrapped in an interop
 * helper, which lands on either the module namespace or the default export
 * depending on how it is bundled, so both carry the full surface.
 */

/** Returns the chain when called bare, so `bold().red(s)` keeps working. */
const style = (text) => (text === undefined ? kleur : `${text}`);

const kleur = {
  enabled: false,
  reset: style,
  bold: style,
  dim: style,
  italic: style,
  underline: style,
  inverse: style,
  hidden: style,
  strikethrough: style,
  black: style,
  red: style,
  green: style,
  yellow: style,
  blue: style,
  magenta: style,
  cyan: style,
  white: style,
  gray: style,
  grey: style,
  bgBlack: style,
  bgRed: style,
  bgGreen: style,
  bgYellow: style,
  bgBlue: style,
  bgMagenta: style,
  bgCyan: style,
  bgWhite: style,
};

export const {
  reset,
  bold,
  dim,
  italic,
  underline,
  inverse,
  hidden,
  strikethrough,
  black,
  red,
  green,
  yellow,
  blue,
  magenta,
  cyan,
  white,
  gray,
  grey,
  bgBlack,
  bgRed,
  bgGreen,
  bgYellow,
  bgBlue,
  bgMagenta,
  bgCyan,
  bgWhite,
} = kleur;

export default kleur;
