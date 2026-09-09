// The workspace lives one directory below the virtual filesystem's root
// rather than at `/` itself. Node resolution walks parent directories with
// `dir + "/node_modules/" + name` and stops once `dir` reaches the root, so a
// workspace at `/` is the one location whose own `node_modules` is both
// mis-joined (`//node_modules/...`) and skipped entirely for imports coming
// from nested modules. At `/app/` every probe is a well-formed path that gets
// checked before the walk terminates.
export const rootDir = "/app/";

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
