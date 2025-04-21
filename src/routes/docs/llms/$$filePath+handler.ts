import fs from "node:fs";
import path from "node:path";

export const GET = ((ctx) => {
  if (!ctx.params.filePath) {
    return new Response("No path provided", { status: 404 });
  }
  const filePath = path.join(
    process.cwd(),
    "docs",
    ...ctx.params.filePath.split("/"),
  );
  if (!fs.existsSync(filePath)) {
    return new Response("File not found", { status: 404 });
  }
  return new Response(fs.readFileSync(filePath), {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}) satisfies MarkoRun.Handler;
