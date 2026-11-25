# Marko Documentation Writing Guidelines

## What to Document

- Describe what Marko does, never what it lacks. No "there is no X", and no workarounds that route around the framework.
- Do not document compile errors. The compiler reports them with a code frame. This covers content that reframes them, such as a table mapping another framework's attribute names onto Marko's.
- Do not document errors, warnings, or checks that only a `MARKO_DEBUG` build produces. State the rule, not the message.
- Never document a known bug as intended behavior. Grep `agent-feedback/` across the relevant repos (`marko`, `vite`, `run`, `language-server`) first; a hit means file the defect and leave the docs alone.
- Drop a topic that loses its main claim to the rule above. What remains is the least verified part of it.
- Prefer filing a defect to writing a caveat that teaches readers to live with one.
- Refer to the framework as "Marko", not "Marko 6". Mention "Marko 6" only when explicitly contrasting with Marko 5 (Class API), and keep Marko 5 details in the migration and interop guides.

## Verifying Claims

- Verify behavior against runtime source, a fixture snapshot, or a compiled probe. An audit, an issue, or an existing docs sentence is not evidence.
- Verify examples render, not only that they compile.
- For compiler and bundler APIs, check how `@marko/vite` and the `marko` fixture harness (`packages/runtime-tags/src/__tests__/utils/bundle.ts`) call them.
- Grep `docs/` for the scenario and the variable names to check example uniqueness. Reading the edited page is not enough.

## Voice and Tone

- Use a clean, dense, technical tone without being overly academic. Cut filler while keeping explanations clear and scannable.
- Avoid second person ("you") in main content; use impersonal phrasing instead:
  - ❌ "When you create a component..."
  - ✅ "When creating a component..." or "When a component is created..."
- Use "we" in tutorials when building something together
- Be matter-of-fact and precise in reference docs
- Use encouraging but professional language in tutorials ("Aha!", "Great!")
- Use measured language for removed/deprecated features: "have been removed", "no longer necessary", "no longer supported". Never "gone", "drops", or "gone entirely".
- Reference other frameworks only when linking to a genuinely useful resource (e.g., React's "You Might Not Need an Effect"). Do not list frameworks for favorable comparison (e.g., avoid "This aligns Marko with React, Svelte, and Vue").

## Headings and Structure

- Keep new headings short (1-3 words, nouns or short phrases, no colons followed by descriptions).
- Preserve existing heading text and anchors unless there is a strong reason to rename; renaming breaks deep links from `docs/newsletter/`, compiler/runtime error links (`marko/packages/runtime-tags/src/`), and external sites. Check all inbound anchors before changing a heading.
- Use clear hierarchical sections (`##`, `###`).
- Keep scannable bullet lists or directory trees when they parse faster visually than a dense prose paragraph.

## Documentation Structure by Type

### Reference Documents

- Start with a brief description of what the feature/API does
- Use clear hierarchical sections (`##`, `###`)
- Include syntax examples immediately after explanations
- End sections with practical code examples
- Cross-reference related concepts frequently
- Use parameter tables for APIs

### Tutorial Documents

- Include a TLDR section with a brief summary
- Build complexity step-by-step with working examples
- Use a conversational tone with "we" to guide the reader
- Show incremental improvements to the same example
- Include complete, runnable code snippets

### Explanation Documents

- Include a TLDR section with 2-4 brief "at a glance" bullets (fragments are fine, usually no trailing periods).
- After the TLDR, include a short introductory paragraph that frames the document's purpose, audience, and context before diving into sections. Write it as natural prose that orients the reader, never as a table of contents. Specifically, never begin with "This document explains..." or "This page covers..." or any enumeration of the page's sections. Instead, lead with the core idea or the reader's starting point.
  - ❌ "This document explains what X means, why Y is preferred, and how Z works."
  - ✅ "Developers familiar with the Class API often relied on `this.emit`... Marko introduces a first-class pattern that removes much of this ceremony."
  - ✅ "Marko pushes work from runtime to compile time. The compiler analyzes templates and generates environment-specific output that avoids common runtime overhead."
- Focus on "why" and conceptual understanding
- Use **bold** and _italics_ sparingly for truly key concepts only
- Provide practical guidance and best practices
- Include real-world examples and use cases
- Maintain a technical but slightly conversational tone
- Explicitly label anti-patterns and explain why they should be avoided
- Present the most common or important pattern first when a section covers multiple alternatives
- Prefer a flat heading hierarchy (`##`) when sections are substantial enough to stand alone. Do not nest topics under umbrella headings just for grouping.

## Code Examples and Technical Content

- Every concept should have a concise, focused code example.
- Prefer real fenced, syntax-highlighted code blocks over cramming syntax examples into inline backticks inside prose or callouts.
- Build concepts gradually: lead with the clean, idiomatic path using Marko's conventions before introducing edge cases, fallbacks, or optional refinements.
- Teach the underlying mechanism alongside syntactic sugar so shorthand never reads like the only way an API works.
- Use expressive inline code comments when they make a contrast or teaching moment obvious at a glance (`// ❌`, `// ✅`, `// ⚠️`, or occasional conversational prompts like `// 🤔 ...`).
- Omit unnecessary directives or opt-in comments when compiler heuristics or defaults already handle the case.
- Add filenames to code examples with `/* filename.extension */` on the first line ONLY when two or more code blocks appear together and need disambiguating (e.g., `parent.marko` / `child.marko`). A single standalone code block must NEVER have a filename comment. Do not append metadata to filename comments (use `/* counter.marko */`, not `/* counter.marko - Class API */`).
- Examples must be unique across all documentation; avoid reusing common tropes.
- In Marko files, use JS-style comments (`// comment` or `/* comment */`) instead of HTML comments (`<!-- comment -->`).
- Avoid the `**Bold Title**: description` list pattern.
- In surrounding prose, avoid calling examples "minimal" or "simple". Prefer neutral lead-ins such as "Consider this Marko template" or "Example".
- Prefer practical, real-world examples that demonstrate actual patterns (e.g., event spread, focus management, form handling) over abstract or hello-world demos.

## Callouts and Formatting

- Use `> [!TLDR]` for brief summaries, with a blank `>` line before bullet lists (`markdownlint` MD032) and a normal blank line separating the callout from the following paragraph.
- Separate consecutive callouts with `<!---->` (`markdownlint` MD028).
- Use `> [!NOTE]` sparingly for important clarifications
- Use `> [!TIP]` occasionally for practical advice
- Use `> [!WARNING]` for common mistakes or anti-patterns
- Use `> [!CAUTION]` for critical warnings only
- Use `> [!IMPORTANT]` rarely for notable but less central info
- Use backticks for code elements, file names, and API references
- Use **bold** sparingly for the most important key terms only
- Use _italics_ sparingly for emphasis
- Never use emdash (—); use periods, commas, or restructure sentences instead. A spaced hyphen doing the same job counts, so grep `' - '` too.

## Cross-References and Links

- Link to related concepts in other documents
- Reference specific sections using anchors. Slugs come from heading text, so headings that collide (`attr=` and `<attr>` both give `#attr`) leave the second as `#attr-1`. Check the target file's headings.
- Link to external resources (MDN, etc.) for web standards
- When linking to implementation source on GitHub, link the file and name the symbol (or pin a commit SHA) instead of using mutable `blob/main#L...` line ranges.
- Maintain consistency in how concepts are referenced
- When discussing removed or changed APIs, link to the old documentation (e.g., `v5.markojs.com`) so readers can understand what is being replaced
- When discussing removed APIs, link to their modern equivalents elsewhere in the docs (e.g., anchor links within the same page or to reference docs)

## Migration and Comparison Content

- Frame API changes constructively: use "Updated APIs" or "Modern equivalents" instead of "Removed APIs" or "What's gone"
- When comparing old and new approaches, show the old approach first so readers can connect with what they know, then the new replacement
- Mention the modern equivalent alongside every removal. Never just list what was removed without showing the path forward.
- Use callouts (NOTE, CAUTION, WARNING) to flag anti-patterns, important conventions, and gotchas. Do not leave these implicit in prose.
- Vary section structure naturally. Do not use a formulaic repeating sub-heading pattern like "### Old Way" / "### New Way" in every section. Integrate the before/after comparison organically within each section's prose and code examples.
- Embed anti-pattern warnings inline (using callouts or prose) near the relevant content. Do not collect anti-patterns into a separate "Anti-Patterns" section at the end.

## Content Philosophy

- Focus on Marko's strengths and unique features
- Explain benefits without comparing negatively to other frameworks
- Emphasize compile-time intelligence and automatic optimization
- Highlight zero-JS by default and progressive enhancement
- Show how features solve real development problems

## Agent feedback

Anything actionable but out of scope for the current task (suspected bug, cleanup, perf or size win, tooling friction, confusing code) must be filed in [`agent-feedback/`](agent-feedback/README.md) before finishing. Never drop it silently. Never fix it inside an unrelated diff.
