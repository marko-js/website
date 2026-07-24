import manifest from "./_compiled-learn/manifest.json";

export const GET = ((ctx) => {
  return ctx.redirect(`/learn/${manifest[0].slug}`);
}) satisfies MarkoRun.Handler;
