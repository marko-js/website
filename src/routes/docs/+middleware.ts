declare module "@marko/run" {
  interface Context {
    contributors: GithubProfile[];
  }
}

interface GithubProfile {
  url: string;
  photo: string;
  username: string;
}

export default (async (ctx) => {
  const route = ctx.url.pathname.substring(
    "/docs/".length,
    ctx.url.pathname.length - 1,
  );
  const contributors: Record<string, GithubProfile> = {};
  ctx.contributors = await fetch(
    `https://api.github.com/repos/marko-js/website/commits?path=src/routes/docs/${route}.md`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    },
  ).then(async (res) => {
    if (!res.ok) {
      throw new Error(`GitHub API failed: ${res.statusText}`);
    }
    for (const contribution of await res.json()) {
      const author = contribution.author || contribution.commit.author;
      contributors[author.login] ??= {
        username: author.login,
        photo: author.avatar_url,
        url: author.html_url,
      };
    }
    return Object.values(contributors);
  });
}) satisfies MarkoRun.Handler;
