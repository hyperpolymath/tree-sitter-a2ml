<!-- SPDX-License-Identifier: PMPL-1.0-or-later -->
<!-- Copyright (c) 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk> -->
# TOPOLOGY.md — tree-sitter-a2ml

## Purpose

Tree-sitter grammar for A2ML (Attested Markup Language). Provides incremental, error-tolerant parsing for syntax highlighting in editors (VS Code, Neovim, Helix, etc.) and for use in static analysis tools.

## Module Map

```
tree-sitter-a2ml/
├── grammar.js       # Tree-sitter grammar definition
├── src/             # Generated C parser (from grammar.js)
├── bindings/        # Language bindings (Node, Python, etc.)
├── binding.gyp      # Node.js binding build config
└── deno.json        # Deno test config
```

## Data Flow

```
[grammar.js] ──► [tree-sitter generate] ──► [src/ C parser]
                                                    │
                                         [editor / tooling integration]
```
