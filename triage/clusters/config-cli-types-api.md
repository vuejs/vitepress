[← Index](../README.md)

# Config, CLI, types & public API

Priority: P1 · 3 actionable · last reviewed 2026-08-03

VitePress's CLI drives the `vitepress init` scaffolding wizard, the dev server's interactive keyboard shortcuts, and the console output of the build command. Three small ergonomics fixes are worth reviving: a Ctrl-C shortcut that still exits the dev server with a non-zero code for what is a normal, user-initiated stop ([#3419](https://github.com/vuejs/vitepress/pull/3419)); a directory-escape check for the `init` wizard that the code still flags with an unresolved TODO ([#4876](https://github.com/vuejs/vitepress/pull/4876)); and a build-time spinner that keeps animating in non-TTY environments, which can hide real errors and make builds look hung ([#5002](https://github.com/vuejs/vitepress/pull/5002)). Each is a small, self-contained fix confirmed against current source, not an open design question.

## Worth acting on

### [#3419](https://github.com/vuejs/vitepress/pull/3419) fix(cli/shortcuts): CTRL-C should be considered normal exit

`salvage` · value 3/5 · effort S · @zhangyx1998 · closed 2024-01-05

- **Did** — Made Ctrl-C / Ctrl-D stop the dev server with exit code 0 instead of 1, since a user-initiated stop is not an error. Fixes [issue #3418](https://github.com/vuejs/vitepress/issues/3418).
- **Closed because** — Closed roughly six hours after opening with zero discussion and no recorded maintainer comment; no reason documented.
- **Still matters** — Confirmed on main: `src/node/shortcuts.ts:77` still runs `await server.close().finally(() => process.exit(1))` for `\x03`/`\x04`, while the `q` (quit) shortcut 25 lines above at `:52` exits via a bare `process.exit()`. Identical user intent, two different exit codes. Non-zero on a normal stop trips CI wrappers, `&&` chains and process supervisors.
- **Do** — Reopen or rebase. It is a one-token change at `shortcuts.ts:77` to match the existing `q` path, and the internal inconsistency makes it self-justifying without further discussion.

### [#4876](https://github.com/vuejs/vitepress/pull/4876) feat(init): validation to make sure config directory is inside cwd

`redo` · value 3/5 · effort S · @hyperz111 · closed 2025-08-12

- **Did** — Added validation to the `vitepress init` wizard's directory prompt rejecting paths that escape the current working directory.
- **Closed because** — No comments and no reviews; closed 10 days after opening. Consistent with staleness, not a decision on the merits.
- **Still matters** — Confirmed on main: the comment `// TODO make sure directory is inside` is still present verbatim at `src/node/init/init.ts:55`, so the gap is acknowledged in-tree.
- **Do** — Redo rather than reopen. This branch's file list is polluted with dozens of unrelated files (`Layout.vue`, `VPNav.vue`, …) from an out-of-date base, so it is not rebaseable in practice. Open a clean single-purpose PR touching only `init.ts`: resolve the prompt value against `cwd`, reject escapes, and delete the TODO in the same commit.
- **Not a duplicate of the earlier attempts** — [#2286](https://github.com/vuejs/vitepress/pull/2286) and [#2267](https://github.com/vuejs/vitepress/pull/2267) were declined because `init` auto-creates a missing target directory. Those asked "does this path exist?"; this asks "is this path contained in cwd?" — which is what the TODO is about, so the earlier rejection does not cover it.

### [#5002](https://github.com/vuejs/vitepress/pull/5002) fix(cli): gate ora spinner behind tty check

`salvage` · value 2/5 · effort S · @nicolas-goudry · closed 2026-05-23

- **Did** — Gated the `ora` spinner behind an explicit TTY check so build errors are not hidden and builds do not look hung in non-interactive environments such as Nix builds.
- **Closed because** — Labeled "needs more discussion". brc-dd was open in principle to adjusting the spinner's `isEnabled` default but wanted the Nix-specific root cause understood first; the thread trailed off unresolved.
- **Still matters** — Confirmed on main: `src/node/utils/task.ts:10` still constructs `ora({ discardStdin: false })` with no `isEnabled` or TTY gating, so every build task spins regardless of whether stdout is a TTY.
- **Do** — Reopen conditional on the contributor supplying what was asked for: why ora's own TTY detection fails under Nix, plus an upstream ora issue link. If that does not materialize, an `isEnabled: process.stdout.isTTY && !process.env.CI` default is defensible on its own merits and mirrors the guard `bindShortcuts` already applies at `shortcuts.ts:61` (`!process.stdin.isTTY || process.env.CI`).
