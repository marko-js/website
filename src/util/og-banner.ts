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
const sectionOf = (section: string) => sections[section] ?? fallbackSection;
// The default and playground banners greet visitors like the introduction does.
const defaultSection = sections.introduction;

// The standing ("legs") widget SVGs all share one viewBox.
const WIDGET_SVG = { width: 480, height: 720 };

// Measured from each rendered SVG, so a widget's feet land on the rule and its
// body keeps clear of the crop's edge. `faces` is a reading of the artwork.
interface Stance {
  feet: number; // lowest opaque pixel, in SVG units
  body: [number, number]; // horizontal extent, in SVG units
  faces: "left" | "right" | "front";
  drop?: number; // extra drop, as a fraction of the width, when one foot is raised
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
// Compact link previews (Slack, iMessage) crop to the centered square.
const CROP_SIZE = HEIGHT;
const CROP_INSET = (WIDTH - CROP_SIZE) / 2;

// Every banner keeps what matters in the square, with the widget standing on a
// rule along the bottom edge. A faint logo behind it all is all the margins hold.
const RULE = 14;
const FLOOR = HEIGHT - RULE;
const WIDGET_WIDTH = 250;
const WIDGET_INSET = 28;
const TITLE_INSET = 34;
const TITLE_WIDTH = CROP_SIZE - TITLE_INSET * 2;
const WORDMARK_WIDTH = 540;
const TAB_HEIGHT = 58;
const WATERMARK_WIDTH = 1000;
const WATERMARK_HEIGHT = (WATERMARK_WIDTH * 191) / 347; // logomark.svg's viewBox
const WATERMARK_OPACITY = 0.06;

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

const widgetPath = (widget: string) =>
  assetPath("widget", `${widget}-legs-dark.svg`);

export function docsBannerSources(section: string) {
  return [assetPath("logomark.svg"), widgetPath(sectionOf(section).widget)];
}

export function defaultBannerSources() {
  return [
    assetPath("logomark.svg"),
    assetPath("logo-dark.svg"),
    widgetPath(defaultSection.widget),
  ];
}

function loadAssets() {
  return (assets ??= (async () => {
    const [bold, logomark, logo] = await Promise.all([
      fs.readFile(
        path.join(
          process.cwd(),
          "node_modules",
          "@fontsource",
          "ubuntu",
          "files",
          "ubuntu-latin-700-normal.woff",
        ),
      ),
      fs.readFile(assetPath("logomark.svg")),
      fs.readFile(assetPath("logo-dark.svg")),
    ]);

    const toDataURI = (svg: Buffer) =>
      `data:image/svg+xml;base64,${svg.toString("base64")}`;

    return {
      fonts: [{ name: "Ubuntu", data: bold, weight: 700 as const }],
      logomark: toDataURI(logomark),
      logo: toDataURI(logo),
    };
  })().catch((err) => {
    assets = undefined;
    throw err;
  }));
}

const widgetCache = new Map<string, Promise<string>>();

function loadWidget(name: string) {
  let widget = widgetCache.get(name);
  if (!widget) {
    widget = fs
      .readFile(widgetPath(name))
      .then((svg) => `data:image/svg+xml;base64,${svg.toString("base64")}`)
      .catch((err) => {
        widgetCache.delete(name);
        throw err;
      });
    widgetCache.set(name, widget);
  }
  return widget;
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
  { size: 44, lines: 4 },
  { size: 36, lines: 5 },
];
const TITLE_TOP = 38;
const TITLE_LINE_HEIGHT = 1.04;
const TITLE_TRACKING = -0.037; // em
// A series reads as one design, so month names must not pick different sizes.
const maxTitleSize: Record<string, number> = { newsletter: 70 };

// Ubuntu Bold averages about 0.56em per character.
const charWidth = 0.56;
const charsPerLine = (size: number) =>
  Math.floor(TITLE_WIDTH / (size * charWidth));

// The fewest lines that fit, split so the longest line is as short as possible.
// A word longer than `perLine` gets a line to itself.
function wrapTitle(title: string, perLine: number) {
  const words = title.split(" ");

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
    const perLine = charsPerLine(size);
    const wrapped = wrapTitle(title, perLine);
    if (
      wrapped.length <= lines &&
      wrapped.every((line) => line.length <= perLine)
    ) {
      return { size, lines: wrapped };
    }
  }
  // Best effort: a word too long for any tier is left to overflow.
  const { size } = titleTiers[titleTiers.length - 1];
  return { size, lines: wrapTitle(title, charsPerLine(size)) };
}

const box = (
  style: Record<string, string | number>,
  children?: Element | Element[] | string,
): Element => ({
  type: "div",
  props: { style: { display: "flex", ...style }, children },
});

interface Standing {
  accent: string;
  widget: string; // the widget's name, for its stance
  widgetSrc: string;
  logomark: string;
  title: Element[];
  label?: string;
}

function standingBanner({
  accent,
  widget,
  widgetSrc,
  logomark,
  title,
  label,
}: Standing): Element {
  const { feet, body, faces, drop = 0 } = stances[widget];

  // A widget facing right stands on the left, so it looks toward the title.
  const onRight = faces !== "right";
  const unit = WIDGET_WIDTH / WIDGET_SVG.width;
  const widgetHeight = WIDGET_SVG.height * unit;
  const widgetLeft = onRight
    ? CROP_INSET + CROP_SIZE - WIDGET_INSET - body[1] * unit
    : CROP_INSET + WIDGET_INSET - body[0] * unit;
  // One pixel into the rule, so the feet look planted.
  const widgetTop = FLOOR + 1 - feet * unit + drop * WIDGET_WIDTH;

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
      box(
        {
          position: "absolute",
          left: (WIDTH - WATERMARK_WIDTH) / 2,
          top: (HEIGHT - WATERMARK_HEIGHT) / 2,
        },
        {
          type: "img",
          props: {
            src: logomark,
            width: WATERMARK_WIDTH,
            height: WATERMARK_HEIGHT,
            style: { opacity: WATERMARK_OPACITY },
          },
        },
      ),
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
          top: TITLE_TOP,
          flexDirection: "column",
          ...titleSide,
        },
        title,
      ),
      ...(label
        ? [
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
          ]
        : []),
      box(
        { position: "absolute", left: widgetLeft, top: widgetTop },
        {
          type: "img",
          props: { src: widgetSrc, width: WIDGET_WIDTH, height: widgetHeight },
        },
      ),
    ],
  );
}

function docsBanner(
  title: string,
  section: string,
  logomark: string,
  widgetSrc: string,
): Element {
  const { widget, accent } = sectionOf(section);
  const label = section
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
  const { size, lines } = fitTitle(title, section);

  return standingBanner({
    accent,
    widget,
    widgetSrc,
    logomark,
    label,
    title: lines.map((line) =>
      box(
        {
          fontSize: size,
          fontWeight: 700,
          lineHeight: TITLE_LINE_HEIGHT,
          letterSpacing: size * TITLE_TRACKING,
        },
        line,
      ),
    ),
  });
}

// The wordmark takes the title's place; `suffix` names the page, like a section.
function defaultBanner(
  logo: string,
  logomark: string,
  widgetSrc: string,
  suffix?: string,
): Element {
  const { widget, accent } = defaultSection;
  return standingBanner({
    accent,
    widget,
    widgetSrc,
    logomark,
    label: suffix,
    title: [
      {
        type: "img",
        props: {
          src: logo,
          width: WORDMARK_WIDTH,
          height: (WORDMARK_WIDTH * 103) / 500, // logo-dark.svg's ratio
        },
      },
    ],
  });
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
  const [{ logomark }, widgetSrc] = await Promise.all([
    loadAssets(),
    loadWidget(sectionOf(section).widget),
  ]);
  return render(docsBanner(title, section, logomark, widgetSrc));
}

export async function renderDefaultBanner(suffix?: string) {
  const [{ logo, logomark }, widgetSrc] = await Promise.all([
    loadAssets(),
    loadWidget(defaultSection.widget),
  ]);
  return render(defaultBanner(logo, logomark, widgetSrc, suffix));
}
