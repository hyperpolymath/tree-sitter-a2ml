// SPDX-License-Identifier: PMPL-1.0-or-later
// Copyright (c) 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>
//
// tree-sitter-a2ml — Tree-sitter grammar for the A2ML (Attestation & Automation
// Markup Language) format. A2ML is a YAML-like configuration language used in
// contractile systems, trustfiles, and machine-readable metadata.

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "a2ml",

  extras: ($) => [/ /, /\t/],

  rules: {
    // ---------------------------------------------------------------------------
    // Top-level document: a sequence of sections separated by --- delimiters,
    // optionally preceded by comment headers (including SPDX lines).
    // ---------------------------------------------------------------------------
    document: ($) =>
      repeat($._toplevel),

    _toplevel: ($) =>
      choice(
        $.section_delimiter,
        $.section_heading,
        $.subsection_heading,
        $.key_value_pair,
        $.attestation_block,
        $.list_item,
        $.comment,
        $.blank_line,
      ),

    // ---------------------------------------------------------------------------
    // Blank line: empty line separator.
    // ---------------------------------------------------------------------------
    blank_line: ($) => /\n/,

    // ---------------------------------------------------------------------------
    // Section delimiter: three dashes on their own line, separating major blocks.
    // ---------------------------------------------------------------------------
    section_delimiter: ($) => token(prec(10, /---\n/)),

    // ---------------------------------------------------------------------------
    // Section heading: Markdown-style heading with bracket notation.
    // A2ML sections use:
    //   ### [META]
    //   ### [THREAT_MODEL]
    // Distinguished from subsection_heading by the bracket syntax.
    // ---------------------------------------------------------------------------
    section_heading: ($) =>
      token(prec(5, /#{2,6} *\[[A-Z_][A-Z0-9_\/]*\]\n/)),

    // ---------------------------------------------------------------------------
    // Subsection heading: Markdown-style heading with plain text.
    // Used for sub-grouping within sections:
    //   ## Parameters
    //   ### policy-config-valid
    // ---------------------------------------------------------------------------
    subsection_heading: ($) =>
      token(prec(3, /#{2,6} +[^\[\n][^\n]*\n/)),

    // ---------------------------------------------------------------------------
    // Key-value pair: the fundamental building block of A2ML.
    //   key: value
    //   key: "quoted value"
    //   key: |
    //     multiline value
    // ---------------------------------------------------------------------------
    key_value_pair: ($) =>
      seq(
        $.key,
        ":",
        optional(seq(/ +/, $.value)),
        /\n/,
      ),

    // ---------------------------------------------------------------------------
    // Key: identifier for a key-value pair. Supports dotted names, hyphens,
    // underscores, and hash-prefixed identifiers (#primary-sig).
    // ---------------------------------------------------------------------------
    key: ($) =>
      choice(
        $.hash_key,
        $.plain_key,
      ),

    // ---------------------------------------------------------------------------
    // Plain key: standard identifier allowing dots, hyphens, and underscores.
    // ---------------------------------------------------------------------------
    plain_key: ($) => /[a-zA-Z_][a-zA-Z0-9_.\/\-]*/,

    // ---------------------------------------------------------------------------
    // Hash key: keys starting with # (used in DID key references).
    // Example: #primary-sig
    // ---------------------------------------------------------------------------
    hash_key: ($) => token(prec(2, /#[a-zA-Z_][a-zA-Z0-9_\-]*/)),

    // ---------------------------------------------------------------------------
    // Value: the right-hand side of a key-value pair.
    // ---------------------------------------------------------------------------
    value: ($) =>
      choice(
        $.quoted_string,
        $.array,
        $.block_scalar_indicator,
        $.number,
        $.boolean,
        $.null_value,
        $.unquoted_string,
      ),

    // ---------------------------------------------------------------------------
    // Quoted string: single or double-quoted string values.
    // Supports escaped characters and nested quotes.
    // ---------------------------------------------------------------------------
    quoted_string: ($) =>
      choice(
        seq('"', optional($.double_string_content), '"'),
        seq("'", optional($.single_string_content), "'"),
      ),

    double_string_content: ($) => /[^"\\]*(?:\\.[^"\\]*)*/,
    single_string_content: ($) => /[^'\\]*(?:\\.[^'\\]*)*/,

    // ---------------------------------------------------------------------------
    // Array: bracketed list of values.
    //   algorithms: ["SHA3-512", "SHAKE256", "BLAKE3"]
    //   usage: ["authentication", "assertion"]
    // ---------------------------------------------------------------------------
    array: ($) =>
      seq(
        "[",
        optional(
          seq(
            $.value,
            repeat(seq(",", $.value)),
            optional(","),
          ),
        ),
        "]",
      ),

    // ---------------------------------------------------------------------------
    // Number: integer or float values.
    // ---------------------------------------------------------------------------
    number: ($) => token(prec(1, /\-?[0-9]+(\.[0-9]+)?/)),

    // ---------------------------------------------------------------------------
    // Boolean: true or false literals.
    // ---------------------------------------------------------------------------
    boolean: ($) => token(prec(1, choice("true", "false"))),

    // ---------------------------------------------------------------------------
    // Null value: null or empty.
    // ---------------------------------------------------------------------------
    null_value: ($) => token(prec(1, "null")),

    // ---------------------------------------------------------------------------
    // Unquoted string: any string value not enclosed in quotes.
    // Continues to end of line. Lowest precedence among value types.
    // ---------------------------------------------------------------------------
    unquoted_string: ($) => /[^\n\[\]"',:# ][^\n]*/,

    // ---------------------------------------------------------------------------
    // Block scalar indicator: YAML-style literal (|) or folded (>) marker.
    // The content lines that follow are parsed as block_scalar_line entries.
    // ---------------------------------------------------------------------------
    block_scalar_indicator: ($) => token(prec(2, choice("|", ">"))),

    // ---------------------------------------------------------------------------
    // Attestation block: @directive ... @end blocks used for metadata annotations.
    //   @abstract:
    //   Description text
    //   @end
    //
    //   @requires:
    //   - section: Parameters
    //   @end
    // ---------------------------------------------------------------------------
    attestation_block: ($) =>
      seq(
        $.attestation_start,
        repeat($.attestation_content),
        $.attestation_end,
      ),

    attestation_start: ($) => token(prec(5, /@[a-zA-Z_][a-zA-Z0-9_]*:\n/)),
    attestation_content: ($) => /[^@\n][^\n]*\n/,
    attestation_end: ($) => token(prec(5, /@end\n?/)),

    // ---------------------------------------------------------------------------
    // List item: YAML-style list entry with a leading dash.
    //   - "SHA3-512"
    //   - type: "A"
    //     name: "@"
    // ---------------------------------------------------------------------------
    list_item: ($) =>
      seq(
        token(prec(3, "- ")),
        choice(
          seq($.key, ":", optional(seq(/ +/, $.value))),
          $.value,
        ),
        /\n/,
      ),

    // ---------------------------------------------------------------------------
    // Comment: line starting with # that is not a heading or hash_key.
    // Includes SPDX headers, copyright notices, and documentation comments.
    // ---------------------------------------------------------------------------
    comment: ($) => token(prec(-1, /# [^\n]*\n?/)),
  },
});
