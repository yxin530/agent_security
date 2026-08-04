# Parser bindings

The current v0.5 release keeps all shipped rules at `detection_tier: regex`; no parser binding is invoked by the Engine yet. Planned bindings for future AST-tier rules are documented here so dependency choices remain explicit:

| Language | Planned binding | License/build note |
|---|---|---|
| JavaScript/TypeScript | `@typescript-eslint/typescript-estree` | MIT; JavaScript package, no native binary |
| Python | Tree-sitter Python grammar | MIT; native/tree-sitter toolchain may be required |
| PHP | Tree-sitter PHP grammar | MIT; native/tree-sitter toolchain may be required |
| Go | Tree-sitter Go grammar | MIT; native/tree-sitter toolchain may be required |
| Ruby | Tree-sitter Ruby grammar | MIT; native/tree-sitter toolchain may be required |
| Java | Tree-sitter Java grammar | MIT; native/tree-sitter toolchain may be required |
| Rust | Tree-sitter Rust grammar | MIT; native/tree-sitter toolchain may be required |
| C# | Tree-sitter C# grammar | MIT; native/tree-sitter toolchain may be required |

No parser dependency is currently bundled; AST escalation requires measured evidence and a separate design update.
