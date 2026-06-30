#!/usr/bin/env node
// Publish the Marko newsletter to the ATmosphere as standard.site records.
//
// Each issue under docs/newsletter/*.md becomes a `site.standard.document`
// record in the markojs.com repository, alongside a single
// `site.standard.publication` record that describes the newsletter. standard.site
// aware indexers and AppViews then discover the issues without any proprietary
// handoff. See https://standard.site/docs/introduction/.
//
// No external dependencies: needs Node 18+ (uses the global `fetch`).
//
// Auth: the records are written to an existing AT Protocol account (markojs.com
// on the Bluesky PDS). Set:
//   BLUESKY_IDENTIFIER   handle or DID of the account (default: markojs.com)
//   BLUESKY_APP_PASSWORD app password from Settings -> App Passwords (required)
//   BLUESKY_PDS          entryway used to open the session (default: https://bsky.social)
//
// Usage:
//   node skills/newsletter/publish-standard-site.js            # upsert every issue
//   node skills/newsletter/publish-standard-site.js --dry-run  # print records, write nothing
//
// Re-running is idempotent: the publication uses rkey `self` and each document
// uses its slug as the rkey, so putRecord overwrites rather than duplicating.

import fs from "node:fs";
import path from "node:path";

const dryRun = process.argv.includes("--dry-run");

const identifier = process.env.BLUESKY_IDENTIFIER || "markojs.com";
const appPassword = process.env.BLUESKY_APP_PASSWORD;
const entryway = (process.env.BLUESKY_PDS || "https://bsky.social").replace(
  /\/+$/,
  "",
);

if (!appPassword && !dryRun) {
  console.error(
    "Set BLUESKY_APP_PASSWORD to an app password for the newsletter account " +
      "(Settings -> Privacy and Security -> App Passwords). Pass --dry-run to " +
      "preview the records without it.",
  );
  process.exit(1);
}

const newsletterDir = path.join(process.cwd(), "docs", "newsletter");
const site = `https://${fs
  .readFileSync(path.join(process.cwd(), "public", "CNAME"), "utf-8")
  .trim()}`;

const PUBLICATION_COLLECTION = "site.standard.publication";
const DOCUMENT_COLLECTION = "site.standard.document";
const PUBLICATION_RKEY = "self";
const MAX_RETRIES = 4;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// fetch with retry/backoff on network failures and 5xx, matching pull-board.js.
async function apiFetch(url, init = {}) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    let res;
    try {
      res = await fetch(url, init);
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES) await sleep(attempt * 500);
      continue;
    }
    if (res.status >= 500 && attempt < MAX_RETRIES) {
      lastError = new Error(`${res.status} ${res.statusText}`);
      await sleep(attempt * 1000);
      continue;
    }
    return res;
  }
  throw lastError ?? new Error(`request to ${url} failed`);
}

async function xrpc(endpoint, method, { token, body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await apiFetch(`${endpoint}/xrpc/${method}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error(
      `${method} failed: ${res.status} ${json.error ?? ""} ${json.message ?? text}`.trim(),
    );
  }
  return json;
}

// Reduce markdown to readable plain text for the document's `textContent`.
function markdownToText(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, "") // fenced code blocks
    .replace(/^>\s?\[![^\]]+\][^\n]*$/gm, "") // callout headers ([!TLDR] etc.)
    .replace(/^#{1,6}\s+/gm, "") // heading markers
    .replace(/^>\s?/gm, "") // blockquote markers
    .replace(/!?\[([^\]]+)\]\([^)]+\)/g, "$1") // links and images -> text
    .replace(/[`*_]/g, "") // inline code / emphasis
    .replace(/\n{3,}/g, "\n\n") // collapse blank runs
    .trim();
}

function readIssues() {
  return fs
    .readdirSync(newsletterDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const slug = file.slice(0, -".md".length);
      const content = fs.readFileSync(path.join(newsletterDir, file), "utf-8");
      const summary = content
        .split("\n")
        .filter((line) => line.startsWith("> - "))
        .map((line) => line.slice("> - ".length).trim())
        .join(" ");
      return {
        slug,
        date: new Date(`${slug.replace("-", " ")} 1 UTC`),
        title: (content.match(/^#\s+(.+)$/m)?.[1] ?? slug).trim(),
        description: summary,
        textContent: markdownToText(content),
      };
    })
    .filter((issue) => !Number.isNaN(+issue.date))
    .sort((a, b) => +b.date - +a.date);
}

function publicationRecord() {
  return {
    $type: PUBLICATION_COLLECTION,
    name: "Marko Newsletter",
    description: "Monthly updates from the Marko team.",
    url: site,
  };
}

function documentRecord(issue, publicationUri) {
  return {
    $type: DOCUMENT_COLLECTION,
    site: publicationUri,
    title: issue.title,
    path: `/docs/newsletter/${issue.slug}`,
    description: issue.description,
    textContent: issue.textContent,
    publishedAt: issue.date.toISOString(),
    tags: ["marko", "newsletter"],
  };
}

// Open a session against the entryway, then resolve the account's real PDS from
// the returned DID document so writes go straight to the host that owns the repo.
async function login() {
  const session = await xrpc(entryway, "com.atproto.server.createSession", {
    body: { identifier, password: appPassword },
  });
  const pds =
    session.didDoc?.service?.find((s) => s.id?.endsWith("#atproto_pds"))
      ?.serviceEndpoint ?? entryway;
  return { did: session.did, token: session.accessJwt, pds };
}

async function putRecord({ pds, token, did, collection, rkey, record }) {
  return xrpc(pds, "com.atproto.repo.putRecord", {
    token,
    body: { repo: did, collection, rkey, record, validate: false },
  });
}

async function main() {
  const issues = readIssues();
  if (!issues.length) {
    console.error(`No issues found in ${newsletterDir}`);
    process.exit(1);
  }

  if (dryRun) {
    const publicationUri = `at://${identifier}/${PUBLICATION_COLLECTION}/${PUBLICATION_RKEY}`;
    console.log(`# ${PUBLICATION_COLLECTION} (rkey: ${PUBLICATION_RKEY})`);
    console.log(JSON.stringify(publicationRecord(), null, 2));
    for (const issue of issues) {
      console.log(`\n# ${DOCUMENT_COLLECTION} (rkey: ${issue.slug})`);
      console.log(JSON.stringify(documentRecord(issue, publicationUri), null, 2));
    }
    console.log(`\nDry run: ${issues.length} document(s), nothing written.`);
    return;
  }

  const { did, token, pds } = await login();
  console.log(`Authenticated as ${did} (${pds})`);

  const publication = await putRecord({
    pds,
    token,
    did,
    collection: PUBLICATION_COLLECTION,
    rkey: PUBLICATION_RKEY,
    record: publicationRecord(),
  });
  console.log(`publication -> ${publication.uri}`);

  for (const issue of issues) {
    const doc = await putRecord({
      pds,
      token,
      did,
      collection: DOCUMENT_COLLECTION,
      rkey: issue.slug,
      record: documentRecord(issue, publication.uri),
    });
    console.log(`  ${issue.slug} -> ${doc.uri}`);
  }

  console.log(`Published ${issues.length} document(s).`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
