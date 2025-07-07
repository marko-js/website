let files: Record<string, string> = {};
const changeHandlers = new Set<() => void>();
export function onChange(handler: () => void) {
  changeHandlers.add(handler);
  return () => changeHandlers.delete(handler);
}
export function getFiles() {
  return files;
}
export function resetFileSystem(newFiles: Record<string, string>) {
  files = newFiles;
  for (const handler of changeHandlers) {
    handler();
  }
}

export default {
  statSync(entry: string) {
    if (!(entry in files)) {
      const dir = toDirname(entry);
      for (const file in files) {
        if (file.startsWith(dir)) {
          return new Stat(false);
        }
      }

      throw new Error();
    }
    return new Stat(true);
  },
  readFileSync(file: string) {
    if (!(file in files)) throw new Error();
    return files[file];
  },
  readdirSync(dirname: string) {
    const dir = toDirname(dirname);
    const entries: string[] = [];
    for (const file in files) {
      if (file.startsWith(dir)) {
        entries.push(file.slice(dir.length));
      }
    }

    return entries;
  },
} as any as Pick<
  typeof import("fs"),
  "statSync" | "readFileSync" | "readdirSync" | "readFile"
>;

function toDirname(filePath: string) {
  return filePath.endsWith("/") ? filePath : filePath + "/";
}

class Stat {
  #isFile: boolean;
  mtime = 1;
  constructor(
    isFile: boolean,
  ) {
    this.#isFile = isFile;
  }

  isFile() {
    return this.#isFile;
  }
  isDirectory() {
    return !this.#isFile;
  }
}
