import llmstxt from "./llms.txt?raw";

export const GET = (() => {
  return new Response(llmstxt, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}) satisfies MarkoRun.Handler;
