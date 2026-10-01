import { createHash } from "crypto";
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
// Compact link previews (Slack, iMessage) crop to the centered square.
const CROP_SIZE = HEIGHT;
const CROP_INSET = (WIDTH - CROP_SIZE) / 2;
const COLUMN_PADDING = 44;
const COLUMN_WIDTH = CROP_SIZE - COLUMN_PADDING * 2;

// The outer colors stop at the crop's edges, or it would show slivers of them.
const chevronStripe = `linear-gradient(90deg, #00CFFB ${CROP_INSET}px, #7CED64 ${CROP_INSET}px, #7CED64 50%, #FFD100 50%, #FFD100 ${WIDTH - CROP_INSET}px, #FF5467 ${WIDTH - CROP_INSET}px)`;

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
      fonts: { name: string; data: Buffer; weight: 700 }[];
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
    const [bold, mono, logomark, logo] = await Promise.all([
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

const domain: Element = {
  type: "div",
  props: {
    style: { fontSize: 28, color: "#cccccc", fontFamily: "Ubuntu Mono" },
    children: "markojs.com",
  },
};

function frame(
  accent: string,
  content: Element[],
  overlays: Element[] = [],
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
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              width: CROP_SIZE,
              padding: `24px ${COLUMN_PADDING}px 48px`,
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
        ...overlays,
      ],
    },
  };
}

const titleSizes = [
  { size: 64, lines: 2 },
  { size: 56, lines: 3 },
];

function titleSize(title: string) {
  const longestWord = Math.max(...title.split(" ").map((word) => word.length));
  return (
    titleSizes.find(({ size, lines }) => {
      // Ubuntu Bold averages about 0.56em per character.
      const perLine = Math.floor(COLUMN_WIDTH / (size * 0.56));
      return longestWord <= perLine && title.length <= perLine * lines;
    })?.size ?? 48
  );
}

// 3 to 6 degrees either way, like the legless widgets elsewhere on the site.
function widgetTilt(title: string) {
  const [magnitude, direction] = createHash("sha1").update(title).digest();
  return (3 + (magnitude % 4)) * (direction % 2 ? 1 : -1);
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
            // satori's balance shrinks a lone word's box, pushing it off center.
            textWrap: title.includes(" ") ? "balance" : "wrap",
          },
          children: title,
        },
      },
    ],
    [
      {
        type: "div",
        props: {
          style: {
            position: "absolute",
            top: 48,
            left: 56,
            right: 56,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          },
          children: [
            domain,
            {
              type: "img",
              props: { src: logomark, width: 200, height: 110 },
            },
          ],
        },
      },
    ],
  );
}

function defaultBanner(logo: string, suffix?: string): Element {
  return frame(
    "#00CFFB",
    [
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
                  marginTop: 72,
                },
                children: suffix,
              },
            },
          ]
        : []),
    ],
    [
      {
        type: "div",
        props: {
          style: {
            position: "absolute",
            bottom: STRIPE + 48,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
          },
          children: domain,
        },
      },
    ],
  );
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
