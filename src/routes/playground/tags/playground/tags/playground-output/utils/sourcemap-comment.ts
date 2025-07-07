import { toDataURI } from "./to-data-uri";

export function getSourceMapComment(filename: string, map: any) {
  if (!map) return "";
  if (typeof map === "object") map = JSON.stringify(map);
  switch (/\.[^.]+$/.exec(filename)?.[0]) {
    case ".js":
      return (
        "\n//# sourceURL=" +
        encodeURI(filename) +
        (map
          ? "\n//# sourceMappingURL=" +
            toDataURI("application/json", map)
          : "")
      );
    case ".css":
      return (
        "\n/*# sourceURL=" +
        encodeURI(filename) +
        "*/" +
        (map
          ? "\n/*# sourceMappingURL=" +
            toDataURI("application/json", map) +
            "*/"
          : "")
      );
  }

  throw new Error("Cannot create a sourcemap for " + filename);
}
