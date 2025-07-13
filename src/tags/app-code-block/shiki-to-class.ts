import type { ShikiTransformer } from "shiki";
interface ClassTransformer extends ShikiTransformer {
  getCSS(): string;
}
const transformerLookup = new WeakMap<WeakKey, ClassTransformer>();

export function getCSS(key: WeakKey) {
  return transformerLookup.get(key)?.getCSS();
}

export function toClass(key: WeakKey): ClassTransformer {
  let transformer = transformerLookup.get(key);
  if (transformer) return transformer;
  let css = "";
  const classNames = new Map<string, string>();
  const getClass = (value: unknown) => {
    const style = styleToStr(value);
    if (style) {
      let className = classNames.get(style);
      if (!className) {
        className = `s_${classNames.size.toString(36)}`;
        classNames.set(style, className);
        css += `.${className}{${style}}`;
      }
      return className;
    }
  };
  transformer = {
    pre(t) {
      const className = getClass(t.properties.style);
      if (className) {
        t.properties.style = undefined;
        this.addClassToHast(t, className);
      }
    },
    tokens(lines) {
      for (const line of lines) {
        for (const token of line) {
          const className = getClass(token.htmlStyle);
          if (className) {
            token.htmlStyle = undefined;
            token.htmlAttrs ||= {};
            if (token.htmlAttrs.class) {
              token.htmlAttrs.class += " " + className;
            } else {
              token.htmlAttrs.class = className;
            }
          }
        }
      }
    },
    getCSS() {
      const result = css;
      css = "";
      return result;
    },
  };
  transformerLookup.set(key, transformer);
  return transformer;
}

function styleToStr(value: unknown) {
  if (value) {
    if (typeof value === "object") {
      let style = "";
      let sep = "";

      if (Array.isArray(value)) {
        for (const item of value) {
          const str = styleToStr(item);
          if (str) {
            style += sep + styleToStr(item);
            sep = ";";
          }
        }
      } else {
        for (const key in value) {
          const str = styleToStr((value as Record<string, string>)[key]);
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
