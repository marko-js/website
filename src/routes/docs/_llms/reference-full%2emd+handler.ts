import path from "node:path";
import prepareLlmsTxt from "./prepare-llmstxt";

const referenceDir = path.join(process.cwd(), "docs", "reference");
const referenceDocs = prepareLlmsTxt(
  "This is the reference documentation for the Marko Language & JavaScript Framework",
  [
    "language",
    "custom-tag",
    "reactivity",
    "core-tag",
    "native-tag",
    "typescript",
    "concise-syntax",
    "template",
  ].map((file) => path.join(referenceDir, file + ".md")),
);

export const GET = (() => {
  return new Response(referenceDocs, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}) satisfies MarkoRun.Handler;
