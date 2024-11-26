import fs from "node:fs/promises";
let staleStats: Stats | undefined;
let pendingStats = (async () => {
  try {
    return JSON.parse(await fs.readFile("stats.json", "utf8")) as Stats;
  } catch {}
})();
declare module "@marko/run" {
  interface Context {
    stats: Stats;
  }
}

type Stats = {
  lastUpdated: number;
  apps: {
    name: string;
    gitURL: string;
    gitBranch: string;
    jira: string;
    team: string;
    domain: string;
    owners: string[];
    pools: string[];
    capacity: number;
    packages: {
      [packageName: string]: [...version: string[]];
    };
  }[];
};

type DepsMeta = {
  meta: {
    [poolId: string]: Array<{
      name: string;
      value: [version: string];
    }>;
  };
  fetchTime: {
    [poolId: string]: number;
  };
  took: number;
};

type BuildMeta = {
  buildInfos: {
    activeManifest: string;
    appName: string;
    assemblerVersion: string;
    buildId: string;
    buildTag: string;
    capacity: number;
    ciLink: string;
    configManifest: string;
    configPackages: string[];
    domain: string;
    domainDL: string[];
    flavor: string;
    gitBranch: string;
    gitCommitId: string;
    gitUrl: string;
    jiraProject: string;
    lifeCycleState: string;
    owners: string[] | undefined;
    paasRealm: string;
    packageLink: string;
    poolId: string;
    poolName: string;
    raptorVersion: string;
    runtimeVersion: string;
    stack: string;
    team: string;
    teamDL: string[];
    tier: string;
    vpc: string;
  }[];
  took: number;
}[];

const handler: MarkoRun.Handler = async (ctx) => {
  // check updated 1 days ago
  ctx.stats = await getStats();
};

async function getStats() {
  if (staleStats) {
    return staleStats;
  }

  const stats = await pendingStats;
  if (stats && Date.now() - stats.lastUpdated < 86400000) {
    return stats;
  }

  staleStats = stats;
  pendingStats = loadStats();
  return staleStats || (pendingStats as Promise<Stats>);
}

async function loadStats() {
  const stats: Stats = {
    lastUpdated: Date.now(),
    apps: [],
  };
  const apps = {} as Record<string, Stats["apps"][number]>;
  const depsMeta = await api<DepsMeta>(
    "bundlesmeta?regexp=1&nkw=%28marko%7C%40marko%2Frun%29-%5B0-9%5D.*",
  );
  const poolIds = [...new Set(Object.keys(depsMeta.meta))];
  const buildMetas = (
    await Promise.all(
      batchPoolIdQueries(poolIds).map((query) => {
        return api<BuildMeta>(`poolbuildinfo?regexp=1&pkw=${query}`);
      }),
    )
  ).flat();

  for (const { buildInfos } of buildMetas) {
    for (const info of buildInfos) {
      const packages: Stats["apps"][number]["packages"] = {};
      for (const {
        name,
        value: [version],
      } of depsMeta.meta[info.poolName]) {
        const packageName = name.slice(0, -version.length - 1);
        const versions = (packages[packageName] ??= []);
        versions.push(version);
      }

      const app = apps[info.appName];

      if (!app) {
        apps[info.appName] = {
          name: info.appName,
          gitURL: info.gitUrl,
          gitBranch: info.gitBranch,
          jira: info.jiraProject,
          team: info.team,
          domain: info.domain,
          owners: info.owners || [],
          capacity: info.capacity,
          pools: [info.poolName],
          packages,
        };
      } else {
        if (info.owners) {
          app.owners = [...new Set([...app.owners, ...info.owners])];
        }
        app.capacity += info.capacity;
        app.pools.push(info.poolName);
        for (const packageName in packages) {
          app.packages[packageName] = [
            ...new Set([
              ...(app.packages[packageName] || []),
              ...packages[packageName],
            ]),
          ];
        }
      }
    }
  }

  stats.apps = Object.values(apps);
  fs.writeFile("stats.json", JSON.stringify(stats));
  staleStats = undefined;
  return stats;
}

// The queries for poolids only allow a maximum length of 1000 characters in the regexp.
// So we need to batch the poolids into multiple queries.
function batchPoolIdQueries(poolIds: string[]) {
  const queries = [];
  const len = poolIds.length;
  const sep = encodeURIComponent("|");
  let query = "";

  for (let i = 0; i < len; i++) {
    const encodedPoolId = encodeURIComponent(poolIds[i]);
    if (query.length + encodedPoolId.length + sep.length >= 998) {
      queries.push(`(${query})`);
      query = encodedPoolId;
    } else {
      query += query ? sep + encodedPoolId : encodedPoolId;
    }
  }

  if (query) {
    queries.push(`(${query})`);
  }

  return queries;
}

async function api<T>(url: string): Promise<T> {
  const res = await fetch(
    `https://powersearchweb.vip.qa.ebay.com/service/query/${url}`,
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }

  return res.json();
}

export default handler;
