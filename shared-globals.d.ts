// Cross-environment globals that environment-neutral code may use, declared
// merge-compatibly with lib.dom and @types/node (interface merging plus an
// identically named var). Loaded only by projects without a DOM lib; keep
// members to what shared code actually touches.

interface Console {
  debug(...data: unknown[]): void
  warn(...data: unknown[]): void
}
declare var console: Console

interface Document {}
declare var document: Document
