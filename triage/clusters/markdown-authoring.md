[← Index](../README.md)

# Markdown & content authoring

Priority: P1 · 1 actionable · last reviewed 2026-08-03

VitePress turns source markdown into rendered pages through custom containers and GitHub-style alerts, code groups, snippets and includes with region markers, Shiki syntax highlighting with copy-code, link rewriting and dead-link reporting, and the `markdown.config` plugin surface. One gap remains in the container set: VitePress has no `::: success` block ([#4228](https://github.com/vuejs/vitepress/pull/4228)), even though the theme already defines the `--vp-c-success-*` colors it would use — they currently go unused outside diff styling.

Also unfinished nearby: dead-link checks still can't ignore non-HTML files under `publicDir` automatically, so docs teams reach for `VITE_EXTRA_EXTENSIONS` per extension instead ([#4283](https://github.com/vuejs/vitepress/pull/4283)). The `{ minRows: 6 }` / attrs-delimiter collision noted in [#2641](https://github.com/vuejs/vitepress/pull/2641) still isn't documented anywhere.

## Worth acting on

### [#4228](https://github.com/vuejs/vitepress/pull/4228) feat(theme): containers: add the success custom block

`salvage` · value 2 · effort S · lifehackerhansol · closed 2026-07-25

**What it did.** Adds a `::: success` container (green) reusing the already-defined `--vp-c-success-*` CSS variables.

**Why it was closed.** Stale-bot auto-close in July 2026, with zero maintainer engagement and no explicit rejection.

**Why it still matters.** Still absent: the label table in `src/node/markdown/plugins/containers.ts` covers only tip/info/warning/danger/details, and `custom-block.css` styles info/note/tip/important/warning/danger/caution/details with no `success` rule. The `--vp-c-success-*` variables exist in `vars.css` but are consumed only by the diff-add line colour, so the palette is already there and unused.

**Recommendation.** Low effort, but it is a maintainer call on whether the fixed container set grows. Note the decision has shifted since the PR was written: `customContainers` now lets a user register `::: success` themselves (it renders `<div class="success custom-block">`), so the only missing piece is the default green styling plus a label — a CSS block mirroring `.custom-block.note` and one entry in `containerLabels`/locale titles. If you take it, the Chinese label translation in the PR needs a native check; if you decline, close the loop by documenting the `customContainers` route rather than leaving it to a stale-bot.
