import * as compiler from "@marko/compiler";
import * as translator from "marko-6_1_18/translator";
import runtimeDOM from "marko-6_1_18/dom?raw";
import runtimeHTML from "marko-6_1_18/html?raw";
import runtimeDebugDOM from "marko-6_1_18/debug/dom?raw";
import runtimeDebugHTML from "marko-6_1_18/debug/html?raw";

import type { MarkoToolchain } from "../marko-versions";

// Marko 6.1.18, installed via the `marko-6_1_18` npm alias. The runtime and
// translator come from that version's package; `@marko/compiler` is shared
// across 6.x versions (npm dedupes it to a release compatible with all of
// them), so importing it here resolves to the single bundled compiler.
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
