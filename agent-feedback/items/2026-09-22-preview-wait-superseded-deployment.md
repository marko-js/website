---
type: dx
impact: med
effort: low
site: .github/workflows/preview.yml › "Wait for GitHub Pages deployment"
---

# Treat a superseded Pages deployment as success in the preview wait step

The wait step exits 1 whenever the `github-pages` deployment for the pushed
`gh-pages` tip reports state `error`. GitHub records `error` on a deployment whose
`pages-build-deployment` run was cancelled, and that run is cancelled whenever a
later `gh-pages` push starts its own Pages build. Two PRs building previews within
a couple of minutes of each other are enough, so the step fails while the preview
is in fact published and serving. Because the failure aborts the job, the
"Post preview URL to PR" step never runs and the PR is left with a red check and no
link. Re-reading the deployment list for a newer `github-pages` deployment before
failing, or treating `error` as inconclusive and falling through to the existing
"posting the link anyway" path, would both avoid it.

Check: on a run where the step logged `failed (state: error)`, the corresponding
`pages-build-deployment` run has conclusion `cancelled` with its own deploy step
logging "Reported success!", and `curl -o /dev/null -w "%{http_code}"
https://markojs.com/previews/pr-<N>/` returns 200.
