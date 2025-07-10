const classNames = new Map<string, string>();
let styleEl: HTMLStyleElement | undefined;

export function styleToClass(value: unknown) {
  const style = normalizeStyle(value);
  if (style) {
    let className = classNames.get(style);
    if (!className) {
      if (!styleEl) {
        styleEl = document.createElement("style");
        document.head.appendChild(styleEl);
      }

      className = `s_${classNames.size.toString(36)}`;
      classNames.set(style, className);
      styleEl.textContent += `.${className}{${style}}`;
    }

    return className;
  }
}

function normalizeStyle(value: unknown) {
  if (value) {
    if (typeof value === "object") {
      let style = "";
      let sep = "";

      if (Array.isArray(value)) {
        for (const item of value) {
          const str = normalizeStyle(item);
          if (str) {
            style += sep + normalizeStyle(item);
            sep = ";";
          }
        }
      } else {
        for (const key in value) {
          const str = normalizeStyle((value as Record<string, string>)[key]);
          if (str) {
            style += sep + key + ":" + str;
            sep = ";";
          }
        }
      }

      return style;
    } else {
      return "" + value;
    }
  }
}
