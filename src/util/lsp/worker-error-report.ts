// Registers worker-global error handlers before the language server modules
// evaluate, so an import-time or async crash is reported to the client instead
// of silently killing the worker. Imported first by `server.worker.ts`.
const report = (error: string) =>
  (self as unknown as { postMessage(m: unknown): void }).postMessage({
    type: "response",
    id: -1,
    error,
  });

self.addEventListener("error", (event) => {
  report(
    `worker error: ${event.message} @ ${event.filename}:${event.lineno}:${event.colno}`,
  );
});

self.addEventListener("unhandledrejection", (event) => {
  const reason = (event as PromiseRejectionEvent).reason;
  report(`worker rejection: ${reason?.stack || reason?.message || reason}`);
});

export {};
