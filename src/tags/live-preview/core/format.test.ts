import { describe, expect, it } from "vitest";
import { formatCode } from "./format";

describe("formatCode", () => {
  it("has nothing to do for an unknown extension", () => {
    expect(formatCode("x", 0, "png")).toBeUndefined();
  });

  it("formats marko, including its embedded script", () => {
    return expect(
      formatCode("<div   class='a'>${ 1+1 }</div>", 0, "marko"),
    ).resolves.toMatchObject({ formatted: expect.stringContaining("class=") });
  });

  it("formats js and keeps the cursor", async () => {
    const result = await formatCode("const   a=1", 11, "js")!;
    expect(result.formatted.trim()).toBe("const a = 1;");
    expect(typeof result.cursorOffset).toBe("number");
  });

  it("formats css", async () => {
    expect((await formatCode("a{color:red}", 0, "css")!).formatted.trim()).toBe(
      "a {\n  color: red;\n}",
    );
  });
});
