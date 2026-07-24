import type { File } from "./workspace";

// Connects lesson checkpoints (rendered inside compiled markdown content) to
// the learn layout's workspace without threading props through the page tree.
type Handler = (files: File[]) => void;
let handler: Handler | undefined;
let queued: File[] | undefined;

export function loadFiles(files: File[]) {
  if (handler) {
    handler(files);
  } else {
    // A checkpoint's auto-load can run before the layout subscribes.
    queued = files;
  }
}

export function onLoadFiles(fn: Handler, signal: AbortSignal) {
  handler = fn;
  if (queued) {
    fn(queued);
    queued = undefined;
  }
  signal.addEventListener(
    "abort",
    () => {
      if (handler === fn) handler = undefined;
    },
    { once: true },
  );
}
