import path from "node:path";
import prepareLlmsTxt from "./prepare-llmstxt";
import fs from "node:fs";

const referenceDir = path.join(process.cwd(), "docs", "reference");
const referenceDocs = prepareLlmsTxt(
  "This is the reference documentation for the Marko Language & JavaScript Framework",
  fs.readdirSync(referenceDir).map((file) => path.join(referenceDir, file)),
);

export const GET = (() => {
  return new Response(referenceDocs, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}) satisfies MarkoRun.Handler;
