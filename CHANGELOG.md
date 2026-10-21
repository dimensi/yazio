# Changelog

## 2.0.0 — 2026-10-22

- Food writes require and preserve local `YYYY-MM-DD HH:mm:ss`, including
  entries near midnight. Date-only, offset and invalid timestamps are rejected.
- Day-level reads, photos and authentication retain their existing behavior.
- Release packaging uses the `@dimensi/yazio` scope, real build entrypoints,
  shared ESM/CJS modules and explicit declaration exports.
