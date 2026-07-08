# Marko in January 2026

> [!TLDR]
>
> - A large batch of compiler fixes for variable hoisting, scope analysis, and rest inputs
> - Steadier type checking in the language server
> - pnpm project discovery for editor tooling
> - Interop and controllable-input fixes for mixed Class API and Tags API apps

January was a stabilization month. Rather than new syntax, the work went into the parts of the Marko 6 compiler that decide where variables live and how scopes connect, into the language server's understanding of those same scopes, and into the seams where Class API and Tags API code meet. The result is a compiler that handles more real-world templates correctly and an editor that keeps up with them.

## Compiler Reliability

The largest theme was variable hoisting and section analysis. A regression that caused the compiler to error while writing out the reads for some signals was fixed, alongside a refactor of signal construction and side-effect tracking ([marko#3032](https://github.com/marko-js/marko/pull/3032)). Hoisting itself was corrected so that custom tag hoists and native tag references are unified under one path ([marko#3064](https://github.com/marko-js/marko/pull/3064)).

A cluster of related fixes tightened how the compiler reasons about scopes that span sections: assignments that were missing their section, declared non-nullable aliases used in a different section, the canonical signal used for closure references, and assignments to bindings that are never read ([marko#3052](https://github.com/marko-js/marko/pull/3052), [marko#3051](https://github.com/marko-js/marko/pull/3051), [marko#3048](https://github.com/marko-js/marko/pull/3048), [marko#3049](https://github.com/marko-js/marko/pull/3049)). Scriptlet variables no longer collide with compiler-generated names ([marko#3028](https://github.com/marko-js/marko/pull/3028)).

The optimizations for known spread and rest inputs were corrected as part of the same push. A known tag with a `...rest` input reference could create a circular serialize reason and overflow the call stack, and serializing nested rest bindings is now handled correctly ([marko#3035](https://github.com/marko-js/marko/pull/3035), [marko#3040](https://github.com/marko-js/marko/pull/3040), [marko#3053](https://github.com/marko-js/marko/pull/3053)).

## Improvements

A few workflow improvements landed alongside the stabilization work.

### Editor Tooling

The language server discovers `@marko/compiler` more reliably under pnpm. Because pnpm stores transitive dependencies in its `.pnpm` directory, the compiler was not found when it was not a direct dependency. When no compiler is found, the server now falls back to the one resolved from the installed `marko` version ([language-server#431](https://github.com/marko-js/language-server/pull/431)). The full set of supported editors lives in [Tooling Integrations](../introduction/integrations.md#editor-tooling).

### Build Integration

The Vite integration tracks optional watch files more accurately, so changes to files that may or may not exist are picked up without over-watching ([vite#242](https://github.com/marko-js/vite/pull/242)). The compiler also allows overriding how template ids are generated, giving build tooling control over those identifiers ([marko#3061](https://github.com/marko-js/marko/pull/3061)).

### Playground

The [playground](/playground) gained starter templates when adding a new tab, so a new file can begin from an example instead of an empty editor, along with a handful of smaller editor refinements ([website#129](https://github.com/marko-js/website/pull/129)).

## Fixes

The rest of the month's correctness work landed in the language server's type checking and at the seams between the Class API and the Tags API.

### Type Checking

The language server caught up with several Marko 6 scope behaviors. Tag variable hoisting aligns with the runtime, scope hoisting and attribute tag types are more accurate, and the extractor's mutation output was reworked ([language-server#433](https://github.com/marko-js/language-server/pull/433), [#435](https://github.com/marko-js/language-server/pull/435), [#442](https://github.com/marko-js/language-server/pull/442), [#444](https://github.com/marko-js/language-server/pull/444), [#437](https://github.com/marko-js/language-server/pull/437)). Identifier attribute binds in a nested scope and `define` tag variable hoisting were both fixed, along with broken type checks in recent versions ([#439](https://github.com/marko-js/language-server/pull/439), [#448](https://github.com/marko-js/language-server/pull/448)).

On the runtime side, the [`<await>`](../reference/core-tag.md#await) tag types improved and the native tag types now line up between the Class API and Tags API ([marko#3055](https://github.com/marko-js/marko/pull/3055), [marko#3062](https://github.com/marko-js/marko/pull/3062)).

### Interop

Mixed Class API and Tags API applications gained several fixes. Components initialize correctly when bundled with `lasso-marko`, dynamic native tags route through the compatibility layer as expected, and a Class API component used from the Tags API with an [event handler](../reference/native-tag.md#event-handlers) that reads nothing from scope no longer produces a "scope is undefined" error during serialization ([marko#3030](https://github.com/marko-js/marko/pull/3030), [marko#3057](https://github.com/marko-js/marko/pull/3057), [marko#3039](https://github.com/marko-js/marko/pull/3039)). Projects combining both APIs can follow [Marko 5 Interop](../guide/marko-5-interop.md) for the conventions that select each compiler.

### Define Tags

Rendering a [`<define>`](../reference/custom-tag.md) tag with no body content no longer errors, and a `...rest` input reference no longer produces a circular serialize reason ([marko#3034](https://github.com/marko-js/marko/pull/3034)). When every usage site is known to provide `input`, the compiler now optimizes the define tag's `input` reference ([marko#3046](https://github.com/marko-js/marko/pull/3046)).

### In Brief

- Default [event handlers](../reference/native-tag.md#event-handlers) registered before a spread on a native tag now apply correctly ([marko#3036](https://github.com/marko-js/marko/pull/3036)).
- A controllable text input driven through a spread `value` or `valueChange` updates correctly, closing a gap in [two-way binding](../reference/language.md#shorthand-change-handlers-two-way-binding) when the controlling attributes arrive by spread rather than directly ([marko#3042](https://github.com/marko-js/marko/pull/3042)).

Full details for every change are in the release notes of each package on [GitHub](https://github.com/marko-js).

## Further Reading

- [February 2026](february-2026.md)
