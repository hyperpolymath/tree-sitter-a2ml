// SPDX-License-Identifier: PMPL-1.0-or-later
// Copyright (c) 2026 Jonathan D.A. Jewell (hyperpolymath)
//
// Node.js native binding for tree-sitter-a2ml.

#include <napi.h>

typedef struct TSLanguage TSLanguage;

extern "C" TSLanguage *tree_sitter_a2ml();

// "tree-sitter", "language" hashed the same way as upstream expects.
Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports["name"] = Napi::String::New(env, "a2ml");
  auto language = Napi::External<TSLanguage>::New(env, tree_sitter_a2ml());
  exports["language"] = language;
  return exports;
}

NODE_API_MODULE(tree_sitter_a2ml_binding, Init)
