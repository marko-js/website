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

export default Run.ALL((ctx) => {
  ctx.contributors = fetchContributors(ctx.url.pathname);
});

/**
 * Only doc pages render the layout that shows contributors. The `/docs`
 * redirect and the `reference-full.md` and `feed.xml` handlers each spent a
 * request asking after a path that cannot exist, which matters because a build
 * with no token has 60 an hour to cover 51 pages.
 */
function fetchContributors(pathname: string): Promise<GithubProfile[]> {
  const start = pathname.indexOf("/docs/");
  const route = start === -1 ? "" : pathname.slice(start + 1);

  if (!route || /\.\w+$/.test(route)) {
    return Promise.resolve([]);
  }

  const contributors: Record<string, GithubProfile> = {};
  const token = process.env.REPO_GITHUB_API_TOKEN;
  return fetch(
    `https://api.github.com/repos/marko-js/website/commits?path=${route}.md`,
    {
      method: "GET",
      headers: {
        // Sent only when there is a token: `Bearer undefined` is rejected with
        // a 401, where omitting the header entirely falls back to the
        // unauthenticated rate limit and still returns the commits.
        ...(token && { Authorization: `Bearer ${token}` }),
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
    .catch(() => []);
}
