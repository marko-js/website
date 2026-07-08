// Not `/`: resolve-sync never probes the filesystem root's node_modules.
export const rootDir = "/app/";

// Files sit directly in the workspace directory, so a playground file is at the
// path the author typed rather than under scaffolding they never asked for.
// `marko.json` is what buys that: without it the compiler only discovers custom
// tags inside a directory literally named `tags` or `components`. The preview
// build and the language server both seed it so the two agree on what a bare
// `<foo>` resolves to.
export const markoJsonPath = `${rootDir}marko.json`;
export const markoJson = JSON.stringify({ "tags-dir": "." });

export class FileSystem {
  constructor(public files: Record<string, string>) {}
  statSync(entry: string) {
    if (!(entry in this.files)) {
      const dir = toDirname(entry);
      for (const file in this.files) {
        if (file.startsWith(dir)) {
          return new Stat(false);
        }
      }

      throw new Error();
    }
    return new Stat(true);
  }
  readFileSync(file: string) {
    if (!(file in this.files)) throw new Error();
    return this.files[file];
  }
  readdirSync(dirname: string) {
    const dir = toDirname(dirname);
    const entries = new Set<string>();
    for (const file in this.files) {
      if (file.startsWith(dir)) {
        const rel = file.slice(dir.length);
        const sep = rel.indexOf("/");
        entries.add(sep === -1 ? rel : rel.slice(0, sep));
      }
    }

    return [...entries];
  }
}

class Stat {
  #isFile: boolean;
  mtime = 1;
  constructor(isFile: boolean) {
    this.#isFile = isFile;
  }

  isFile() {
    return this.#isFile;
  }
  isDirectory() {
    return !this.#isFile;
  }
}

function toDirname(filePath: string) {
  return filePath.endsWith("/") ? filePath : filePath + "/";
}
