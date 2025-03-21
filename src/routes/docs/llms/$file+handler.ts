import fs from "node:fs";

export const GET = ((ctx) => {
  const filePath = `${import.meta.dirname}/../${ctx.params.file}`;
  if (!fs.existsSync(filePath)) {
    return new Response("File not found", { status: 404 });
  }
  return new Response(fs.readFileSync(filePath), {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}) satisfies MarkoRun.Handler;
