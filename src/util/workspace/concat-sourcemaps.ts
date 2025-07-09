import { SourceMapGenerator, SourceMapConsumer } from "@jridgewell/source-map";

export class ConcatSourceMap {
  private line = 0;
  public sourceMap: SourceMapGenerator;
  public content = "";

  constructor(file: string) {
    this.sourceMap = new SourceMapGenerator({ file });
  }

  add(source: string | null, content: string, sourceMap?: any) {
    const { line } = this;
    const lines = getLineCount(content);
    this.line += lines;

    if (this.content) {
      this.content += "\n";
    }

    this.content += content;

    if (sourceMap) {
      const map = new SourceMapConsumer(sourceMap);
      map.eachMapping((mapping) => {
        if (mapping.source) {
          this.sourceMap!.addMapping({
            generated: {
              line: line + mapping.generatedLine,
              column: mapping.generatedColumn,
            },
            original: {
              line: mapping.originalLine,
              column: mapping.originalColumn,
            },
            source: mapping.source,
            name: mapping.name!,
          });
        }
      });

      if (map.sourcesContent) {
        for (let i = map.sourcesContent.length; i--; ) {
          const sourceContent = map.sourcesContent[i];
          const source = map.sources[i];
          if (sourceContent !== null && source !== null) {
            this.sourceMap!.setSourceContent(source, sourceContent);
          }
        }
      }
    } else if (source) {
      for (let i = lines; i--; ) {
        this.sourceMap.addMapping({
          generated: {
            line: this.line + i,
            column: 0,
          },
          original: {
            line: i,
            column: 0,
          },
          source,
          name: null as any,
        });
      }

      const sourceContent = sourceMap.sourcesContent?.[0];
      if (sourceContent) {
        this.sourceMap.setSourceContent(source, sourceContent);
      }
    }
  }
}

function getLineCount(str: string) {
  let lines = 1;
  for (let i = str.length; i--; ) {
    if (str.charAt(i) === "\n") {
      lines++;
    }
  }
  return lines;
}
