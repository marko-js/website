/**
 * The color scheme the page is currently rendering with, accounting for the
 * `theme-light`/`theme-dark` override classes toggled by the theme-select tag
 * falling back to the OS preference.
 */
export function pageColorScheme(): "light" | "dark" {
  const classes = document.documentElement.classList;
  if (classes.contains("theme-dark")) return "dark";
  if (classes.contains("theme-light")) return "light";
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Invokes `handler` whenever the page's effective color scheme may have
 * changed, either from the OS preference changing or the theme override
 * classes on the root element being toggled.
 */
export function onPageColorSchemeChange(
  handler: () => void,
  signal: AbortSignal,
) {
  matchMedia("(prefers-color-scheme: dark)").addEventListener(
    "change",
    handler,
    { signal },
  );

  const observer = new MutationObserver(handler);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  signal.addEventListener("abort", () => observer.disconnect(), {
    once: true,
  });
}
