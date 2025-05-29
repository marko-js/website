declare module "@marko/run" {
  interface Context {
    contributors: Promise<GithubProfile[]>;
  }
}

interface GithubProfile {
  url: string;
  photo: string;
  username: string;
}

export default ((ctx) => {
  const route = ctx.url.pathname.substring(ctx.url.pathname.indexOf("docs/"));
  const contributors: Record<string, GithubProfile> = {};
  console.log(process.env.REPO_GITHUB_API_TOKEN?.substring(0, 3));
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
      console.log(route, res.ok ? "Success!" : "Error");
      if (!res.ok) {
        console.log(route, res.status);
        return [];
      }
      for (const contribution of await res.json()) {
        const author = contribution.author || contribution.commit.author;
        contributors[author.login] ??= {
          username: author.login,
          photo: author.avatar_url,
          url: author.html_url,
        };
      }
      console.log(route, Object.values(contributors));
      return Object.values(contributors);
    })
    .catch((e) => {
      console.log(route, e);
      return [];
    });
}) satisfies MarkoRun.Handler;
