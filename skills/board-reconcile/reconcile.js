#!/usr/bin/env node
// Reconcile the marko-js "Roadmap" project board against the PRs actually
// merged in a month, and fill in what is missing.
//
// No external dependencies: needs Node 18+ (uses the global `fetch`).
//
// Auth: set GITHUB_PROJECT_TOKEN to a GitHub PAT. `check` needs `read:project`
// and `repo`; `apply` needs `project` and `repo` (it writes to the board and
// assigns pull requests).
//
// Usage:
//   node skills/board-reconcile/reconcile.js check 2026-07
//   node skills/board-reconcile/reconcile.js apply 2026-07
//   node skills/board-reconcile/reconcile.js apply 2026-07 --limit 10
//   node skills/board-reconcile/reconcile.js coverage 2026-01 2026-07
//
// Field and option ids are resolved by name at run time, so renaming or
// reordering board options does not break this script. Only the project id is
// fixed; if the board is recreated, update PROJECT_ID by querying
// `organization(login: "marko-js") { projectV2(number: 2) { id } }`.

const token = process.env.GITHUB_PROJECT_TOKEN;
if (!token) {
  console.error(
    "Set GITHUB_PROJECT_TOKEN to a GitHub PAT (check: read:project + repo, apply: project + repo).",
  );
  process.exit(1);
}

const ORG = "marko-js";
const PROJECT_ID = "PVT_kwDOALUtoM0gQw"; // marko-js "Roadmap" (project #2)
// Assignee for pull requests whose author cannot be assigned (outside
// contributors). Mirrors how such PRs are already handled on the board.
const FALLBACK_ASSIGNEE = "DylanPiercey";
// Task used when a title carries no conventional-commit prefix. Every such
// title is printed so a human can correct the ones that deserve better.
const DEFAULT_TASK = "Chore";

// Which Epic a repository belongs to. Repos absent here are reported rather
// than guessed at.
const EPIC_BY_REPO = {
  marko: "Marko",
  run: "Marko Run",
  website: "Website",
  "language-server": "Language Tools",
  "htmljs-parser": "Language Tools",
  prettier: "Language Tools",
  eslint: "Language Tools",
  "tree-sitter": "Language Tools",
  zed: "Language Tools",
  vite: "Integrations",
  "resolve-sync": "Integrations",
  "relative-import-path": "Integrations",
  "testing-library": "Integrations",
  examples: "Community/Examples",
  cli: "Community/Examples",
};

// Which Task a conventional-commit prefix maps to.
const TASK_BY_PREFIX = {
  fix: "Fix",
  feat: "Feat",
  perf: "Perf",
  docs: "Docs",
  refactor: "Rework",
  chore: "Chore",
  test: "Chore",
  build: "Chore",
  ci: "Chore",
  style: "Chore",
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const FULL_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function gql(query, variables = {}) {
  let lastError;
  for (let attempt = 1; attempt <= 5; attempt++) {
    let res;
    try {
      res = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables }),
      });
    } catch (err) {
      lastError = err;
      await sleep(attempt * 500);
      continue;
    }
    if (res.status === 429 || res.status >= 500) {
      const retryAfter = Number(res.headers.get("retry-after"));
      lastError = new Error(`GitHub API ${res.status} ${res.statusText}`);
      await sleep(retryAfter > 0 ? retryAfter * 1000 : attempt * 1000);
      continue;
    }
    const json = await res.json().catch(() => ({}));
    if (json.errors) {
      const message = JSON.stringify(json.errors);
      if (/rate limit|abuse/i.test(message) && attempt < 5) {
        await sleep(attempt * 3000);
        continue;
      }
      throw new Error(`GitHub GraphQL error: ${message}`);
    }
    return json.data;
  }
  throw lastError ?? new Error("request failed");
}

// Walk a Relay connection fully.
async function collect(runPage) {
  const all = [];
  let cursor = null;
  for (let page = 0; page < 1000; page++) {
    const conn = await runPage(cursor);
    all.push(...conn.nodes);
    const { hasNextPage, endCursor } = conn.pageInfo;
    if (!hasNextPage || endCursor == null || endCursor === cursor) break;
    cursor = endCursor;
  }
  return all;
}

const FIELDS_QUERY = `
  query ($project: ID!) {
    node(id: $project) {
      ... on ProjectV2 {
        fields(first: 50) {
          nodes {
            ... on ProjectV2FieldCommon { id name }
            ... on ProjectV2SingleSelectField { id name options { id name } }
            ... on ProjectV2IterationField {
              id name
              configuration {
                iterations { id title }
                completedIterations { id title }
              }
            }
          }
        }
      }
    }
  }
`;

const ITEMS_QUERY = `
  query ($project: ID!, $cursor: String) {
    node(id: $project) {
      ... on ProjectV2 {
        items(first: 100, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id
            content {
              __typename
              ... on PullRequest {
                number title repository { name } author { login }
                assignees(first: 10) { nodes { login } }
              }
              ... on Issue {
                number title repository { name }
                assignees(first: 10) { nodes { login } }
              }
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
      issueCount
      pageInfo { hasNextPage endCursor }
      nodes {
        ... on PullRequest {
          id number title mergedAt repository { name } author { login }
        }
      }
    }
  }
`;

const fieldValue = (item, name) => {
  const node = item.fieldValues.nodes.find((n) => n.field?.name === name);
  return node?.name ?? node?.title;
};

const isBot = (login) =>
  !login || login === "github-actions" || /\[bot\]$/.test(login);

const refOf = (pr) => `${pr.repository.name}#${pr.number}`;

const prefixOf = (title) => {
  const m = /^([a-z]+)(\(|:)/.exec(title ?? "");
  return m ? m[1] : null;
};

// Fallback for titles without a conventional-commit prefix. Ordered: the
// first matching rule wins. Anything unmatched still defaults to Chore and is
// listed by `check` for a person to read.
const TASK_BY_TITLE = [
  // agent-feedback backlog bookkeeping (adding or dropping items) is tooling work.
  [/^agent-feedback:|\bagent-feedback item\b/i, "Chore"],
  [
    /^(docs?|cheatsheet|documentation)\b|^(document|note|say|record|explain|clarify)\b|\bwon't-fix\b|\bcheat ?sheet\b|\bdocs\b|\breadme\b/i,
    "Docs",
  ],
  [/\b(sizes\.json|snapshots?|devDependency|fixtures?|ci)\b/i, "Chore"],
  [
    /^(fix|error|report|guard|escape|decode|keep|stop|forward|resolve|diagnose|disambiguate|bound|match|only|await|detect|correct|handle|prevent|avoid|preserve|restore|reject|mint|emit|hoist|name|drop|mark|decide)\b|\bfix(es)?\b/i,
    "Fix",
  ],
  [
    /^(add|support|suggest|serve|persisted pages|implement|introduce|allow|enable)\b/i,
    "Feat",
  ],
];
const taskFromTitle = (title) => {
  for (const [re, task] of TASK_BY_TITLE) if (re.test(title ?? "")) return task;
  return null;
};

function parseMonth(ym) {
  if (!/^\d{4}-\d{2}$/.test(ym ?? "")) {
    throw new Error("Expected a month as YYYY-MM, e.g. 2026-07");
  }
  const [year, month] = ym.split("-").map(Number);
  if (month < 1 || month > 12) throw new Error(`Bad month: ${ym}`);
  const lastDay = new Date(year, month, 0).getDate();
  return {
    ym,
    year,
    month,
    from: `${ym}-01`,
    to: `${ym}-${String(lastDay).padStart(2, "0")}`,
    // The board mostly uses "Jul 2026", with a few older ones spelled out.
    titles: [
      `${MONTHS[month - 1]} ${year}`,
      `${FULL_MONTHS[month - 1]} ${year}`,
    ],
  };
}

// GitHub search returns at most 1000 results for a query, so split the date
// range until each slice fits.
async function searchMerged(from, to) {
  const q = `org:${ORG} is:pr is:merged merged:${from}..${to}`;
  const first = await gql(SEARCH_QUERY, { q, cursor: null });
  if (first.search.issueCount > 990 && from !== to) {
    const mid = new Date((Date.parse(from) + Date.parse(to)) / 2)
      .toISOString()
      .slice(0, 10);
    const nextDay = new Date(Date.parse(mid) + 86400000)
      .toISOString()
      .slice(0, 10);
    const [a, b] = [
      await searchMerged(from, mid),
      await searchMerged(nextDay, to),
    ];
    const seen = new Set();
    return [...a, ...b].filter((pr) => {
      const k = refOf(pr);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }
  const nodes = await collect(async (cursor) =>
    cursor === null
      ? first.search
      : (await gql(SEARCH_QUERY, { q, cursor })).search,
  );
  return nodes.filter((pr) => pr?.repository);
}

async function loadBoard() {
  const data = await gql(FIELDS_QUERY, { project: PROJECT_ID });
  const fields = {};
  for (const f of data.node.fields.nodes) {
    if (f?.name) fields[f.name] = f;
  }
  const items = await collect(
    async (cursor) =>
      (await gql(ITEMS_QUERY, { project: PROJECT_ID, cursor })).node.items,
  );
  const byRef = new Map();
  for (const item of items) {
    const c = item.content;
    if (!c?.repository) continue;
    byRef.set(`${c.repository.name}#${c.number}`, {
      itemId: item.id,
      type: c.__typename,
      title: c.title,
      author: c.author?.login,
      assignees: (c.assignees?.nodes ?? []).map((n) => n.login),
      iteration: fieldValue(item, "Iteration"),
      epic: fieldValue(item, "Epic"),
      task: fieldValue(item, "Task"),
      status: fieldValue(item, "Status"),
    });
  }
  return { fields, items, byRef };
}

function optionId(fields, fieldName, optionName) {
  const opt = fields[fieldName]?.options?.find((o) => o.name === optionName);
  if (!opt)
    throw new Error(`No "${optionName}" option on the ${fieldName} field`);
  return { fieldId: fields[fieldName].id, optionId: opt.id };
}

function iterationId(fields, titles) {
  const cfg = fields.Iteration?.configuration;
  if (!cfg) throw new Error("No Iteration field on the board");
  const all = [...cfg.iterations, ...cfg.completedIterations];
  for (const t of titles) {
    const hit = all.find((i) => i.title === t);
    if (hit)
      return {
        fieldId: fields.Iteration.id,
        iterationId: hit.id,
        title: hit.title,
      };
  }
  throw new Error(
    `No iteration titled ${titles.map((t) => `"${t}"`).join(" or ")}. Available: ${all.map((i) => i.title).join(", ")}`,
  );
}

// Work out what each merged PR should look like on the board.
function plan(merged, board, iterationTitle) {
  const rows = [];
  const unknownRepo = [];
  const unprefixed = [];
  for (const pr of merged) {
    const ref = refOf(pr);
    const repo = pr.repository.name;
    const epic = EPIC_BY_REPO[repo];
    if (!epic) {
      unknownRepo.push({ ref, repo, title: pr.title });
      continue;
    }
    const prefix = prefixOf(pr.title);
    let task = prefix ? TASK_BY_PREFIX[prefix] : null;
    if (!task) {
      task = taskFromTitle(pr.title);
      unprefixed.push({ ref, title: pr.title, task: task ?? DEFAULT_TASK });
    }
    const existing = board.byRef.get(ref);
    rows.push({
      ref,
      prId: pr.id,
      title: pr.title,
      author: pr.author?.login,
      epic,
      task: task ?? DEFAULT_TASK,
      guessedTask: !task,
      itemId: existing?.itemId ?? null,
      onBoard: Boolean(existing),
      needsIteration: existing?.iteration !== iterationTitle,
      needsEpic: existing?.epic !== epic,
      needsTask: !existing?.task,
      needsStatus: existing?.status !== "Done",
      needsAssignee: !(existing?.assignees ?? []).length,
    });
  }
  return { rows, unknownRepo, unprefixed };
}

function report(month, merged, board, planned, iterationTitle) {
  const { rows, unknownRepo, unprefixed } = planned;
  const missing = rows.filter((r) => !r.onBoard);
  const wrongIteration = rows.filter((r) => r.onBoard && r.needsIteration);
  const needsField = rows.filter(
    (r) =>
      r.onBoard &&
      !r.needsIteration &&
      (r.needsEpic || r.needsTask || r.needsStatus),
  );
  const needsAssignee = rows.filter((r) => r.needsAssignee);

  const onIteration = [...board.byRef.values()].filter(
    (b) => b.iteration === iterationTitle,
  ).length;
  // Only pull requests are expected to line up with the merged list. Issues
  // are tracked on an iteration as planning items and are left alone.
  const mergedRefs = new Set(rows.map((r) => r.ref));
  const stale = [...board.byRef.entries()].filter(
    ([ref, b]) =>
      b.iteration === iterationTitle &&
      b.type === "PullRequest" &&
      !mergedRefs.has(ref),
  );
  const issuesOnIteration = [...board.byRef.values()].filter(
    (b) => b.iteration === iterationTitle && b.type === "Issue",
  ).length;

  console.log(`Month ${month.ym}  (iteration "${iterationTitle}")`);
  console.log(`  merged, non-bot:            ${rows.length}`);
  console.log(`  already on this iteration:  ${onIteration}`);
  console.log("");
  console.log(`  missing from the board:     ${missing.length}`);
  console.log(`  wrong or absent iteration:  ${wrongIteration.length}`);
  console.log(`  missing Epic/Task/Status:   ${needsField.length}`);
  console.log(`  missing an assignee:        ${needsAssignee.length}`);
  console.log(
    `  pull requests on the iteration but not merged this month: ${stale.length}`,
  );
  if (issuesOnIteration) {
    console.log(
      `  (plus ${issuesOnIteration} issue(s) tracked on this iteration, left alone)`,
    );
  }

  if (unknownRepo.length) {
    console.log(
      `\n  NO EPIC MAPPING for ${unknownRepo.length} PR(s); add the repo to EPIC_BY_REPO:`,
    );
    for (const u of [...new Set(unknownRepo.map((u) => u.repo))])
      console.log(`    ${u}`);
  }
  if (unprefixed.length) {
    console.log(
      `\n  ${unprefixed.length} title(s) with no recognized conventional-commit prefix (Task inferred from the title, else ${DEFAULT_TASK}):`,
    );
    for (const u of unprefixed)
      console.log(`    ${u.task.padEnd(5)} ${u.ref}\t${u.title}`);
  }
  if (stale.length) {
    console.log(
      `\n  Pull requests on "${iterationTitle}" but not merged in ${month.ym}:`,
    );
    for (const [ref, b] of stale.slice(0, 20))
      console.log(`    ${ref}\t${b.title}`);
    if (stale.length > 20) console.log(`    ... and ${stale.length - 20} more`);
  }
  return { missing, wrongIteration, needsField, needsAssignee, stale };
}

const ADD_ITEM = `mutation($p:ID!,$c:ID!){addProjectV2ItemById(input:{projectId:$p,contentId:$c}){item{id}}}`;
const SET_SELECT = `mutation($p:ID!,$i:ID!,$f:ID!,$v:String!){updateProjectV2ItemFieldValue(input:{projectId:$p,itemId:$i,fieldId:$f,value:{singleSelectOptionId:$v}}){projectV2Item{id}}}`;
const SET_ITER = `mutation($p:ID!,$i:ID!,$f:ID!,$v:String!){updateProjectV2ItemFieldValue(input:{projectId:$p,itemId:$i,fieldId:$f,value:{iterationId:$v}}){projectV2Item{id}}}`;
const ASSIGN = `mutation($id:ID!,$who:[ID!]!){addAssigneesToAssignable(input:{assignableId:$id,assigneeIds:$who}){clientMutationId}}`;

async function resolveUsers(logins) {
  const unique = [...new Set(logins.filter(Boolean))];
  const out = {};
  for (let i = 0; i < unique.length; i += 50) {
    const batch = unique.slice(i, i + 50);
    const q =
      "query{" +
      batch
        .map((l, n) => `u${n}: user(login:${JSON.stringify(l)}){id login}`)
        .join(" ") +
      "}";
    const data = await gql(q);
    for (let n = 0; n < batch.length; n++) {
      const u = data[`u${n}`];
      if (u) out[u.login] = u.id;
    }
  }
  return out;
}

async function apply(month, limit) {
  const board = await loadBoard();
  const iter = iterationId(board.fields, month.titles);
  const merged = (await searchMerged(month.from, month.to)).filter(
    (pr) => !isBot(pr.author?.login),
  );
  const planned = plan(merged, board, iter.title);
  const buckets = report(month, merged, board, planned, iter.title);

  const todo = planned.rows.filter(
    (r) =>
      !r.onBoard ||
      r.needsIteration ||
      r.needsEpic ||
      r.needsTask ||
      r.needsStatus ||
      r.needsAssignee,
  );
  const slice = Number.isFinite(limit) ? todo.slice(0, limit) : todo;
  if (!slice.length) {
    console.log("\nNothing to do.");
    return;
  }
  console.log(`\nApplying ${slice.length} of ${todo.length} item(s)...`);

  const epicOpt = {};
  for (const name of new Set(slice.map((r) => r.epic)))
    epicOpt[name] = optionId(board.fields, "Epic", name);
  const taskOpt = {};
  for (const name of new Set(slice.map((r) => r.task)))
    taskOpt[name] = optionId(board.fields, "Task", name);
  const doneOpt = optionId(board.fields, "Status", "Done");
  const users = await resolveUsers([
    ...slice.map((r) => r.author),
    FALLBACK_ASSIGNEE,
  ]);

  let ok = 0,
    fellBack = 0;
  const failures = [];
  for (const r of slice) {
    try {
      let itemId = r.itemId;
      if (!itemId) {
        const added = await gql(ADD_ITEM, { p: PROJECT_ID, c: r.prId });
        itemId = added.addProjectV2ItemById.item.id;
      }
      if (!r.onBoard || r.needsIteration) {
        await gql(SET_ITER, {
          p: PROJECT_ID,
          i: itemId,
          f: iter.fieldId,
          v: iter.iterationId,
        });
      }
      if (!r.onBoard || r.needsEpic) {
        await gql(SET_SELECT, {
          p: PROJECT_ID,
          i: itemId,
          f: epicOpt[r.epic].fieldId,
          v: epicOpt[r.epic].optionId,
        });
      }
      if (!r.onBoard || r.needsTask) {
        await gql(SET_SELECT, {
          p: PROJECT_ID,
          i: itemId,
          f: taskOpt[r.task].fieldId,
          v: taskOpt[r.task].optionId,
        });
      }
      if (!r.onBoard || r.needsStatus) {
        await gql(SET_SELECT, {
          p: PROJECT_ID,
          i: itemId,
          f: doneOpt.fieldId,
          v: doneOpt.optionId,
        });
      }
      if (r.needsAssignee) {
        const primary = users[r.author];
        try {
          if (!primary) throw new Error("author not resolvable");
          await gql(ASSIGN, { id: r.prId, who: [primary] });
        } catch {
          // Outside contributors cannot always be assigned.
          await gql(ASSIGN, { id: r.prId, who: [users[FALLBACK_ASSIGNEE]] });
          fellBack++;
        }
      }
      ok++;
      if (ok % 25 === 0) process.stdout.write(`  ${ok}/${slice.length}\r`);
    } catch (err) {
      failures.push({ ref: r.ref, error: String(err.message).slice(0, 200) });
    }
    await sleep(110);
  }
  console.log(
    `\nApplied ${ok}/${slice.length}` +
      (fellBack
        ? ` (assignee fell back to ${FALLBACK_ASSIGNEE} on ${fellBack})`
        : ""),
  );
  if (failures.length) {
    console.log(`Failures (${failures.length}):`);
    for (const f of failures.slice(0, 20))
      console.log(`  ${f.ref}: ${f.error}`);
  }
  if (buckets.stale.length) {
    console.log(
      `\n${buckets.stale.length} item(s) sit on "${iter.title}" without being merged that month; review them by hand.`,
    );
  }
}

async function check(month) {
  const board = await loadBoard();
  const iter = iterationId(board.fields, month.titles);
  const merged = (await searchMerged(month.from, month.to)).filter(
    (pr) => !isBot(pr.author?.login),
  );
  report(month, merged, board, plan(merged, board, iter.title), iter.title);
}

async function coverage(fromYm, toYm) {
  const board = await loadBoard();
  const start = parseMonth(fromYm);
  const end = parseMonth(toYm ?? fromYm);
  console.log("month      merged  onBoard  covered  coverage");
  for (
    let y = start.year, m = start.month;
    y < end.year || (y === end.year && m <= end.month);
    m === 12 ? ((y += 1), (m = 1)) : (m += 1)
  ) {
    const month = parseMonth(`${y}-${String(m).padStart(2, "0")}`);
    let title;
    try {
      title = iterationId(board.fields, month.titles).title;
    } catch {
      title = month.titles[0];
    }
    const merged = (await searchMerged(month.from, month.to)).filter(
      (pr) => !isBot(pr.author?.login),
    );
    const onBoard = [...board.byRef.entries()].filter(
      ([, b]) => b.iteration === title,
    );
    const refs = new Set(onBoard.map(([ref]) => ref));
    const covered = merged.filter((pr) => refs.has(refOf(pr))).length;
    // Floor rather than round, so a single missing item cannot read as 100%.
    const pct = merged.length
      ? String(Math.floor((covered / merged.length) * 100))
      : "-";
    console.log(
      `${title.padEnd(10)} ${String(merged.length).padStart(5)}  ${String(onBoard.length).padStart(6)}  ${String(covered).padStart(7)}  ${pct.padStart(6)}%`,
    );
  }
}

const [cmd, ...args] = process.argv.slice(2);
const limitFlag = args.indexOf("--limit");
const limit = limitFlag > -1 ? Number(args[limitFlag + 1]) : Infinity;
const positional = args.filter(
  (a, i) => !a.startsWith("--") && !(limitFlag > -1 && i === limitFlag + 1),
);

const run =
  cmd === "check"
    ? () => check(parseMonth(positional[0]))
    : cmd === "apply"
      ? () => apply(parseMonth(positional[0]), limit)
      : cmd === "coverage"
        ? () => coverage(positional[0], positional[1])
        : () => {
            throw new Error(
              "Usage: reconcile.js <check|apply|coverage> <YYYY-MM> [--limit N]",
            );
          };

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
