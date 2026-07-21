# Low-Level APIs

Marko's compiler can run custom **migrators** and **translators** when the core language is not enough. These hooks are rare. Prefer ordinary tags, attributes, and the published runtime APIs first; reach for compiler plugins only when a whole project needs an automated syntax rewrite or a specialized compile target.

## When to Use Them

| Hook | Role |
| ---- | ---- |
| Migrator | Marko-to-Marko rewrite, often written back to disk (syntax upgrades, renames) |
| Translator | Marko-to-JavaScript (or other) code generation for a specific output |

Built-in Tags API compilation already covers browser and server HTML. Custom translators are for alternate runtimes or experimental outputs, not for typical application features.

## Writing a Migrator

Migrators run in the compiler's `migrate` phase. They receive Babel/`@marko/compiler` paths for Marko AST nodes and may replace tags or attributes. Application-level migrators are registered through tag libraries (`marko.json`) or compiler plugins, the same extension points used by Marko 5 → 6 migrations.

Authoring guidance and AST helpers live in the compiler packages:

- [`@marko/compiler`](https://github.com/marko-js/marko/tree/main/packages/compiler)
- [`babel-utils`](https://github.com/marko-js/marko/blob/main/packages/compiler/babel-utils.d.ts) (`diagnosticDeprecate`, `diagnosticError`, tag assertion helpers)

For most API upgrades, document the new Tags API pattern and use the official migrators instead of maintaining a private source rewrite.

## Writing a Translator

Translators implement analyze and translate hooks for tags or the program. The Tags API translator under [`@marko/runtime-tags`](https://github.com/marko-js/marko/tree/main/packages/runtime-tags) is the reference implementation: phases are parse → migrate → transform → analyze → translate, with analysis shared across outputs and HTML vs DOM differences deferred until translate.

Custom translators should:

1. Register through the compiler's translator option or a taglib.
2. Keep analyze pure (annotate, do not reshape for a single output).
3. Emit runtime calls that match a supported runtime module graph.

> [!CAUTION]
> Custom translators and migrators are not required for application development. Incorrect plugins can break resume, streaming, and type checking. Prefer contributing improvements upstream when the need is general.

## Further Reading

- [Marko 5 Interop](./marko-5-interop.md)
- [Targeted Compilation](../explanation/targeted-compilation.md)
- [Compiler package](https://github.com/marko-js/marko/tree/main/packages/compiler)
