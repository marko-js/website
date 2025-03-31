import fs from "node:fs";
import path from "node:path";

export default function (title: string, files: string[]) {
  return (
    `<SYSTEM>${title}</SYSTEM>\n\n----------\n\n` +
    files
      .map((filename) => fs.readFileSync(filename))
      .join("\n\n----------\n\n")
  );
}
