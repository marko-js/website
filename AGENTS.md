# Marko Documentation Writing Guidelines

## Voice and Tone

- Use formal, technical tone without being overly academic
- Avoid second person ("you") in main content - use impersonal phrasing instead
  - ❌ "When you create a component..."
  - ✅ "When creating a component..." or "When a component is created..."
- Use "we" in tutorials when building something together
- Be matter-of-fact and precise in reference docs
- Use encouraging but professional language in tutorials ("Aha!", "Great!")
- Use measured language for removed/deprecated features: "have been removed", "no longer necessary", "no longer supported". Never "gone" or "gone entirely".
- Reference other frameworks only when linking to a genuinely useful resource (e.g., React's "You Might Not Need an Effect"). Do not list frameworks for favorable comparison (e.g., avoid "This aligns Marko with React, Svelte, and Vue").

## Headings and Structure

- Keep headings short: 1-3 words maximum
- Never use colons in headings followed by descriptions
- Use clear hierarchical sections (##, ###)
- Headings should be nouns or short phrases, not full sentences

## Documentation Structure by Type

### Reference Documents

- Start with brief description of what the feature/API does
- Use clear hierarchical sections (##, ###)
- Include syntax examples immediately after explanations
- End sections with practical code examples
- Cross-reference related concepts frequently
- Use parameter tables for APIs

### Tutorial Documents

- Include TLDR section with brief summary
- Build complexity step-by-step with working examples
- Use conversational tone with "we" to guide the reader
- Show incremental improvements to the same example
- Include complete, runnable code snippets

### Explanation Documents

- Include TLDR section with 2-4 very brief "at a glance" bullets. Fragments are allowed and usually should not end with periods. Do not include a blank line after the TLDR callout.
- After the TLDR, include a short introductory paragraph that frames the document's purpose, audience, and context before diving into sections. Write it as natural prose that orients the reader, never as a table of contents. Specifically, never begin with "This document explains..." or "This page covers..." or any enumeration of the page's sections. Instead, lead with the core idea or the reader's starting point.
  - ❌ "This document explains what X means, why Y is preferred, and how Z works."
  - ✅ "Developers familiar with the Class API often relied on `this.emit`... Marko 6 introduces a first-class pattern that removes much of this ceremony."
  - ✅ "Marko pushes work from runtime to compile time. The compiler analyzes templates and generates environment-specific output that avoids common runtime overhead."
- Focus on "why" and conceptual understanding
- Use **bold** and _italics_ sparingly for truly key concepts only
- Provide practical guidance and best practices
- Include real-world examples and use cases
- Maintain a technical but slightly conversational tone
- Explicitly label anti-patterns and explain why they should be avoided
- Present the most common or important pattern first when a section covers multiple alternatives
- Prefer flat heading hierarchy (##) when sections are substantial enough to stand alone. Do not nest topics under umbrella headings just for grouping.

## Code Examples and Technical Content

- Every concept should have a concise, focused code example
- Examples must be minimal and strictly relevant
- Add filenames to code examples with `/* filename.extension */` on the first line ONLY when two or more code blocks appear together and need disambiguating (e.g., parent.marko / child.marko). A single standalone code block must NEVER have a filename comment. Do not append metadata to filename comments (use `/* counter.marko */`, not `/* counter.marko - Class API */`).
- Examples must be unique across all documentation - avoid reusing common tropes
- In Marko files, use JS-style comments (`// comment` or `/* comment */`) instead of HTML comments (`<!-- comment -->`)
- Avoid the `**Bold Title**: description` list pattern which sounds LLM-generated
- In surrounding prose, avoid calling examples "minimal" or "simple". Prefer neutral lead-ins such as "Consider this Marko template" or "Example".
- Prefer practical, real-world examples that demonstrate actual patterns (e.g., event spread, focus management, form handling) over abstract or hello-world level demos

## Callouts and Formatting

- Use `> [!TLDR]` for brief summaries (no empty line after)
- Use `> [!NOTE]` sparingly for important clarifications
- Use `> [!TIP]` occasionally for practical advice
- Use `> [!WARNING]` for common mistakes or anti-patterns
- Use `> [!CAUTION]` for critical warnings only
- Use `> [!IMPORTANT]` rarely for notable but less central info
- Use backticks for code elements, file names, and API references
- Use **bold** sparingly for the most important key terms only
- Use _italics_ sparingly for emphasis
- Never use emdash (—); use periods, commas, or restructure sentences instead

## Cross-References and Links

- Link to related concepts in other documents
- Reference specific sections using anchors
- Link to external resources (MDN, etc.) for web standards
- Maintain consistency in how concepts are referenced
- When discussing removed or changed APIs, link to the old documentation (e.g., v5.markojs.com) so readers can understand what is being replaced
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
