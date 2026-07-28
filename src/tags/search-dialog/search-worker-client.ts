import type { SearchHit } from "../../util/search-worker";

let worker: Worker | undefined;
let ready: Promise<void> | undefined;
let lastQueryId = 0;
/** Resolvers keyed by request id, so a reply only settles the query it answers. */
const pending = new Map<number, (hits: SearchHit[]) => void>();

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
  worker.addEventListener("message", (e: MessageEvent) => {
    if (e.data?.type !== "results") return;
    const resolve = pending.get(e.data.id);
    if (resolve) {
      pending.delete(e.data.id);
      resolve(e.data.results);
    }
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
  const id = ++lastQueryId;
  const result = new Promise<SearchHit[]>((resolve) => {
    pending.set(id, resolve);
  });
  worker!.postMessage({ type: "query", query: q, id });
  return result;
}
