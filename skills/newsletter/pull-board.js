#!/usr/bin/env node
// Pull data for the Marko monthly newsletter from the official GitHub API.
// No external dependencies: needs Node 18+ (uses the global `fetch`).
//
// Auth: set GITHUB_PROJECT_TOKEN to a GitHub PAT with the `read:project` and
// `repo` scopes. The script bails if it is missing.
//
// Usage:
//   node skills/newsletter/pull-board.js "Jul 2026"            # board items for an iteration
//   node skills/newsletter/pull-board.js month "Jul 2026"      # same, explicit
//   node skills/newsletter/pull-board.js merged 2026-07         # PRs merged that month (coverage cross-check)
//   node skills/newsletter/pull-board.js contributors 2026-07   # first-time contributors that month (for Community)
//   node skills/newsletter/pull-board.js pr language-server 527 # a PR's title, body, linked issues, changed files
//   node skills/newsletter/pull-board.js issue marko 3167       # an issue's title and body (follow a #ref from a PR)
//
// Output (month/merged) is tab-separated so it is easy to scan or pipe.

const token = process.env.GITHUB_PROJECT_TOKEN;
if (!token) {
  console.error(
    "Set GITHUB_PROJECT_TOKEN to a GitHub PAT with the read:project and repo scopes.",
  );
  process.exit(1);
}

const API = "https://api.github.com";
const PROJECT_ID = "PVT_kwDOALUtoM0gQw"; // marko-js "Roadmap" (project #2)
const MAX_RETRIES = 4;
const MAX_PAGES = 1000; // safety cap so a bad cursor can never loop forever
const headers = {
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// fetch with retry/backoff on network failures, rate limits (429), and 5xx.
async function apiFetch(url, init = {}) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    let res;
    try {
      res = await fetch(url, { ...init, headers: { ...headers, ...init.headers } });
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES) await sleep(attempt * 500);
      continue;
    }
    if ((res.status === 429 || res.status >= 500) && attempt < MAX_RETRIES) {
      const retryAfter = Number(res.headers.get("retry-after"));
      lastError = new Error(`GitHub API ${res.status} ${res.statusText}`);
      await sleep(retryAfter > 0 ? retryAfter * 1000 : attempt * 1000);
      continue;
    }
    return res;
  }
  throw lastError ?? new Error(`request to ${url} failed`);
}

async function gql(query, variables) {
  const res = await apiFetch(`${API}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.errors) {
    throw new Error(`GitHub GraphQL error (${res.status}): ${JSON.stringify(json.errors ?? json)}`);
  }
  return json.data;
}

async function rest(path) {
  const res = await apiFetch(`${API}${path}`);
  if (!res.ok) throw new Error(`GitHub API ${res.status} ${res.statusText} for ${path}`);
  return res.json();
}

// Walk a GraphQL Relay connection fully. `runPage(cursor)` resolves to a
// connection ({ nodes, pageInfo }); returns the flattened nodes.
async function collect(runPage) {
  const all = [];
  let cursor = null;
  for (let page = 0; page < MAX_PAGES; page++) {
    const conn = await runPage(cursor);
    all.push(...conn.nodes);
    const { hasNextPage, endCursor } = conn.pageInfo;
    if (!hasNextPage || endCursor == null || endCursor === cursor) break;
    cursor = endCursor;
  }
  return all;
}

const ITEMS_QUERY = `
  query ($project: ID!, $cursor: String) {
    node(id: $project) {
      ... on ProjectV2 {
        items(first: 100, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          nodes {
            content {
              __typename
              ... on PullRequest { number title repository { name } }
              ... on Issue { number title repository { name } }
              ... on DraftIssue { title }
            }
            fieldValues(first: 40) {
              nodes {
                ... on ProjectV2ItemFieldSingleSelectValue { field { ... on ProjectV2FieldCommon { name } } name }
                ... on ProjectV2ItemFieldIterationValue { field { ... on ProjectV2FieldCommon { name } } title }
              }
            }
          }
        }
      }
    }
  }
`;

const SEARCH_QUERY = `
  query ($q: String!, $cursor: String) {
    search(query: $q, type: ISSUE, first: 100, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes {
        ... on PullRequest { number title repository { name } author { login } authorAssociation }
      }
    }
  }
`;

const PR_QUERY = `
  query ($owner: String!, $repo: String!, $number: Int!) {
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $number) {
        title
        body
        closingIssuesReferences(first: 10) { nodes { number title } }
        files(first: 100) { nodes { path additions deletions } }
      }
    }
  }
`;

const fieldValue = (item, name) => {
  const node = item.fieldValues.nodes.find((n) => n.field?.name === name);
  return node?.name ?? node?.title;
};

async function pullMonth(month) {
  if (!month) throw new Error('Usage: pull-board.js "<Iteration Title>"  (e.g. "Jul 2026")');
  const items = await collect(
    async (cursor) => (await gql(ITEMS_QUERY, { project: PROJECT_ID, cursor })).node.items,
  );
  const rows = [];
  for (const item of items) {
    if (fieldValue(item, "Iteration") !== month) continue;
    const c = item.content ?? {};
    const ref = c.repository ? `${c.repository.name}#${c.number}` : "draft";
    rows.push(
      [ref, fieldValue(item, "Epic") ?? "-", fieldValue(item, "Task") ?? "-", c.title ?? "(draft)"].join("\t"),
    );
  }
  console.log(rows.sort().join("\n"));
}

async function searchMergedPRs(ym, usage) {
  if (!/^\d{4}-\d{2}$/.test(ym ?? "")) throw new Error(usage);
  const [y, m] = ym.split("-").map(Number);
  const lastDay = String(new Date(y, m, 0).getDate()).padStart(2, "0");
  const q = `org:marko-js is:pr is:merged merged:${ym}-01..${ym}-${lastDay}`;
  const nodes = await collect(async (cursor) => (await gql(SEARCH_QUERY, { q, cursor })).search);
  return nodes.filter((pr) => pr?.repository);
}

async function pullMerged(ym) {
  const prs = await searchMergedPRs(ym, "Usage: pull-board.js merged <YYYY-MM>  (e.g. 2026-07)");
  for (const pr of prs) {
    console.log(`${pr.repository.name}#${pr.number}\t${pr.title}\t${pr.author?.login ?? "?"}\t${pr.authorAssociation}`);
  }
}

// First-time contributors that month, for the newsletter's Community section.
// authorAssociation FIRST_TIME_CONTRIBUTOR means their first PR to that repo;
// FIRST_TIMER means their first PR anywhere on GitHub.
async function pullContributors(ym) {
  const prs = await searchMergedPRs(ym, "Usage: pull-board.js contributors <YYYY-MM>  (e.g. contributors 2026-07)");
  const firstTime = prs.filter(
    (pr) => pr.authorAssociation === "FIRST_TIME_CONTRIBUTOR" || pr.authorAssociation === "FIRST_TIMER",
  );
  if (!firstTime.length) {
    console.log("(no first-time contributors this month)");
    return;
  }
  for (const pr of firstTime) {
    console.log(`${pr.repository.name}#${pr.number}\t${pr.author?.login ?? "unknown"}\t${pr.title}`);
  }
}

async function showPr(repo, number) {
  if (!repo || !number) throw new Error("Usage: pull-board.js pr <repo> <number>  (e.g. pr language-server 527)");
  const { repository } = await gql(PR_QUERY, { owner: "marko-js", repo, number: Number(number) });
  const pr = repository?.pullRequest;
  if (!pr) throw new Error(`marko-js/${repo}#${number} not found`);
  const out = [pr.title, "----", pr.body?.trim() || "(no description)"];
  const issues = pr.closingIssuesReferences?.nodes ?? [];
  if (issues.length) {
    out.push("", "Linked issues:");
    for (const i of issues) out.push(`  #${i.number} ${i.title}`);
  }
  const isNoise = (p) =>
    /(^|\/)__(snapshots|tests)__\//.test(p) ||
    /\.(test|spec)\.[cm]?[jt]sx?$/.test(p) ||
    /(^|\/)sizes\.json$/.test(p);
  const files = pr.files?.nodes ?? [];
  const signal = files.filter((f) => !isNoise(f.path));
  if (files.length) {
    out.push("", `Changed files (${signal.length} of ${files.length}, test/generated hidden):`);
    for (const f of signal) out.push(`  ${f.path} (+${f.additions} -${f.deletions})`);
    if (!signal.length) out.push("  (only test/generated files changed)");
  }
  console.log(out.join("\n"));
}

async function showIssue(repo, number) {
  if (!repo || !number) throw new Error("Usage: pull-board.js issue <repo> <number>  (e.g. issue marko 3167)");
  const issue = await rest(`/repos/marko-js/${repo}/issues/${number}`);
  console.log(`${issue.title}\n----\n${issue.body ?? ""}`);
}

const [cmd, ...args] = process.argv.slice(2);
const command =
  cmd === "merged"
    ? () => pullMerged(args[0])
    : cmd === "contributors"
      ? () => pullContributors(args[0])
      : cmd === "pr"
        ? () => showPr(args[0], args[1])
        : cmd === "issue"
          ? () => showIssue(args[0], args[1])
          : cmd === "month"
            ? () => pullMonth(args[0])
            : () => pullMonth(cmd); // default: treat the first argument as the iteration title

command().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
