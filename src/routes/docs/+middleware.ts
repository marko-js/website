declare module "@marko/run" {
  interface Context {
    contributors: Promise<GithubProfile[]>;
  }
}

interface GithubProfile {
  url: string;
  photo: string;
  username: string;
  contributions: number;
}

export default ((ctx) => {
  const route = ctx.url.pathname.slice(ctx.url.pathname.indexOf("docs/"));
  const contributors: Record<string, GithubProfile> = {};
  ctx.contributors = fetch(
    `https://api.github.com/repos/marko-js/website-next/commits?path=${route}.md`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.REPO_GITHUB_API_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    },
  )
    .then(async (res) => {
      if (!res.ok) {
        return [];
      }
      for (const contribution of await res.json()) {
        const author = contribution.author || contribution.commit.author;
        if (contributors[author.login]) {
          contributors[author.login].contributions++;
        } else {
          contributors[author.login] = {
            username: author.login,
            photo: author.avatar_url,
            url: author.html_url,
            contributions: 1,
          };
        }
      }
      return Object.values(contributors).sort(
        (a, b) => b.contributions - a.contributions,
      );
    })
    .catch((e) => {
      return [];
    });
}) satisfies MarkoRun.Handler;
