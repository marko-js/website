import { describe, expect, it } from "vitest";
import { extractDescription, formatMarkoCode, mdToMarko } from "./markodown";

describe("extractDescription", () => {
  it("uses the paragraph that opens the doc", () => {
    expect(
      extractDescription(
        "# Styling\n\nSome ways to style HTML within Marko.\n",
      ),
    ).toBe("Some ways to style HTML within Marko.");
  });

  it("skips a leading callout to reach the intro", () => {
    expect(
      extractDescription(
        "# Streaming\n\n> [!TLDR]\n>\n> - streams out of order\n\nMarko streams HTML as it renders.\n",
      ),
    ).toBe("Marko streams HTML as it renders.");
  });

  it("falls back to callout bullets when the doc has no prose", () => {
    expect(
      extractDescription(
        "# `<let>` vs `<const>`\n\n> [!TLDR]\n>\n> - `<let>`: mutable state\n> - `<const>`: derived value\n",
      ),
    ).toBe("<let>: mutable state; <const>: derived value");
  });

  it("reads links by their label and drops code punctuation", () => {
    expect(
      extractDescription(
        "# Tags\n\nSee the [core tags](../reference/core-tag.md) and `<if>`.\n",
      ),
    ).toBe("See the core tags and <if>.");
  });

  it("ignores a paragraph that is only an image", () => {
    expect(
      extractDescription("# Brand\n\n![logo](./logo.svg)\n\nThe real intro.\n"),
    ).toBe("The real intro.");
  });

  it("has no description for a doc that is only headings", () => {
    expect(
      extractDescription("# Publishing\n\n## Best Practices\n\n## Storybook\n"),
    ).toBeUndefined();
  });

  it("keeps whole sentences within the length budget", () => {
    const first = `Marko ${"compiles templates ahead of time".padEnd(120, ".")}`;
    const description = extractDescription(
      `# Compiler\n\n${first} A second sentence that would push it past the budget.\n`,
    )!;

    expect(description).toBe(first);
    expect(description.length).toBeLessThanOrEqual(160);
  });

  it("cuts at a word when the first sentence alone is too long", () => {
    const description = extractDescription(
      `# Compiler\n\n${"word ".repeat(60)}end.\n`,
    )!;

    expect(description.length).toBeLessThanOrEqual(160);
    expect(description).toMatch(/word…$/);
  });
});

describe("formatMarkoCode", () => {
  it("shows the source in both variants when it has no types", async () => {
    const code = await formatMarkoCode(
      "<let/degF=80>\n\n<input value=degF valueChange(value) { degF = parseFloat(value) }>\n",
    );
    expect(code.html).toBe(code.htmlTS);
    expect(code.concise).toBe(code.conciseTS);
    expect(code.html).toContain("\n\n<input");
  });

  it("formats the JavaScript form of typed source", async () => {
    const code = await formatMarkoCode(
      "<div>\n  <button onClick(event: MouseEvent) { handle(event as Event) }>go</button>\n</div>\n",
    );
    expect(code.htmlTS).toContain("event: MouseEvent");
    expect(code.html).toBe(
      "<div>\n  <button onClick(event) {\n    handle(event);\n  }>\n    go\n  </button>\n</div>",
    );
  });
});

describe("live previews", () => {
  const counter =
    "```marko\n<let/count=0>\n<button onClick() { count++ }>${count}</button>\n```";
  const quote = (md: string) =>
    md
      .split("\n")
      .map((line) => `> ${line}`.trimEnd())
      .join("\n");

  it("renders a callout of fences as a live preview", async () => {
    const { markoCode } = await mdToMarko(`> [!LIVE]\n>\n${quote(counter)}\n`);
    expect(markoCode).toMatch(/^<live-preview files=\[\{"path":"index.marko"/);
    expect(markoCode).not.toContain("app-code-block");
    expect(markoCode).not.toContain("editable=false");
    // all four forms are kept for the docs syntax toggles
    expect(markoCode).toContain('"concise":');
    expect(markoCode).toContain('"conciseTS":');
  });

  it("takes file names from comments and options from the marker", async () => {
    const md = `> [!LIVE readonly height=8rem]\n>\n${quote("```marko\n/* index.marko */\n<hello/>\n```\n\n```marko\n/* hello.marko */\n<p>Hi</p>\n```")}\n`;
    const { markoCode } = await mdToMarko(md);
    expect(markoCode).toContain('"path":"index.marko"');
    expect(markoCode).toContain('"path":"hello.marko"');
    expect(markoCode).toContain("editable=false");
    expect(markoCode).toContain('height="8rem"');
  });

  it("rejects unknown options", async () => {
    await expect(
      mdToMarko(`> [!LIVE wide]\n>\n${quote(counter)}\n`),
    ).rejects.toThrow(/Unknown/);
  });

  it("rejects prose, empty callouts and unnamed files in a group", async () => {
    await expect(mdToMarko("> [!LIVE]\n>\n> Just text\n")).rejects.toThrow(
      /only code fences/,
    );
    await expect(mdToMarko("> [!LIVE]\n")).rejects.toThrow(/only code fences/);
    const two = `> [!LIVE]\n>\n${quote(counter + "\n\n" + counter)}\n`;
    await expect(mdToMarko(two)).rejects.toThrow(
      /needs a `\/\* file.ext \*\/` name/,
    );
  });
});
