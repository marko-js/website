import fs from "node:fs";

export default function (title: string, files: string[]) {
  return (
    `<SYSTEM>${title}</SYSTEM>\n\n----------\n\n` +
    files
      .map(
        (filename) =>
          `<!-- ${filename.slice(filename.lastIndexOf("/") + 1)} -->\n\n${fs.readFileSync(filename)}`,
      )
      .join("\n\n----------\n\n")
  );
}
