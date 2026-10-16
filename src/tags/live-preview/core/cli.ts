// Runs under plain `node` (type stripping), so a bundler is never needed to
// pre-compile an example: `echo '{"files":[...]}' | node cli.ts`.
import { buildStatic } from "./node.ts";

let input = "";
for await (const chunk of process.stdin) input += chunk;
const { files, csr, optimize } = JSON.parse(input);
process.stdout.write(
  JSON.stringify(await buildStatic(files, { csr, optimize })),
);
