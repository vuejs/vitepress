[← Index](../README.md)

# Accessibility

Priority: P1 · 2 actionable · last reviewed 2026-08-03

VitePress's default theme has a couple of longstanding accessibility gaps around keyboard interaction and text sizing. On narrow viewports, the mobile navigation menu does not contain keyboard focus, so tabbing can still reach a hidden, off-screen menu — a gap [#2329](https://github.com/vuejs/vitepress/pull/2329) closes, and one that is now much cheaper to fix thanks to widespread `inert` support. The theme's typography is also hardcoded in pixels rather than rem units, so raising the browser's default font size has no effect on VitePress text; [#703](https://github.com/vuejs/vitepress/pull/703) addressed this but needs a narrower redo scoped to font-related units rather than its original 45-file sweep. Separately, VitePress has no ARIA live-region announcement for client-side route changes — a 2022 PR proposing one, [#1357](https://github.com/vuejs/vitepress/pull/1357), was rejected on the mistaken premise that the loading progress bar already serves that purpose.

## Worth acting on

### [#2329](https://github.com/vuejs/vitepress/pull/2329) feat(theme): use inert to avoid traverse menus and content with keyboard

- **Verdict:** salvage · **Value:** 3 · **Effort:** M
- **Author:** userquin · **Closed:** 2023-09-10

**What it did.** Applied the `inert` attribute to the mobile nav and content regions so hidden menus and off-screen content cannot receive keyboard focus on narrow viewports.

**Why it was closed.** Never reviewed — no maintainer feedback in ~4 months, only the author's own review comments, then stale.

**Why it still matters.** `composables/nav.ts` and `Layout.vue` still have no `inert` or focus-containment handling for the mobile menu; the only `inert` usage in the theme is in `VPLocalSearchBox` for an unrelated purpose. Keyboard users on narrow screens can still tab into a hidden menu.

**Recommendation.** This and [#1448](https://github.com/vuejs/vitepress/pull/1448) are two attempts at the same problem; fix it once, using this PR's `inert` approach rather than [#1448](https://github.com/vuejs/vitepress/pull/1448)'s `tabindex=-1`. Browser support for `inert` has matured since 2023, so the Vue-rendering workaround the original PR needed is almost certainly unnecessary now — expect a much smaller diff. Model the accompanying focus/Escape behavior on the already-merged `useFocusTrap` (search box) and `useCloseSidebarOnEscape` patterns, which is exactly what reviewers asked for on [#1448](https://github.com/vuejs/vitepress/pull/1448).

### [#703](https://github.com/vuejs/vitepress/pull/703) perf(a11y): make font size follow user brower settings

- **Verdict:** redo · **Value:** 3 · **Effort:** L
- **Author:** kecrily · **Closed:** 2022-06-06

**What it did.** Converted hardcoded px `font-size`/`line-height`/`width`/`height` values to rem across roughly 45 default-theme component and style files so browser text-zoom settings are respected.

**Why it was closed.** kiaking asked to hold off, wanting to redo it himself more carefully — concerned about incidental changes (e.g. border widths) and that content-width media queries would need rem conversion too for consistency.

**Why it still matters.** `vars.css` and `base.css` still hardcode px today (16px root font size, fixed custom-block sizes, and so on), so users who raise their browser's default font size still get unchanged VitePress text.

**Recommendation.** Do not resurrect the original sweep. Scope a new PR to font-related units only — `font-size` and `line-height` — leaving layout dimensions, borders, and media queries in px. That sidesteps kiaking's specific objections and is reviewable; layout/media-query rem conversion can be a separate decision later if wanted.
