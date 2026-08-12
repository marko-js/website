/** Resolves the current star count, rejecting if the API is unavailable. */
export function loadStars() {
  return loadCount(
    "https://api.github.com/repos/marko-js/marko",
    (data) => data.stargazers_count,
  );
}

/** Resolves last month's install count, rejecting if the API is unavailable. */
export function loadDownloads() {
  return loadCount(
    "https://api.npmjs.org/downloads/point/last-month/marko",
    (data) => data.downloads,
  );
}

async function loadCount(
  url: string,
  pick: (data: any) => unknown,
): Promise<number> {
  const res = await fetch(url);

  // A rate limited or errored response still carries a JSON body, so the status must
  // be checked before reading a count out of it.
  if (!res.ok) {
    throw new Error(`${url} responded with ${res.status} ${res.statusText}`);
  }

  const count = pick(await res.json());

  if (typeof count !== "number" || !Number.isFinite(count)) {
    throw new Error(`${url} responded with an unexpected shape`);
  }

  return count;
}
