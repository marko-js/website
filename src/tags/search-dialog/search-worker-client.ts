import type { SearchHit } from "../../util/search-worker";

let worker: Worker | undefined;
let ready: Promise<void> | undefined;

function ensureWorker(): Promise<void> {
  if (ready) return ready;
  worker = new Worker(new URL("../../util/search-worker", import.meta.url), {
    type: "module",
  });
  ready = new Promise<void>((resolve, reject) => {
    function onMessage(e: MessageEvent) {
      if (e.data.type === "ready") {
        worker!.removeEventListener("message", onMessage);
        resolve();
      } else if (e.data.type === "init-error") {
        worker!.removeEventListener("message", onMessage);
        reject(new Error(e.data.error));
      }
    }
    worker!.addEventListener("message", onMessage);
  });
  worker.postMessage({ type: "init" });
  return ready;
}

/**
 * Start the worker and its index fetch before the first keystroke. Best effort:
 * a failed init is reported when `sendQuery` awaits the same promise.
 */
export function warmSearch(): void {
  ensureWorker().catch(() => {});
}

export async function sendQuery(q: string): Promise<SearchHit[]> {
  await ensureWorker();
  const result = new Promise<SearchHit[]>((resolve) => {
    worker!.addEventListener(
      "message",
      (e: MessageEvent) => {
        if (e.data.type === "results") resolve(e.data.results);
      },
      { once: true },
    );
  });
  worker!.postMessage({ type: "query", query: q });
  return result;
}
