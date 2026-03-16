; SPDX-License-Identifier: PMPL-1.0-or-later
; Copyright (c) 2026 Jonathan D.A. Jewell (hyperpolymath)
;
; Syntax highlighting queries for A2ML files.

; Comments
(comment) @comment

; Section delimiters
(section_delimiter) @punctuation.delimiter

; Section headings
(section_heading) @markup.heading

; Subsection headings
(subsection_heading) @markup.heading

; Keys
(plain_key) @property
(hash_key) @property.definition

; Values
(quoted_string) @string
(double_string_content) @string
(single_string_content) @string
(number) @number
(boolean) @constant.builtin
(null_value) @constant.builtin
(unquoted_string) @string

; Arrays
(array
  "[" @punctuation.bracket
  "]" @punctuation.bracket)

; Attestation blocks
(attestation_start) @keyword.directive
(attestation_end) @keyword.directive
(attestation_content) @string.special

; Block scalar indicator
(block_scalar_indicator) @operator

; List items
(list_item
  "- " @punctuation.special)

; Punctuation
":" @punctuation.delimiter
