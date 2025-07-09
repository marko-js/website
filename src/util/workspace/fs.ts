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
    const entries: string[] = [];
    for (const file in this.files) {
      if (file.startsWith(dir)) {
        entries.push(file.slice(dir.length));
      }
    }

    return entries;
  }
};

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

function toDirname(filePath: string) {
  return filePath.endsWith("/") ? filePath : filePath + "/";
}
