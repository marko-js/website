---
type: dx
impact: low
effort: low
site: docs/reference/language.md › ### Dynamic Text
---

# State the per-context escaping rules for `${}`, static text, `<textarea>` bodies and `<html-comment>`

`docs/reference/language.md` › ### Dynamic Text says only that an interpolated value is "automatically escaped to avoid XSS", and ## Attributes says an attribute literal is a JavaScript string rather than an html attribute string. The runtime rules are per-context, each deliberate and carrying an intent comment, and they are stated on no page or cheatsheet: `${}` in text escapes `<`, `&` and CR to `&lt;`, `&amp;` and `&#13;` and leaves `>` alone (marko `packages/runtime-tags/src/html/content.ts` › `_escape`); static text is emitted verbatim, so `&copy;`, `&#169;`, `&unknownent;` and a bare `&` all survive; a static `<textarea>` body is decoded and then re-escaped by the value path (`translator/core/textarea.ts`), the one text context where a static body is rewritten; `<html-comment>` escapes `>` alone (`content.ts` › `_escape_comment`); and a dynamic attribute value escapes the quote character in use, CR, and an `&` that would start a character reference (`html/attrs.ts` › `escapeDoubleQuotedAttrValue`), so an interpolated `a & b < c > d` round-trips into the attribute unchanged. Readers pasting markup that carries character references need the rule per context to predict the output. Add the character sets under ### Dynamic Text and ## Attributes, the decode rule under `docs/reference/native-tag.md` › #### `<textarea>`, and the comment rule under `docs/reference/core-tag.md` › ## `<html-comment>`.

```marko
<div title="&amp;">ampent</div>
<p>x &amp; y &copy; &#169; &unknownent; & z</p>
<textarea>note &lt; & more</textarea>
<span>${"<b>&amp;"}</span>
<html-comment>${"a > b < c"}</html-comment>
<div title=`${"a & b < c > d"}`>attr-interp</div>
```

Check: render the template above with marko 6.3.46 html output. It prints `<div title="&amp;amp;">ampent</div><p>x &amp; y &copy; &#169; &unknownent; & z</p><textarea>note &lt; &amp; more</textarea><span>&lt;b>&amp;amp;</span><!--a &gt; b < c--><div title="a & b < c > d">attr-interp</div>`. `grep -n -i 'escap\|character reference\|entit' docs/reference/language.md` matches only the XSS note and the Unescaped Text section, and the same grep over `docs/reference/native-tag.md` exits 1.
