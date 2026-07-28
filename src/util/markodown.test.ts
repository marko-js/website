import { describe, expect, it } from "vitest";
import { extractDescription } from "./markodown";

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
