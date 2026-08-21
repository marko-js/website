---
type: dx
impact: med
effort: low
site: docs/reference/language.md › ## Attributes
---

# Say that a dynamic `href` or `src` is encoded but not scheme-filtered

`## Attributes` introduces attribute values as plain JavaScript expressions and the only escaping statement on the page, the `[!NOTE]` under Dynamic Text, says interpolated values are escaped to avoid XSS, so a reader has no reason to treat a URL differently from any other string. Rendering `<a href=input.url>` with `javascript:alert(1)` emits `<a href=javascript:alert(1)>`, and `data:text/html,...` and `//evil.example/x` reach `href` and `src` unchanged. The encoding is doing its job (`x" onclick="alert(1)` comes back auto-quoted with `'`), so what is missing is only the statement that the scheme of a URL is the application's policy, and every neighboring hazard already has that statement: `$!{...}`, a string dynamic tag name, and native inline event handler attributes each carry a callout. Add the fourth beside `## Attributes`, saying Marko encodes attribute syntax and does not inspect what a URL-valued attribute points at, and pointing at where an allow-list belongs.

Check: `grep -rin 'javascript:\|url scheme\|protocol-relative' docs/ public/llms.txt` returns nothing today while a compiled `<a href=input.url>` renders `javascript:` verbatim; expect a callout under `## Attributes` in `docs/reference/language.md` matching the existing `$!{...}` and dynamic-tag-name warnings.
