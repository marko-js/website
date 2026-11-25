# Separation of Concerns

> [!TLDR]
>
> - Separating files by technology (HTML, CSS, JS) splits single features across multiple files
> - Co-locating markup, scoped styles, and behavior separates code by functional concern instead
> - Component boundaries align with feature and domain responsibilities rather than file extensions

Co-locating markup, styling, and reactive logic inside a single `.marko` file often raises a question: does this violate separation of concerns? The principle argues for separating distinct **responsibilities**, not separating programming languages.

## Technology vs. Functionality

Consider a modal dialog organized by file extension:

```html
/* modal.html */
<button id="open-modal">Open Modal</button>
<div id="modal" class="modal">
  <button id="close-modal">&times;</button>
  <p>Modal content...</p>
</div>
```

```css
/* modal.css */
.modal {
  display: none;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border: 1px solid black;
}
```

```js
/* modal.js */
function openModal() {
  document.getElementById("modal").style.display = "block";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

document.getElementById("open-modal").addEventListener("click", openModal);
document.getElementById("close-modal").addEventListener("click", closeModal);
```

This layout separates **technologies**, not **concerns**. Every real concern of the modal (open/close state, backdrop layout, keyboard Escape handling, focus management) cuts across HTML, CSS, and JavaScript at once. Adding a single behavior such as closing on Escape or clicking outside forces coordinated edits across all three files, invites orphaned CSS selectors and stale DOM IDs, and fragments the mental model of one feature.

## Organizing by Feature

In Marko, a component groups everything required for one piece of functionality into a single file, using [CSS Modules](../guide/styling.md#inline-css-modules) (`<style/styles>`) when class names should be scoped to the component:

```marko
<let/open=false/>

<button onClick() { open = true }>Open Modal</button>

<div class=styles.modal style={ display: open ? "block" : "none" }>
  <button onClick() { open = false }>&times;</button>
  <p>Modal content...</p>
</div>

<style/styles>
  .modal {
    display: none;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border: 1px solid black;
  }
</style>
```

State, markup, event handling, and scoped styles live together and move together when refactored or reused.

## Drawing Boundaries

Marko lets applications draw boundaries along functional lines (components, features, domains, and lower-level utilities) and adjust them as requirements evolve. For example, an inline formatted phone input inside a form:

```marko
<form>
  <label>
    Phone Number:
    <let/phoneNumber=""/>
    <input
      name="phone"
      type="tel"
      value=phoneNumber
      valueChange(value) {
        phoneNumber = value.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
      }
    />
  </label>
  <button type="submit">Submit</button>
</form>
```

can be extracted into a dedicated component once it grows or is needed elsewhere, with zero bundle penalty thanks to [fine-grained bundling](./fine-grained-bundling.md):

```marko
/* index.marko */
<form>
  <label>
    Phone Number: <phone-input/>
  </label>
  <button type="submit">Submit</button>
</form>
```

```marko
/* tags/phone-input.marko */
<let/number="">
<input
  name="phone"
  type="tel"
  value=number
  valueChange(value) {
    number = value.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
  }
/>
```

## Common Objections

### Single Responsibility

The Single Responsibility Principle holds that a module should have one reason to change. A modal component has one responsibility: implementing a modal. Its markup, styles, and state all change for that same reason; splitting them across files fragments one responsibility rather than separating distinct ones.

### Reusability

Co-location improves reuse because consumers import or discover a single `.marko` tag instead of coordinating separate HTML, CSS, and script files.

### Component Size

When a component grows too large, the remedy is decomposing it into focused sub-components rather than splitting by file type:

```marko
// Compose focused sub-components rather than one monolithic profile template
<user-avatar user=input.user/>
<user-details user=input.user/>
<user-actions user=input.user/>
<user-preferences user=input.user/>
```

When styles alone become lengthy, [auto-discovered adjacent stylesheets](../guide/styling.md#auto-discovered-styles) (`style.css` / `<name>.style.css`) still keep each component self-contained in its own folder.

### Web Standards

Web standards define HTML, CSS, and JavaScript, not source-directory layouts. The platform itself supports co-location through Custom Elements, Shadow DOM, and inline `<style>` attributes.

## Further Reading

- [Fine-Grained Bundling](./fine-grained-bundling.md)
- [Nested Reactivity](./nested-reactivity.md)
- [Optimizing Performance](./optimizing-performance.md)
