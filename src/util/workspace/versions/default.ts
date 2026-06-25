import * as compiler from "@marko/compiler";
import * as translator from "marko/translator";
import runtimeDOM from "marko/dom?raw";
import runtimeHTML from "marko/html?raw";
import runtimeDebugDOM from "marko/debug/dom?raw";
import runtimeDebugHTML from "marko/debug/html?raw";

import type { MarkoToolchain } from "../marko-versions";

// The Marko version that ships with the website (see the `marko` dependency in
// package.json). It is bundled eagerly as its own chunk so the most common path
// loads exactly the same toolchain the site itself is built with.
const toolchain: MarkoToolchain = {
  compiler,
  translator,
  runtimeModules: {
    "marko/dom": runtimeDOM,
    "marko/html": runtimeHTML,
    "marko/debug/dom": runtimeDebugDOM,
    "marko/debug/html": runtimeDebugHTML,
  },
};

export default toolchain;
