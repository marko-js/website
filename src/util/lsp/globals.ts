// Minimal globals the Marko compiler and Babel expect from a Node environment.
// Imported for its side effects before anything that pulls in `@marko/compiler`,
// so `process.cwd()` and friends exist by the time that code evaluates. (Vite's
// `define` handles the static `process.env.*` reads; this covers the dynamic
// ones and the worker build, which does not get that `define`.)
const g = globalThis as unknown as {
  global?: unknown;
  process?: {
    browser?: boolean;
    platform?: string;
    env?: Record<string, string | undefined>;
    cwd?: () => string;
    argv?: string[];
    nextTick?: (cb: (...args: unknown[]) => void, ...args: unknown[]) => void;
  };
};

g.global ??= globalThis;

// `setImmediate` is used by the notification helper and a few dependencies;
// workers only have `setTimeout`.
const gi = globalThis as unknown as {
  setImmediate?: (
    cb: (...args: unknown[]) => void,
    ...args: unknown[]
  ) => unknown;
};
gi.setImmediate ??= (cb, ...args) => setTimeout(cb, 0, ...args);

// Env flags the Marko compiler / bundled Babel branch on (mirrors the website's
// client-side `define`, but at runtime since worker builds do not get it).
const env = { NODE_ENV: "production", BUNDLE: "true" };

if (!g.process) {
  g.process = {
    browser: true,
    platform: "browser",
    env,
    cwd: () => "/",
    argv: [],
    nextTick: (cb, ...args) => queueMicrotask(() => cb(...args)),
  };
} else {
  g.process.browser ??= true;
  g.process.env = { ...env, ...g.process.env };
  g.process.cwd ??= () => "/";
  g.process.nextTick ??= (cb, ...args) => queueMicrotask(() => cb(...args));
}

export {};
