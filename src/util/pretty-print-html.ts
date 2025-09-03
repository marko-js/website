import format, { plugins } from "pretty-format";
const { DOMElement, DOMCollection } = plugins;
const parser =
  typeof document === "object" ? document.createElement("template") : undefined;

export function prettyPrintHTML(html: string) {
  if (!parser) throw new Error();
  parser.innerHTML = html;
  return Array.from(parser.content.childNodes)
    .map(formatNode)
    .filter(Boolean)
    .join("\n");
}

function formatNode(node: Node) {
  return format(node, {
    plugins: [DOMElement, DOMCollection],
  }).trim();
}
