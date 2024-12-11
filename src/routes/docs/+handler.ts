export const GET = ((ctx) => {
  return Response.redirect(`${ctx.url.href}getting-started/`);
}) satisfies MarkoRun.Handler;
