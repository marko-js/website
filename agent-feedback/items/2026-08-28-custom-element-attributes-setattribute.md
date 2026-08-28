---
type: dx
impact: med
effort: low
site: docs/reference/typescript.md › ### Registering a new native tag (e.g. for custom elements)
---

# State that attributes on a registered custom element are written with `setAttribute`, never as properties

Every attribute on a `marko.json`-registered custom element goes through marko `packages/runtime-tags/src/dom/dom.ts` › `_attr`, which is `setAttribute(element, name, normalizeAttrValue(value))` with no `name in element` or `customElements.get` branch, and the translator special-cases controllable properties for input, select, textarea, details and dialog alone, so a same-named property setter on the element class is never called. The example under `docs/reference/typescript.md` › ### Registering a new native tag (e.g. for custom elements) reads the other way: it declares `class RangeSliderElement extends HTMLElement { value = 0 }` beside `<range-slider/sliderEl value=threshold step=5 .../>`, so the class field holds its initial value while `getAttribute("value")` tracks the binding, and the class declares no `observedAttributes`, so as printed nothing in it picks the attribute up. State the positive rule on that section and on `docs/reference/native-tag.md`, and show the element-reference idiom for writing a property, `<x-datepicker/picker value=newDate/>` with `picker().value = newDate` from a `<script>` body. `docs/guide/library-integration.md` › ### Consuming in Marko and ### Using Marko in a Web Component are empty headings and are the natural second home for it.

Check: `sed -n '/export function _attr(/,/^}/p' packages/runtime-tags/src/dom/dom.ts` in the marko checkout shows the `setAttribute` call as the whole body. In a `linked: false` Vite page with `marko.json` = `{"<x-datepicker>":{"html":true}}` and an `x-datepicker` class defining `static get observedAttributes(){return["value"]}` plus a counting `set value(v)` and `attributeChangedCallback`, rendering `<let/newDate="2025-06-15"/><x-datepicker value=newDate/>` and then reassigning `newDate` reports `{ propertySets: 0, attributeSets: 2, setterCalls: [] }` with `outerHTML` `<x-datepicker value="2026-01-01"></x-datepicker>`. Rendering the typescript.md example with its class registered leaves `el.value` at its class-field value while `el.getAttribute("value")` goes `20` then `42`.
