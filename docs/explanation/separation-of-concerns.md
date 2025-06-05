# What About Separation of Concerns?

> [!TLDR]
> Marko's approach doesn't violate separation of concerns, it applies the principle more correctly than traditional technology-based separation.

When developers first encounter Marko's Tags API, which allows tight coupling of component logic with structure and styling, a common concern arises: "Isn't this a violation of separation of concerns?"

This question touches on one of the most fundamental principles in software engineering, but it also reveals a fundamental misunderstanding about what "concerns" actually are.

## The Actual Concerns

Consider a simple user interface component: a modal dialog. In traditional file-based separation, we organize it like this:

```html
/* modal.html */
<button id="open-modal">Open Modal</button>
<div id="modal" class="modal">
  <button id="close-modal">×</button>
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

This organization seems to follow separation of concerns, but let's think about what the **_actual concerns_** should be:

1. **Modal behavior**: Opening, closing, and managing modal state
2. **Visual presentation**: How the modal appears and animates
3. **User interaction**: Button clicks, keyboard navigation
4. **Accessibility**: Focus management, screen reader support

Notice something important: **every single concern spans across HTML, CSS, and JavaScript**.

- The modal's opening behavior needs JavaScript logic, CSS display properties, and HTML structure changes
- Adding a feature like "close on escape key" touches HTML (focus management), CSS (styling), and JavaScript (event handling)

**The fundamental problem**: Traditional separation splits by _technology_ (HTML/CSS/JS files), while intent is to split by _functional concerns_.

## The Fundamental Problem

When we separate by technology instead of by concern, we create several serious issues:

1. **Fragmented Mental Models**

   When you need to understand how the modal works, you must mentally piece together information from three different files. The cognitive overhead increases exponentially with application complexity.

1. **Change Amplification**

   Adding a simple feature like "auto-close modal when clicking outside" requires changes in HTML (event handling structure), CSS (overlay styling), and JavaScript (event listeners). A single logical change becomes scattered across multiple files.

1. **Broken Encapsulation**

   Components cannot be truly self-contained when their definition is spread across multiple files. Moving or reusing a modal component requires careful coordination of HTML, CSS, and JavaScript files.

1. **Maintenance Overhead**

   When technologies are separated, it becomes difficult to ensure consistency. CSS classes can become orphaned when HTML changes, JavaScript can reference DOM elements that no longer exist, and refactoring becomes a cross-file archaeological expedition.

## Organize by Functionality

Marko's Tags API embraces a different philosophy: **organize code by feature and functionality, not by technology**.

Here's how the same modal component looks in Marko:

```marko
/* modal.marko */
<let/open=false/>

<button onClick() { open = true }>
  Open Modal
</button>

<div.modal style={ display: open ? "block" : "none" }>
  <button onClick() { open = false }>×</button>
  <p>Modal content...</p>
</div>

<style>
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

Notice how everything related to the modal (state management, DOM structure, event handling, styling) is co-located in a single file. This isn't a violation of separation of concerns; it's **better separation of concerns**.

## Separation Boundaries

Instead of separating by technology, Marko encourages separation by actual business concerns:

- **Component boundaries**: Each `.marko` file represents a cohesive piece of functionality
- **Feature boundaries**: Related components are grouped together
- **Domain boundaries**: Different parts of your application are logically separated
- **Abstraction levels**: Lower-level utilities are separated from higher-level components

This approach delivers measurable improvements:

1. Cognitive Load Reduction

   When developers need to understand or modify a feature, everything they need is in one place. There's no mental overhead of tracking relationships across multiple files.

1. Better Encapsulation

   Each component is truly self-contained. You can move a `.marko` file to a different project, and it brings all its dependencies with it.

1. Easier Refactoring

   When a component needs to change, all the related code is co-located. There's no risk of forgetting to update a related CSS rule or JavaScript handler in a distant file.

1. Natural Scoping

   Styles and behavior are naturally scoped to their component. This eliminates the global scope pollution that plagues traditional approaches.

Marko doesn't prescribe where the boundaries should be, it empowers you to define appropriate separations based on your application's needs. For example, if some functionality like the phone input in this form feels like it is becoming too large:

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
        phoneNumber = value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
      }
    />
  </label>
  <button type="submit">Submit</button>
</form>
```

You can extract it into a separate component:

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
/* phone-input.marko */
<let/number="">
<input
  name="phone"
  type="tel"
  value=number
  valueChange(value) {
    number = value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  }
/>
```

The framework doesn't force artificial separations. Instead, it provides the tools to separate concerns at the **logical boundaries** that make sense for your specific application.

## Common Objections

At this point, you might have some concerns. Let's address the most common ones:

### "This Violates Single Responsibility Principle"

The Single Responsibility Principle states that a class should have only one reason to change. A Marko component typically _does_ have a single responsibility, which is that it implements one piece of user-facing functionality. The fact that it includes HTML, CSS, and JavaScript doesn't violate SRP any more than a class having both data and methods violates it.

A modal component has one responsibility— being a modal. All the HTML structure, CSS styling, and JavaScript behavior serve that single purpose. Splitting these across files doesn't create better separation; it fragments the implementation of a single concern.

### "What About Reusability?"

Co-location of concerns actually _improves_ reusability. When you want to reuse a component, you get everything it needs in one package. There's no need to hunt down associated CSS files or JavaScript dependencies.

Traditional approach:

```sh
├── modal.html
├── modal.css
├── modal.js
└── modal-theme.css
```

Marko approach:

```sh
└── modal.marko
```

### "Large Components Are Unwieldy"

This is a valid concern, but the solution isn't to separate by technology. It's to break large components into smaller, more focused components. This is exactly the kind of logical separation that Marko encourages.

If your component is getting too large, extract logical sub-components:

```marko
<!-- Instead of one giant user-profile.marko, break it down into multiple components -->
<user-avatar user=input.user/>
<user-details user=input.user/>
<user-actions user=input.user/>
<user-preferences user=input.user/>
```

This maintains component boundaries based on functionality, not technology.

### "This Defies Web Standards"

Web standards define the technologies (HTML, CSS, JavaScript) but don't dictate how they should be organized in source code. The separation was a limitation of the tools, not a requirement of the standards.

Consider that:

- **Web Components** co-locate HTML, CSS, and JavaScript in a single custom element
- **CSS-in-JS** brings styling into JavaScript
- **Style attributes** have always mixed HTML and CSS

The web platform itself has been moving toward more integrated approaches.

## Industry Trends

Marko isn't alone in this approach. The frontend industry has been moving in this direction for years:

- **Vue.js**: Single File Components (SFCs) co-locate template, script, and style
- **React**: JSX mixes HTML and JavaScript; CSS-in-JS solutions bring styling closer to components
- **Svelte**: Components include markup, styling, and logic in single files
- **Angular**: Component decorator co-locates template and styles with the class

Even in other technology stacks, we see similar patterns:

- **iOS**: SwiftUI combines layout and behavior
- **Android**: Jetpack Compose merges UI and logic
- **Desktop**: Many modern UI frameworks favor component-based approaches

## Conclusion

Marko's approach isn't about abandoning separation of concerns, it's about applying that principle more thoughtfully. Instead of separating by arbitrary technological boundaries, we separate by logical, functional boundaries that align with how developers actually think about and build user interfaces.

The result is code that's easier to understand, modify, and maintain. Components become true units of functionality rather than fragmented pieces scattered across multiple files. This approach respects the principle that **related things should be close together**, while still maintaining clear separations where they actually matter.

The question isn't whether to separate concerns, but **which concerns to separate** and **where to draw the boundaries**. Marko's Tags API gives you the flexibility to make those decisions based on your application's actual needs, not on outdated assumptions about web technology separation.

## Next Steps

- [Nested Reactivity](./nested-reactivity.md)
- [Optimizing Performance](./optimizing-performance.md)
