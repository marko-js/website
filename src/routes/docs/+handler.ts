export const GET = ((ctx) => {
  return Response.redirect(new URL("getting-started", ctx.url), 301);
}) satisfies MarkoRun.Handler;
