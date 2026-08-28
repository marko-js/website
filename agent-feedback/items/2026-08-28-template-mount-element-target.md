---
type: dx
impact: med
effort: low
site: docs/reference/template.md › ## `Template.mount(input, node, position?)`
---

# State that `Template.mount` renders into an element, not a ShadowRoot or DocumentFragment

`Template.mount` describes `node` as "a reference to the DOM node" and marko `packages/runtime-tags/index.d.ts` types it `reference: Node`, so a `ShadowRoot` or a `DocumentFragment` type-checks, while two deliberate runtime decisions make either target unusable. `dom/renderer.ts` hands the parent's `namespaceURI` to `dom/parse-html.ts` › `parseHTML`, which keys its cached `<template>` parser on it, so a namespace-less parent parses the markup as foreign content: `<button>` and `<input>` come back with `namespaceURI === null` and without their `HTMLElement` prototypes, `click` and `focus` are undefined, and the `<input>` is not a form control. Separately, `dom/event.ts` › `delegate` installs one capture listener on `document`, and a shadow tree's events are re-targeted to the host before they reach it, so `onClick` and `value:=` inside a shadow tree stay quiet. Both decisions carry a won't-fix comment in marko source and neither is stated on the site, so put the positive rule on the `Template.mount` section and under `docs/reference/native-tag.md` › #### Delegation: `mount` renders into an element, and a Marko island inside a web component attaches its own root element and mounts there.

Check: build a `linked: false` Vite page that mounts `<let/count=0/><let/text="a"/><button class="k49-btn" onClick(){count++}>clicked ${count}</button><input class="k49-input" value:=text><div class="k49-text">text=${text}</div>` into a light `<div>`, into `host.attachShadow({mode:"open"})` and into a `DocumentFragment` later appended to the document, then drive each with a real `page.mouse.click` and a composed `input` event. The light target reports `HTMLButtonElement`/`HTMLInputElement` and reaches `clicked 1` and `text=light-typed`; the shadow target reports `Element`/`Element`, serializes as `<input class="k49-input"></input>` and stays at `clicked 0` and `text=a` with an empty `pageErrors`; the appended fragment reaches `clicked 1` while keeping its null-namespace nodes. In the marko checkout `grep -rn -i shadow packages/runtime-tags/src/dom/` prints the two won't-fix comments, in `parse-html.ts` and `event.ts`.
