---
type: bug
impact: high
effort: low
site: docs/guide/marko-5-interop.md › ### Tags API Syntax
---

# Sync the interop guide's Tags API tag list with `getFeatureTypeFromCoreTagName`

A single tag in this list decides which runtime compiles a whole file, so an omission reads as "still Class API" and the failure surfaces later as a compile error about a tag the Class runtime does not have. The guide names nine tags (`<const> <debug> <define> <id> <let> <lifecycle> <log> <return> <try>`) while `getFeatureTypeFromCoreTagName`, in marko's `packages/runtime-tags/src/translator/interop/feature-detection.ts`, returns the Tags type for twelve: it also maps `attrs`, `effect` and `show`. Both of the "these tags" links are line ranges into `blob/main` and both now miss the block they name, the Class range `#L180-L188` covering the top of the Tags cases and the Tags range `#L189-L198` starting past them. A line range into a moving branch cannot stay correct, so pin the links to a commit SHA or address the function by name, and guard the list itself against the next core tag with a test that reads the switch out of the installed `marko` package.

Check: `node -e 'const s=require("fs").readFileSync("node_modules/marko/dist/translator/index.js","utf8");console.log(s.match(/function getFeatureTypeFromCoreTagName[\s\S]*?\n}/)[0])'` prints twelve Tags cases against the guide's nine, and neither cited line range covers its `case` list; expect the two sets to be equal and each link to open on the switch.
