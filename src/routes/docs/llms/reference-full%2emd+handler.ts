import prepareLlmstxt from "./prepare-llmstxt";

const referenceDocs = prepareLlmstxt(
  "This is the reference documentation for the Marko Language & JavaScript Framework",
  [
    "language",
    "custom-tag",
    "reactivity",
    "core-tag",
    "native-tag",
    "concise-syntax",
    "template",
    "typescript",
  ],
);

export const GET = (() => {
  return new Response(referenceDocs, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}) satisfies MarkoRun.Handler;
