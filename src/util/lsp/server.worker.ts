// Web Worker that runs the Marko language server in the browser. It assembles
// the language server's embedded services (`./server`) and hands them the
// worker scope and the seeded virtual-disk assets (TypeScript libs + Marko type
// definitions), gathered at build time by the `virtual:marko-lsp-assets` plugin.
import "./worker-error-report";

import { start } from "./server";
import assets from "virtual:marko-lsp-assets";

try {
  start(self, { assets });
} catch (err) {
  (self as unknown as { postMessage(m: unknown): void }).postMessage({
    type: "response",
    id: -1,
    error: `start failed: ${(err as Error)?.stack || err}`,
  });
}
