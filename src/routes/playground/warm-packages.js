(async () => {
  try {
    const hash = location.hash.slice(1);
    if (!hash) return;
    const decoded = atob(hash.replace(/-/g, "+").replace(/_/g, "/"));
    if (!decoded.startsWith("v2")) return;
    const source = await new Response(
      new Response(
        Uint8Array.from(decoded.slice(2), (c) => c.charCodeAt(0)),
      ).body.pipeThrough(new DecompressionStream("gzip")),
    ).text();
    const packageJson = JSON.parse(source).find(
      (file) => file.path === "package.json",
    );
    if (!packageJson) return;

    const compare = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
    const pickVersion = (pack, range) => {
      const tagged = pack["dist-tags"]?.[range || "latest"];
      if (tagged) return tagged;
      if (pack.versions[range]) return range;
      const match = /^([\^~])(\d+)\.(\d+)\.(\d+)$/.exec(range);
      if (!match) return;
      const min = [+match[2], +match[3], +match[4]];
      const lockMinor = match[1] === "~" || min[0] === 0;
      let best;
      for (const version of Object.keys(pack.versions)) {
        const parts = version.split(".").map(Number);
        if (parts.length !== 3 || parts.some(isNaN)) continue;
        if (parts[0] !== min[0] || (lockMinor && parts[1] !== min[1])) continue;
        if (compare(parts, min) < 0) continue;
        if (!best || compare(parts, best) > 0) best = parts;
      }
      return best && best.join(".");
    };

    const seen = new Set(["marko", "@marko/compiler", "@marko/run"]);
    const warm = async (name, range, markoOnly) => {
      if (seen.has(name) || seen.size > 32) return;
      seen.add(name);
      try {
        const res = await fetch(
          "https://registry.npmjs.org/" + name.replace("/", "%2f"),
          { headers: { accept: "application/vnd.npm.install-v1+json" } },
        );
        if (!res.ok) return;
        const pack = await res.json();
        const meta = pack.versions[pickVersion(pack, range)];
        if (!meta) return;
        const isMarko =
          meta.dependencies?.marko || meta.peerDependencies?.marko;
        if (markoOnly && !isMarko) return;
        fetch(meta.dist.tarball).catch(() => {});
        if (isMarko) {
          for (const [depName, depRange] of Object.entries(
            meta.dependencies || {},
          )) {
            warm(depName, depRange, true);
          }
        }
      } catch {}
    };

    const pkg = JSON.parse(packageJson.content);
    for (const [name, range] of Object.entries({
      ...pkg.peerDependencies,
      ...pkg.devDependencies,
      ...pkg.dependencies,
    })) {
      warm(name, range);
    }
  } catch {}
})();
