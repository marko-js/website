import fs from "node:fs";

export default function (title: string, files: string[]) {
  return (
    `<SYSTEM>${title}</SYSTEM>\n\n----------\n\n` +
    files
      .map((filename) =>
        fs.readFileSync(`${import.meta.dirname}/../${filename}.md`),
      )
      .join("\n\n----------\n\n")
  );
}
