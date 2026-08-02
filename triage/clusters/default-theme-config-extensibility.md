[← Index](../README.md)

# Default theme configuration & extensibility

Priority: P2 · 2 actionable · last reviewed 2026-08-03

Everything people reach for when bending the default theme without forking it: `themeConfig` options, frontmatter switches, `Layout` slots, and component exports. Two gaps here are worth closing, both traceable to pull requests that never merged: a nav item with a dropdown that can also carry its own link ([#2990](https://github.com/vuejs/vitepress/pull/2990)), and a slot for custom fallback content when an ad blocker hides Carbon Ads ([#348](https://github.com/vuejs/vitepress/pull/348)). Neither PR was closed over disagreement with the idea — one was deferred pending an interaction-design decision, the other went stale as the theme was rewritten around it — and both gaps still exist today, so the path forward is a fresh implementation rather than a revived branch.

## Worth acting on

### [#2990](https://github.com/vuejs/vitepress/pull/2990) feat(theme): allow link on nav item with children

**redo** · value 3 · effort M · brc-dd · closed 2023-09-19

- **What it did** — Let a top-level nav item that has a dropdown also carry its own `link`, so clicking the label navigates instead of only opening the flyout.
- **Why it was closed** — Self-closed by the author (brc-dd) with the note that it "will be a bit more complex". Deferred on design complexity, never rejected in principle.
- **Why it still matters** — In the current codebase, `NavItemWithChildren` in `types/default-theme.d.ts` declares only `text`, `items` and `activeMatch` — no `link` field — and `VPNavBarMenuGroup` renders only a `VPFlyout` trigger. There is still no way to express this.
- **Recommendation** — The blocker was never the code, it was the interaction design: one control cannot both navigate and open a menu without a rule for which wins. Settle that before writing any diff — desktop can hover-to-open and click-to-navigate, but touch has no hover, so the first tap has to do something unambiguous (common resolutions: tap opens and a duplicated "Overview" child carries the link, or tap navigates and a separate chevron opens). Pick one, document it, then implement. This is the author's own deferred PR, so the design call is in-house and unblocked.

### [#348](https://github.com/vuejs/vitepress/pull/348) feat: allow displaying fallback when ads are blocked

**redo** · value 2 · effort S · posva · closed 2022-06-06

- **What it did** — Added a `carbon-ads-blocked` slot on the default theme `Layout` so sites could render a custom message when an ad blocker suppressed Carbon Ads.
- **Why it was closed** — kiaking closed it in 2022 because the theme code had changed substantially since the PR was opened in 2021 and it would need a fresh start. The idea itself was not rejected.
- **Why it still matters** — `VPCarbonAds.vue` and `VPDocAsideCarbonAds.vue` are still present with no ad-blocked detection or fallback. `.VPCarbonAds` sets `min-height: 256px` and a background color, so a blocked ad leaves a visibly empty tinted block in the aside rather than collapsing.
- **Recommendation** — Smallest and most self-contained of the two: detect the blocked state in `VPCarbonAds.vue` and expose a slot for the fallback. Two constraints worth honoring — ad-blocker detection is heuristic, so keep the fallback opt-in (render nothing unless the site supplies slot content) rather than shipping default copy; and collapsing the `min-height` when blocked is arguably the better default even for sites that supply no fallback, which makes a useful standalone first commit.
