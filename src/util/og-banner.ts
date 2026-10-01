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

const WIDTH = 1200;
const HEIGHT = 630;
const STRIPE = 14;
// Compact link previews (Slack, iMessage, WhatsApp) crop the banner to its
// centered square. The widget, section and title sit in a column of that width
// and survive the crop. The logo and domain sit in the margins beside it.
const COLUMN_PADDING = 44;
const COLUMN_WIDTH = HEIGHT - COLUMN_PADDING * 2;
const MARGIN = (WIDTH - HEIGHT) / 2;
const FOOTER = 48;

// The outer colors end where the crop begins, so it never shows a sliver.
const chevronStripe = `linear-gradient(90deg, #00CFFB ${MARGIN}px, #7CED64 ${MARGIN}px, #7CED64 50%, #FFD100 50%, #FFD100 ${WIDTH - MARGIN}px, #FF5467 ${WIDTH - MARGIN}px)`;

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
    `${(sections[section] ?? fallbackSection).widget}-dark.svg`,
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

function frame(
  accent: string,
  content: Element[],
  asides: Element[] = [],
): Element {
  return {
    type: "div",
    props: {
      style: {
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
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
              alignItems: "center",
              textAlign: "center",
              width: HEIGHT,
              padding: `24px ${COLUMN_PADDING}px ${FOOTER}px`,
            },
            children: content,
          },
        },
        {
          type: "div",
          props: {
            style: {
              height: STRIPE,
              width: "100%",
              flexShrink: 0,
              backgroundImage: chevronStripe,
            },
          },
        },
        ...asides,
      ],
    },
  };
}

// The largest size that keeps the longest word on one line and the title to
// two lines, or three below 64px. Ubuntu Bold averages about 0.56em per
// character.
function titleSize(title: string) {
  const longestWord = Math.max(
    ...title.split(/\s+/).map((word) => word.length),
  );
  return (
    [64, 56].find((size) => {
      const perLine = Math.floor(COLUMN_WIDTH / (size * 0.56));
      return (
        longestWord <= perLine && title.length <= perLine * (size > 56 ? 2 : 3)
      );
    }) ?? 48
  );
}

// Widgets drawn without legs sit at a slight tilt across the site, 3 to 6
// degrees either way. Hashing the title keeps a page's tilt stable.
function widgetTilt(title: string) {
  // FNV-1a, read from the top bits since the low ones barely mix.
  let hash = 0x811c9dc5;
  for (let i = 0; i < title.length; i++) {
    hash = Math.imul(hash ^ title.charCodeAt(i), 0x01000193);
  }
  const step = hash >>> 29;
  return ((step % 4) + 3) * (step < 4 ? 1 : -1);
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

  return frame(
    accent,
    [
      {
        type: "div",
        props: {
          style: {
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
          },
          children: [
            {
              type: "img",
              props: {
                src: widget,
                width: 280,
                height: 280,
                style: { transform: `rotate(${widgetTilt(title)}deg)` },
              },
            },
            {
              type: "div",
              props: {
                style: {
                  fontSize: 30,
                  fontWeight: 700,
                  letterSpacing: 6,
                  textTransform: "uppercase",
                  color: accent,
                  marginTop: 4,
                  marginBottom: 18,
                },
                children: label,
              },
            },
            {
              type: "div",
              props: {
                style: {
                  fontSize: titleSize(title),
                  fontWeight: 700,
                  lineHeight: 1.12,
                  letterSpacing: -1,
                  maxWidth: COLUMN_WIDTH,
                  // satori balances a lone word into a box narrower than the
                  // word, which pushes it off center.
                  textWrap: title.includes(" ") ? "balance" : "wrap",
                },
                children: title,
              },
            },
          ],
        },
      },
    ],
    [
      {
        type: "img",
        props: {
          src: logomark,
          width: 200,
          height: 110,
          style: { position: "absolute", left: 56, top: 56 },
        },
      },
      {
        type: "div",
        props: {
          style: {
            position: "absolute",
            right: 72,
            bottom: STRIPE + FOOTER,
            fontSize: 28,
            color: "#cccccc",
            fontFamily: "Ubuntu Mono",
          },
          children: "markojs.com",
        },
      },
    ],
  );
}

function defaultBanner(logo: string, suffix?: string): Element {
  return frame("#00CFFB", [
    { type: "div", props: { style: { display: "flex" } } },
    {
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 72,
        },
        children: [
          {
            type: "img",
            props: { src: logo, width: 500, height: 103 },
          },
          ...(suffix
            ? [
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: 84,
                      fontWeight: 700,
                      lineHeight: 1,
                    },
                    children: suffix,
                  },
                },
              ]
            : []),
        ],
      },
    },
    {
      type: "div",
      props: {
        style: { fontSize: 28, color: "#cccccc", fontFamily: "Ubuntu Mono" },
        children: "markojs.com",
      },
    },
  ]);
}

async function render(element: Element): Promise<Buffer> {
  const { fonts } = await loadAssets();
  const svg = await satori(element as never, {
    width: WIDTH,
    height: HEIGHT,
    fonts: fonts.map((font) => ({ ...font, style: "normal" as const })),
  });
  return new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } })
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

export async function renderDefaultBanner(suffix?: string) {
  const { logo } = await loadAssets();
  return render(defaultBanner(logo, suffix));
}
