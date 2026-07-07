import fs from "fs/promises";
import path from "path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

interface Section {
  widget: string;
  accent: string;
}

const sections: Record<string, Section> = {
  introduction: { widget: "pixel", accent: "#FFD100" },
  tutorial: { widget: "button", accent: "#1FBF67" },
  guide: { widget: "button", accent: "#1FBF67" },
  reference: { widget: "doc", accent: "#008AE1" },
  explanation: { widget: "fetch", accent: "#7CED64" },
  "marko-run": { widget: "link", accent: "#FC5C00" },
  newsletter: { widget: "cookie", accent: "#FF5467" },
};

const fallbackSection: Section = { widget: "crash", accent: "#cccccc" };

const chevronStripe =
  "linear-gradient(90deg, #00CFFB 0%, #00CFFB 25%, #7CED64 25%, #7CED64 50%, #FFD100 50%, #FFD100 75%, #FF5467 75%, #FF5467 100%)";

interface Element {
  type: string;
  props: {
    style?: Record<string, string | number>;
    children?: Element | Element[] | string;
    [attr: string]: unknown;
  };
}

let assets:
  | Promise<{
      fonts: { name: string; data: Buffer; weight: 400 | 700 }[];
      logomark: string;
      logo: string;
    }>
  | undefined;

const assetPath = (...segments: string[]) =>
  path.join(process.cwd(), "public", "assets", ...segments);

const widgetPath = (section: string) =>
  assetPath(
    "widget",
    `${(sections[section] ?? fallbackSection).widget}-legs-dark.svg`,
  );

export function docsBannerSources(section: string) {
  return [assetPath("logomark.svg"), widgetPath(section)];
}

export function defaultBannerSources() {
  return [assetPath("logo-dark.svg")];
}

function loadAssets() {
  return (assets ??= (async () => {
    const fontDir = path.join(
      process.cwd(),
      "node_modules",
      "@fontsource",
      "ubuntu",
      "files",
    );
    const [regular, bold, mono, logomark, logo] = await Promise.all([
      fs.readFile(path.join(fontDir, "ubuntu-latin-400-normal.woff")),
      fs.readFile(path.join(fontDir, "ubuntu-latin-700-normal.woff")),
      fs.readFile(
        path.join(
          fontDir,
          "..",
          "..",
          "ubuntu-mono",
          "files",
          "ubuntu-mono-latin-700-normal.woff",
        ),
      ),
      fs.readFile(assetPath("logomark.svg")),
      fs.readFile(assetPath("logo-dark.svg")),
    ]);

    const toDataURI = (svg: Buffer) =>
      `data:image/svg+xml;base64,${svg.toString("base64")}`;

    return {
      fonts: [
        { name: "Ubuntu", data: regular, weight: 400 as const },
        { name: "Ubuntu", data: bold, weight: 700 as const },
        { name: "Ubuntu Mono", data: mono, weight: 700 as const },
      ],
      logomark: toDataURI(logomark),
      logo: toDataURI(logo),
    };
  })().catch((err) => {
    assets = undefined;
    throw err;
  }));
}

const widgetCache = new Map<string, Promise<string>>();

function loadWidget(section: string) {
  let widget = widgetCache.get(section);
  if (!widget) {
    widget = fs
      .readFile(widgetPath(section))
      .then((svg) => `data:image/svg+xml;base64,${svg.toString("base64")}`)
      .catch((err) => {
        widgetCache.delete(section);
        throw err;
      });
    widgetCache.set(section, widget);
  }
  return widget;
}

function frame(accent: string, content: Element[]): Element {
  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#202124",
        backgroundImage: `radial-gradient(circle at 85% -20%, ${accent}33 0%, #20212400 60%)`,
        fontFamily: "Ubuntu",
        color: "#ffffff",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              justifyContent: "space-between",
              padding: "72px 80px 64px",
            },
            children: content,
          },
        },
        {
          type: "div",
          props: {
            style: {
              height: 14,
              width: "100%",
              backgroundImage: chevronStripe,
            },
          },
        },
      ],
    },
  };
}

function docsBanner(
  title: string,
  section: string,
  logomark: string,
  widget: string,
): Element {
  const { accent } = sections[section] ?? fallbackSection;
  const label = section
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");

  return frame(accent, [
    {
      type: "div",
      props: {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        },
        children: [
          {
            type: "img",
            props: { src: logomark, width: 145, height: 80 },
          },
          {
            type: "img",
            props: { src: widget, width: 150, height: 225 },
          },
        ],
      },
    },
    {
      type: "div",
      props: {
        style: { display: "flex", flexDirection: "column" },
        children: [
          {
            type: "div",
            props: {
              style: {
                fontSize: 30,
                fontWeight: 700,
                letterSpacing: 6,
                textTransform: "uppercase",
                color: accent,
                marginBottom: 18,
              },
              children: label,
            },
          },
          {
            type: "div",
            props: {
              style: {
                fontSize: title.length > 60 ? 52 : title.length > 32 ? 64 : 84,
                fontWeight: 700,
                lineHeight: 1.12,
                letterSpacing: -1,
                maxWidth: 1000,
              },
              children: title,
            },
          },
        ],
      },
    },
    {
      type: "div",
      props: {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 28,
          color: "#cccccc",
        },
        children: [
          { type: "div", props: { children: "Marko Documentation" } },
          {
            type: "div",
            props: {
              style: { fontFamily: "Ubuntu Mono" },
              children: "markojs.com",
            },
          },
        ],
      },
    },
  ]);
}

function defaultBanner(logo: string): Element {
  return frame("#00CFFB", [
    { type: "div", props: { style: { display: "flex" } } },
    {
      type: "img",
      props: { src: logo, width: 560, height: 115 },
    },
    {
      type: "div",
      props: {
        style: {
          display: "flex",
          justifyContent: "flex-end",
          fontSize: 28,
          color: "#cccccc",
          fontFamily: "Ubuntu Mono",
        },
        children: "markojs.com",
      },
    },
  ]);
}

async function render(element: Element): Promise<Buffer> {
  const { fonts } = await loadAssets();
  const svg = await satori(element as never, {
    width: 1200,
    height: 630,
    fonts: fonts.map((font) => ({ ...font, style: "normal" as const })),
  });
  return new Resvg(svg, { fitTo: { mode: "width", value: 1200 } })
    .render()
    .asPng();
}

export async function renderDocsBanner(title: string, section: string) {
  const [{ logomark }, widget] = await Promise.all([
    loadAssets(),
    loadWidget(section),
  ]);
  return render(docsBanner(title, section, logomark, widget));
}

export async function renderDefaultBanner() {
  const { logo } = await loadAssets();
  return render(defaultBanner(logo));
}
