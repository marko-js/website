# Suspected Bugs

Out-of-scope defects noticed while working on something else. Format and rules: [README.md](README.md).

## Point `core-tag.md`'s `<style>` links at the tag section instead of the `style=` attribute section

`docs/reference/core-tag.md` › `## <html-script> & <html-style>` | 2026-07-29 | impact:low | effort:low

`docs/reference/native-tag.md` has two headings that slug to the same base: the `style=` heading under Enhanced Attributes and the `<style>` heading under Enhanced Tags. `github-slugger` resolves collisions in document order, so the attribute section (line 56) takes `#style` while the tag section (line 533) becomes `#style-1`. Both `./native-tag.md#style` links in `core-tag.md` mean the `<style>` tag but land the reader on the unrelated `style=` attribute. `#script` is unaffected, since the `<script>` heading is the only one slugging to it. Prefer renaming one heading over hardcoding `#style-1`, which would rot silently if heading order ever changed. Re-verify from the repo root: `node --input-type=module -e "import S from './node_modules/github-slugger/index.js'; const s = new S(); for (const h of ['class=','style=','Event Handlers','<script>','<style>']) console.log(h, '->', s.slug(h))"` prints `style= -> style` and `<style> -> style-1`.
