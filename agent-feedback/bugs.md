# Suspected Bugs

Out-of-scope defects noticed while working on something else. Format and rules: [README.md](README.md).

## Build hangs instead of failing when a marko code fence cannot be formatted

`src/util/markodown.ts` › `acquireMutexLock` | 2026-07-28 | impact:high | effort:low

`acquireMutexLock` hands back the `resolve` of the promise the next caller
awaits, and the caller in `markoDocs`'s `walkTokens` only calls `unlock()` on
the success path. `compiler.compileSync` is wrapped in a `try`, but the four
`format(...)` calls that follow are not, so a snippet prettier cannot parse
rejects, `unlock()` never runs, and every later `acquireMutexLock()` awaits a
promise that will never settle. The build then hangs with no error naming the
offending file. Wrapping the locked section in `try`/`finally` fixes it.
Re-verify by making one `format` call throw unconditionally and running
`npm run build`: it hangs rather than reporting the failure.
