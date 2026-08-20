---
type: unclear
impact: low
effort: low
site: docs/reference/template.md › Template.mount(input, node, position?)
---

# Mark `Template.mount`'s `node` param as required, not `Default: undefined`

The `Template.mount(input, node, position?)` parameter table lists a Default of `{}` for `input` and `"beforeend"` for `position`, both real defaults, but `undefined` for `node`, which reads as "node is optional and defaults to undefined". `node` is required: `packages/runtime-tags/index.d.ts` in the marko repo declares `mount(input, reference: Node, position?)` with `reference` non-optional, and `packages/runtime-tags/src/dom/template.ts` › `mount` defaults only `input = {}` while `reference` has no default and is dereferenced unconditionally, so `template.mount(input)` is a type error and throws at runtime. The doc's own examples always pass a node. Agents treat parameter tables as the machine-readable contract: an agent building a client mount or test harness reads "node: Default undefined", writes `template.mount(input)` expecting a detached mount, and burns a debug cycle, or ships code that crashes on the undefined reference. Replace the `undefined` cell with "required", or split required params from defaulted ones, so the table agrees with the `reference: Node` signature.

Check: read the parameter table under the `Template.mount` heading in `docs/reference/template.md`.
