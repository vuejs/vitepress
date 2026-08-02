[← Index](../README.md)

# Build pipeline, dev server & routing

Priority: P2 · 1 actionable · last reviewed 2026-08-03

VitePress's build pipeline, dev server, and client-side router govern how pages compile, get served, and resolve to routes — including how URLs map to files on disk. That mapping is case-sensitive throughout, with no accommodation for case-insensitive URLs ([#116](https://github.com/vuejs/vitepress/pull/116)): internal links whose case doesn't match the file on disk work in local dev but can 404 once deployed to a case-sensitive host.

## Worth acting on

### [#116](https://github.com/vuejs/vitepress/pull/116) feat: support lowercase url (#115)

**redo** · value 2/5 · effort L · yuxino · closed 2021-09-01

- **What it did:** lowercased build output paths and URLs to stop 404s caused by case-mismatched links.
- **Why it was closed:** stalled, not rejected. kiaking, posva and the author agreed the problem was real but never converged on a design — hosting behaviour and HMR implications were the open questions — and it was closed after a year of inactivity.
- **Why it still matters:** there is still no case-insensitive URL handling anywhere in the build/render pipeline (the only `toLowerCase()` uses are unrelated — hash maps and Windows drive letters), so [#115](https://github.com/vuejs/vitepress/issues/115) is unaddressed. Case-mismatched internal links keep working in dev on macOS/Windows and 404 on Linux hosts.
- **Recommendation:** treat as a design question before any code. A real fix spans build output naming, dev-server resolution and static-host behaviour (some hosts are case-sensitive, some aren't), so the blanket-lowercase approach in this PR is not the shape to revive. Two viable outcomes: a documented "won't do" plus a build-time warning for internal links whose case doesn't match the file on disk (cheap, catches the actual failure mode), or a proper opt-in option designed across all three layers. The dead-link checker is the natural place for the warning.
