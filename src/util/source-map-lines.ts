import { SourceMapConsumer } from "@jridgewell/source-map";

/**
 * A single run of generated characters that came from one source position:
 * line `line` (1-based), columns `[startCol, endCol)` (0-based). `endCol` is
 * `Infinity` for the last segment on a generated line, meaning "to end of line".
 */
export interface GenSpan {
  line: number;
  startCol: number;
  endCol: number;
}

/**
 * A position-indexed view of a source map, precomputed once so the playground
 * can cheaply answer "which output characters came from the token under the
 * caret?" as the cursor moves. Indexing by source position (line + column) and
 * tracking the exact generated column span of each mapping -- rather than whole
 * source/generated lines -- means a caret lights up only the characters that
 * genuinely came from it, leaving the compiler's surrounding scaffolding dark.
 * Source lines are 1-based (matching the editor gutter) and columns are 0-based
 * (matching the source map spec).
 */
export interface PosMap {
  /**
   * 1-based source line -> the source columns present on it, each with the
   * generated spans it produced. Sorted by source column.
   */
  bySrcLine: Map<number, { col: number; spans: GenSpan[] }[]>;
}

/**
 * Build a {@link PosMap} from a raw source map, keeping only the mappings that
 * originate from `sourceFile` (the currently open template). Returns undefined
 * when the map is missing/unparseable or contributes no usable mappings, so
 * callers can treat "no visualizer" as a single falsy case.
 */
export function buildPosMap(
  rawMap: unknown,
  sourceFile: string,
): PosMap | undefined {
  if (!rawMap) return undefined;

  let consumer: SourceMapConsumer;
  try {
    consumer = new SourceMapConsumer(rawMap as any);
  } catch {
    return undefined;
  }

  // Group every mapping by generated line first. A segment's end column is the
  // start of the next segment on the same generated line, so we need all the
  // boundaries -- including segments from other sources -- before we can size
  // the ones we keep.
  interface RawSeg {
    genCol: number;
    srcLine: number;
    srcCol: number;
    keep: boolean;
  }
  const byGenLine = new Map<number, RawSeg[]>();
  consumer.eachMapping((m) => {
    let segs = byGenLine.get(m.generatedLine);
    if (!segs) byGenLine.set(m.generatedLine, (segs = []));
    const keep =
      m.source != null &&
      m.originalLine != null &&
      m.originalColumn != null &&
      sourceMatches(m.source, sourceFile);
    segs.push({
      genCol: m.generatedColumn,
      srcLine: m.originalLine!,
      srcCol: m.originalColumn!,
      keep,
    });
  });

  const bySrcLine = new Map<number, Map<number, GenSpan[]>>();
  for (const [genLine, segs] of byGenLine) {
    segs.sort((a, b) => a.genCol - b.genCol);
    for (let i = 0; i < segs.length; i++) {
      const seg = segs[i];
      if (!seg.keep) continue;
      const endCol = i + 1 < segs.length ? segs[i + 1].genCol : Infinity;
      if (endCol <= seg.genCol) continue; // zero-width mapping
      let cols = bySrcLine.get(seg.srcLine);
      if (!cols) bySrcLine.set(seg.srcLine, (cols = new Map()));
      let spans = cols.get(seg.srcCol);
      if (!spans) cols.set(seg.srcCol, (spans = []));
      spans.push({ line: genLine, startCol: seg.genCol, endCol });
    }
  }

  if (!bySrcLine.size) return undefined;
  const out = new Map<number, { col: number; spans: GenSpan[] }[]>();
  for (const [line, cols] of bySrcLine) {
    const arr = [...cols].map(([col, spans]) => ({ col, spans }));
    arr.sort((a, b) => a.col - b.col);
    out.set(line, arr);
  }
  return { bySrcLine: out };
}

/**
 * Generated character spans for a source selection (1-based lines, 0-based
 * columns). A collapsed caret resolves to the single source column it sits in
 * -- the token under the cursor -- so it yields only that token's output. A
 * real selection collects the spans of every token inside the range.
 */
export function generatedSpansForRange(
  map: PosMap,
  startLine: number,
  startCol: number,
  endLine: number,
  endCol: number,
): GenSpan[] {
  const out: GenSpan[] = [];

  if (startLine === endLine && startCol === endCol) {
    const cols = map.bySrcLine.get(startLine);
    if (cols?.length) {
      // The source column the caret sits in: the greatest column <= the caret,
      // or the first column when the caret precedes them all.
      let chosen = cols[0];
      for (const c of cols) {
        if (c.col > startCol) break;
        chosen = c;
      }
      out.push(...chosen.spans);
    }
    return out;
  }

  for (let line = startLine; line <= endLine; line++) {
    const cols = map.bySrcLine.get(line);
    if (!cols) continue;
    for (const c of cols) {
      if (line === startLine && c.col < startCol) continue;
      if (line === endLine && c.col > endCol) continue;
      out.push(...c.spans);
    }
  }
  return out;
}

// The compiler labels mappings with the path it was handed (e.g.
// `/tags/index.marko`); accept a trailing-segment match so a bare filename or a
// differently-rooted path still lines up.
function sourceMatches(source: string, file: string) {
  return (
    source === file ||
    source.endsWith("/" + file) ||
    file.endsWith("/" + source)
  );
}
