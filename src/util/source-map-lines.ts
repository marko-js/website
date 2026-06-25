import { SourceMapConsumer } from "@jridgewell/source-map";

/**
 * A line-level view of a source map, precomputed once so the playground can
 * cheaply answer "which output lines came from this source line?" while the
 * cursor moves. Lines are 1-based to match both the editor gutter and the
 * `.line` spans Shiki emits for the compiled output.
 */
export interface LineMap {
  /** Source line -> sorted, de-duplicated generated lines. */
  srcToGen: Map<number, number[]>;
}

/**
 * Build a {@link LineMap} from a raw source map, keeping only the mappings that
 * originate from `sourceFile` (the currently open template). Returns undefined
 * when the map is missing/unparseable or contributes no usable mappings, so
 * callers can treat "no visualizer" as a single falsy case.
 */
export function buildLineMap(
  rawMap: unknown,
  sourceFile: string,
): LineMap | undefined {
  if (!rawMap) return undefined;

  let consumer: SourceMapConsumer;
  try {
    consumer = new SourceMapConsumer(rawMap as any);
  } catch {
    return undefined;
  }

  const sets = new Map<number, Set<number>>();
  consumer.eachMapping((m) => {
    if (m.source == null || m.originalLine == null) return;
    if (!sourceMatches(m.source, sourceFile)) return;
    let gens = sets.get(m.originalLine);
    if (!gens) sets.set(m.originalLine, (gens = new Set()));
    gens.add(m.generatedLine);
  });

  if (!sets.size) return undefined;

  const srcToGen = new Map<number, number[]>();
  for (const [src, gens] of sets) {
    srcToGen.set(
      src,
      [...gens].sort((a, b) => a - b),
    );
  }
  return { srcToGen };
}

/** Collect the generated lines mapped from any source line in [from, to]. */
export function generatedLinesFor(
  lineMap: LineMap,
  from: number,
  to: number,
): Set<number> {
  const out = new Set<number>();
  for (let src = from; src <= to; src++) {
    const gens = lineMap.srcToGen.get(src);
    if (gens) {
      for (const gen of gens) out.add(gen);
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
