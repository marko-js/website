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

// Where a standing widget's body and feet sit inside its 480x720 SVG, so its
// feet land on the rule and it can face the title.
interface Stance {
  feet: number; // lowest pixel, of 720
  body: [number, number]; // horizontal extent, of 480
  faces: "left" | "right" | "front";
  drop?: number; // extra drop, as a fraction of the width, for uneven feet
}

const stances: Record<string, Stance> = {
  button: { feet: 679, body: [66, 403], faces: "right" },
  doc: { feet: 692, body: [89, 466], faces: "left", drop: 0.022 },
  link: { feet: 679, body: [31, 466], faces: "right" },
  fetch: { feet: 679, body: [13, 390], faces: "left" },
  cookie: { feet: 710, body: [87, 436], faces: "left" },
  pixel: { feet: 679, body: [100, 379], faces: "front" },
  crash: { feet: 679, body: [78, 401], faces: "front" },
};

const WIDTH = 1200;
const HEIGHT = 630;
const STRIPE = 14;
// Compact link previews (Slack, iMessage) crop to the centered square.
const CROP_SIZE = HEIGHT;
const CROP_INSET = (WIDTH - CROP_SIZE) / 2;
const COLUMN_PADDING = 44;

// Docs banners: everything that matters sits in the square, standing on a rule
// along the bottom edge, and the margins only hold the logo.
const RULE = STRIPE;
const FLOOR = HEIGHT - RULE;
const WIDGET_WIDTH = 250;
const WIDGET_INSET = 28;
const TITLE_INSET = 34;
const TITLE_WIDTH = CROP_SIZE - TITLE_INSET * 2;
const TAB_HEIGHT = 58;
const LOGO_WIDTH = 140;
const LOGO_HEIGHT = (LOGO_WIDTH * 110) / 200;
const LOGO_GAP = 18;

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

// Largest first: the first tier whose wrap fits its line budget wins, so titles
// land on a handful of sizes instead of drifting with their length.
const titleTiers = [
  { size: 108, lines: 2 },
  { size: 92, lines: 2 },
  { size: 80, lines: 2 },
  { size: 70, lines: 2 },
  { size: 60, lines: 3 },
  { size: 52, lines: 3 },
];
const fallbackTitleSize = 44;
const TITLE_TOP = 38;
const TITLE_LINE_HEIGHT = 1.04;
// A series reads as one design, so month names must not pick different sizes.
const maxTitleSize: Record<string, number> = { newsletter: 70 };

// Ubuntu Bold averages about 0.56em per character.
const charWidth = 0.56;

// The fewest lines that fit, split so the longest line is as short as possible.
function wrapTitle(title: string, perLine: number) {
  const words = title.split(" ");
  if (words.some((word) => word.length > perLine)) return null;

  const greedy: string[] = [];
  let line = "";
  for (const word of words) {
    if (line && line.length + 1 + word.length > perLine) {
      greedy.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  greedy.push(line);

  let best = greedy;
  let bestLength = Math.max(...greedy.map((line) => line.length));
  const split = (start: number, lines: string[]) => {
    if (lines.length === greedy.length) {
      const length = Math.max(...lines.map((line) => line.length));
      if (start === words.length && length < bestLength) {
        best = lines;
        bestLength = length;
      }
      return;
    }
    for (let end = start + 1; end <= words.length; end++) {
      const next = words.slice(start, end).join(" ");
      if (next.length > perLine) break;
      split(end, [...lines, next]);
    }
  };
  split(0, []);
  return best;
}

function fitTitle(title: string, section: string) {
  const max = maxTitleSize[section] ?? Infinity;
  for (const { size, lines } of titleTiers) {
    if (size > max) continue;
    const wrapped = wrapTitle(
      title,
      Math.floor(TITLE_WIDTH / (size * charWidth)),
    );
    if (wrapped && wrapped.length <= lines) return { size, lines: wrapped };
  }
  const perLine = Math.floor(TITLE_WIDTH / (fallbackTitleSize * charWidth));
  return {
    size: fallbackTitleSize,
    lines: wrapTitle(title, perLine) ?? title.split(" "),
  };
}

const box = (
  style: Record<string, string | number>,
  children?: Element | Element[] | string,
): Element => ({
  type: "div",
  props: { style: { display: "flex", ...style }, children },
});

function docsBanner(
  title: string,
  section: string,
  logomark: string,
  widget: string,
): Element {
  const { widget: widgetName, accent } = sections[section] ?? fallbackSection;
  const { feet, body, faces, drop = 0 } = stances[widgetName];
  const label = section
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
  const { size, lines } = fitTitle(title, section);

  // A widget facing right stands on the left, so it looks toward the title.
  const onRight = faces !== "right";
  const widgetHeight = WIDGET_WIDTH * 1.5;
  const widgetLeft = onRight
    ? CROP_INSET + CROP_SIZE - WIDGET_INSET - (body[1] / 480) * WIDGET_WIDTH
    : CROP_INSET + WIDGET_INSET - (body[0] / 480) * WIDGET_WIDTH;
  // One pixel into the rule, so the feet look planted.
  const widgetTop =
    FLOOR + 1 - (feet / 720) * widgetHeight + drop * WIDGET_WIDTH;
  // The logo takes the margin opposite the widget.
  const logoLeft =
    (onRight ? CROP_INSET / 2 : WIDTH - CROP_INSET / 2) - LOGO_WIDTH / 2;

  const titleSide = onRight
    ? { left: CROP_INSET + TITLE_INSET }
    : {
        left: CROP_INSET + TITLE_INSET,
        width: TITLE_WIDTH,
        alignItems: "flex-end",
        textAlign: "right",
      };
  const tabSide = onRight
    ? { left: CROP_INSET + TITLE_INSET }
    : { right: CROP_INSET + TITLE_INSET };

  return box(
    {
      position: "relative",
      width: "100%",
      height: "100%",
      overflow: "hidden",
      backgroundColor: "#202124",
      fontFamily: "Ubuntu",
      color: "#ffffff",
    },
    [
      box({
        position: "absolute",
        left: 0,
        top: FLOOR,
        width: WIDTH,
        height: RULE,
        backgroundColor: accent,
      }),
      box(
        {
          position: "absolute",
          left: logoLeft,
          top: FLOOR - LOGO_HEIGHT - LOGO_GAP,
        },
        {
          type: "img",
          props: { src: logomark, width: LOGO_WIDTH, height: LOGO_HEIGHT },
        },
      ),
      box(
        {
          position: "absolute",
          top: TITLE_TOP,
          flexDirection: "column",
          ...titleSide,
        },
        lines.map((line) =>
          box(
            {
              fontSize: size,
              fontWeight: 700,
              lineHeight: TITLE_LINE_HEIGHT,
              letterSpacing: -size * 0.037,
            },
            line,
          ),
        ),
      ),
      box(
        {
          position: "absolute",
          top: FLOOR - TAB_HEIGHT,
          height: TAB_HEIGHT,
          padding: "0 30px",
          alignItems: "center",
          borderRadius: "14px 14px 0 0",
          backgroundColor: accent,
          color: "#16171a",
          fontSize: 32,
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: 7,
          textTransform: "uppercase",
          ...tabSide,
        },
        label,
      ),
      box(
        { position: "absolute", left: widgetLeft, top: widgetTop },
        {
          type: "img",
          props: { src: widget, width: WIDGET_WIDTH, height: widgetHeight },
        },
      ),
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
