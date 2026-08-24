# Theming, CSS architecture & layout

Part of the [theme chrome audit](./README.md) · snapshot 2026-08-24 · baselined on [#5397](https://github.com/vuejs/vitepress/pull/5397) (`navbar-redesign`)

Sweep: 369 unique records across the four types, deep-dived 40, verified against the `navbar-redesign` checkout.

## Already solved by [#5397](https://github.com/vuejs/vitepress/issues/5397)

- **[#1897](https://github.com/vuejs/vitepress/issues/1897) — Return semi-transparent header background** (kind: issue-not-planned; demand: 👍0, 3c)
  - Asks for the frosted/translucent navbar that was removed; declined ("due to avoid any problems we had with transparent background") with a workaround of six `!important` rules against `.content-body`, `.curtain::before` and `.has-sidebar` — exactly the internals [#5397](https://github.com/vuejs/vitepress/issues/5397) deletes. The single `::before` surface plus `--vp-nav-backdrop-filter` / `--vp-nav-bg-color` reduces it to the documented two-line glass recipe. Residual not covered: the thread's second complaint ("scroll fast enough and content is briefly visible below navbar") is the scroll-state flash the planned scroll-driven-animations enhancement targets.

- **[#3383](https://github.com/vuejs/vitepress/issues/3383) — Fix transparent nav bar** (kind: pr-unmerged; demand: 👍0, 5c)
  - Config flag for a transparent navbar on non-home pages. Declined by kiaking: "Should be configurable by css variable customization… I think you already can by customizing `--vp-nav-bg-color`." That prescribed route only truly works now. Carries one unbanked idea — kiaking's own "we should make navbar bg transparent by default on `page` when there is no `sidebar` and no `local-nav`", which the new single state rule could express as one extra condition.

- **[#5097](https://github.com/vuejs/vitepress/issues/5097) — Allow overflow-x with horizontal scrolling in VPNav** (kind: pr-unmerged; demand: 👍0, 4c)
  - Superseded by the priority-plus `⋯` menu. Also confirms the popover follow-up's value: the author was stuck on "the drop-down menus are no longer floating… I tried simple `z-index` potential fixes but they didn't work" — the scroll-container stacking trap that top-layer rendering removes structurally.

## Fits a planned follow-up

- **[#3806](https://github.com/vuejs/vitepress/issues/3806) — sidebar uses native <details> for collapsible groups** (kind: pr-open; demand: 👍0, 12c)
  - Enhancement: `details`/`summary` + `::details-content`, plus the sidebar half of the rework. Adds requirements: (a) it is CONFLICTING and needs a rebase onto the new `VPSidebarItem` (native buttons via ed2bfb26), so the follow-up is now a markup swap plus animation, not an a11y fix; (b) behavior decision from review — brc-dd wants navigating to a page inside a collapsed group to auto-uncollapse it, which native `open` state must be driven to honour; (c) e2e tests in `__tests__/e2e/multi-sidebar/index.test.ts` change; (d) the animation gap that blocked it is what `::details-content` + `transition-behavior: allow-discrete` + `interpolate-size: allow-keywords` now closes.

- **[#4847](https://github.com/vuejs/vitepress/issues/4847) — Accordions now use native details/summary** (kind: pr-open; demand: 👍0, 5c)
  - Same enhancement; two competing open PRs (both CONFLICTING, both last touched 2026-08-22) must be reconciled — pick one lineage before the `::details-content` work starts.

- **[#3804](https://github.com/vuejs/vitepress/issues/3804) — sidebar: use native <details> for collapsible groups** (kind: issue-open; demand: 👍0, 1c)
  - Acceptance criterion the PR body omits: Space-key toggling, asserted in the e2e disclosure tests.

- **[#3517](https://github.com/vuejs/vitepress/issues/3517) — accessibility: interactive controls should not be nested** (kind: issue-open; demand: 👍0, 1c)
  - Requirement: whichever disclosure markup lands must not nest a control inside the link — `<summary>` containing a link reproduces the same nesting, so the group-header-with-link case needs an explicit resolution.

- **[#2056](https://github.com/vuejs/vitepress/issues/2056) — feat(theme): move to css logical properties** (kind: pr-unmerged; demand: 👍0, 2c)
  - The prior attempt at the exact planned change, theme-wide. Adds: (a) the decline was not about RTL correctness or double-flip — Evan You rejected it as "a rather significant change for little perceived benefits… contributors are likely more familiar with transitional properties", so the follow-up needs a scope/benefit argument, which the RTL work ([#5034](https://github.com/vuejs/vitepress/issues/5034)/[#5071](https://github.com/vuejs/vitepress/issues/5071)) now supplies; (b) brc-dd's concrete regression from that attempt — "in outline that green border isn't been moved on scroll" — JS that reads/writes physical offsets breaks silently, so the outline marker is a required regression test.

- **[#2794](https://github.com/vuejs/vitepress/issues/2794) — Disable automatically set direction in <html>** (kind: issue-open; demand: 👍0, 3c)
  - Enhancement: logical properties. Once the chrome is direction-agnostic, runtime `dir` flipping becomes viable without a rebuild — currently blocked because physical properties plus the `/*rtl:ignore*/` escape hatches bake direction in at build time.

- **[#4359](https://github.com/vuejs/vitepress/issues/4359) — Local navigation dropdown misplaced without sidebar** (kind: issue-open; demand: 👍0, 5c)
  - Verified still present on `navbar-redesign`: `VPLocalNavOutlineDropdown.vue:172` applies `left: calc(var(--vp-sidebar-width) + 2rem)` unconditionally at ≥60rem, and `VPLocalNav.vue:90` does the same with `padding-left`. Requirement: the local nav needs the shared-geometry token the navbar just got (`--vp-nav-col-offset`, resolving to `0px` without a sidebar).

- **[#3433](https://github.com/vuejs/vitepress/issues/3433) — Use color-mix instead of multiple color CSS vars** (kind: issue-open; demand: 👍0, 1c)
  - Enhancement: `light-dark()` token consolidation. The sole decline reason was the old Vite-era browser floor — invalidated: repo is on `vite ^8.2.1`, `base.css` already ships `@layer __vitepress_base`, `color-mix()` is Baseline widely available. Pair `color-mix()` with `light-dark()` in the same pass — brc-dd's own roadmap on [#4425](https://github.com/vuejs/vitepress/issues/4425) names them together ("p3 colors / color-mix for brand colors?, font-relative units and dir-relative properties, zero specificity selectors").

- **[#4471](https://github.com/vuejs/vitepress/issues/4471) — allow multiple different color modes in addition to light|dark** (kind: issue-open; demand: 👍0, 0c)
  - Constraint on `light-dark()`, not a fit: it resolves solely through `color-scheme: light | dark`, so consolidating tokens into it hard-codes the two-mode assumption. Keep a plain-token override seam (or scope `light-dark()` to the chrome only).

## New candidates for future rework

- **[#4125](https://github.com/vuejs/vitepress/issues/4125) — Put all styles in @layer for lowered specificity** (kind: pr-unmerged; demand: 👍0, 2c)
  - Declined only on the old browser floor; dead reason — `base.css:1` already opens with `@layer __vitepress_base` (via completed [#4425](https://github.com/vuejs/vitepress/issues/4425)). Remaining work: extend layering from `base.css` to the chrome component styles. [#5397](https://github.com/vuejs/vitepress/issues/5397) makes it safer: stable public class names (aliases kept) mean layering changes precedence without changing selectors.

- **[#2071](https://github.com/vuejs/vitepress/issues/2071) — Add support of Global Notification** (kind: issue-open; demand: 👍0, 5c)
  - Architectural finding: `--vp-layout-top-height` is threaded as `var(--vp-layout-top-height, 0px)` through ten files, and users must inject head JS to set it. The single-surface pass is the moment to make the banner participate in flow, or derive the offset from the element instead of a JS-written variable. Also: `--vp-z-index-layout-top: 40` sits above `--vp-z-index-nav: 30`, so a sticky banner paints over the navbar.

- **[#1147](https://github.com/vuejs/vitepress/issues/1147) — Style error when custom max-width** (kind: issue-not-planned; demand: 👍0, 8c)
  - Cause named in-thread: "many style don't use css variables, instead use accurate numbers like `max-width: 688px`". The same de-duplication [#5397](https://github.com/vuejs/vitepress/issues/5397) did inside the navbar, applied to `VPDoc`/`VPSidebar`/`VPContent`, would make `--vp-layout-max-width` and `--vp-sidebar-width` actually load-bearing. bluwy's answer on [#4669](https://github.com/vuejs/vitepress/issues/4669) confirms users are told to hand-edit `.VPDoc .aside` and `.content-container`.

- **[#1054](https://github.com/vuejs/vitepress/issues/1054) — Reduce layout shifts with classic scrollbars** (kind: issue-open; demand: 👍0, 8c) *(delta on known [#5310](https://github.com/vuejs/vitepress/issues/5310))*
  - Delta the PR body's "`scrollbar-gutter: stable` … not planned" reasoning does not account for: kiaking explicitly reversed on the modal case ("Modal thing should be fixed. Let's fix this issue then"), and zqianem tested the alternatives — "`scrollbar-gutter` shows the gutter above the modal scrim", "`overflow: overlay` shows the scrollbar above the modal scrim and doesn't prevent the underlying content from scrolling". The scroll-lock/modal path needs a different mechanism.

- **[#1844](https://github.com/vuejs/vitepress/issues/1844) — fix(theme): avoid layout shift caused by scrollbar** (kind: pr-open; demand: 👍5, 2c)
  - Highest-👍 PR in the area; repeatedly rebased; author asked whether v2 is the moment. [#5397](https://github.com/vuejs/vitepress/issues/5397) changes the calculus: its `100vw` edits existed because the old chrome relied on viewport-width bleed — deleted. Rebased, the PR shrinks to roughly the `body` rule alone, and the `overflow-x: hidden` risk is much reduced.

- **[#5198](https://github.com/vuejs/vitepress/issues/5198) — stabilize horizontal layout (html { overflow-y: scroll })** (kind: pr-open; demand: 👍0, 0c)
  - A third, unlinked mechanism for the same problem as [#1054](https://github.com/vuejs/vitepress/issues/1054)/[#1844](https://github.com/vuejs/vitepress/issues/1844)/[#5310](https://github.com/vuejs/vitepress/issues/5310). Three open PRs propose three different fixes for one bug — settle on one during the single-surface pass.

- **[#4884](https://github.com/vuejs/vitepress/issues/4884) — Layout shift when search modal toggle** (kind: issue-open; demand: 👍0, 0c)
  - The concrete case kiaking already agreed to fix on [#1054](https://github.com/vuejs/vitepress/issues/1054), still open. Belongs with whichever scroll-lock mechanism the above resolves to.

- **[#2347](https://github.com/vuejs/vitepress/issues/2347) — feat(theme): add appearance transition feature** (kind: pr-unmerged; demand: 58 reactions total: 🚀33 ❤️19 👀6; 11c)
  - View Transitions circle-reveal on dark-mode toggle. Strongest community signal in this area. Declined on brand/trend grounds, but with an explicit opening: "it would be super cool if default theme has a cool way for users to hook in this kind of [effect]". Hooks since partly landed (`appearance.onChanged`, `appearance.disableTransition`, open [#4957](https://github.com/vuejs/vitepress/issues/4957)), but brc-dd's caveat — "things might appear wonky if you're using the default theme" — was the six scattered nav background selectors. With one `::before` surface ("every state change below is color-only, so nothing ever moves"), a documented appearance-transition recipe is now tractable without shipping an opinionated animation. Gate on `prefers-reduced-motion`.

- **[#3313](https://github.com/vuejs/vitepress/issues/3313) — Consider not using opacity for any text content** (kind: issue-open; demand: 👍0, 1c)
  - Text dimmed via `opacity` shows overlapping glyph strokes in some Persian/Arabic fonts, especially dark mode. Fits the token pass: dedicated `color-mix()`-derived tokens fix the artifact and remove an opacity-induced stacking context. RTL-adjacent correctness item.

- **[#5209](https://github.com/vuejs/vitepress/issues/5209) — New CSS custom properties** (kind: issue-not-planned; demand: 👍0, 0c)
  - Maintainer left an explicit opening on the close of its PR [#5211](https://github.com/vuejs/vitepress/issues/5211): "create a separate PR if parts regarding line-height are still relevant". Line-height is the one uncovered gap left in the custom-property surface.

- **[#1764](https://github.com/vuejs/vitepress/issues/1764) — Navbar is not sticky in mobile breakpoint** (kind: issue-not-planned; demand: 👍1, 2c)
  - Confirmed by design on the branch: `VPNav.vue` is `position: relative`, `fixed` only at ≥60rem. The decline was made when a fixed mobile bar meant fighting the curtain, the `-100vw` bleed and `overflow: hidden` parents. Those are gone, so revisiting is now cheap.

- **[#3021](https://github.com/vuejs/vitepress/issues/3021) — Make the default theme compatible with 3rd-party CSS frameworks** (kind: issue-open; demand: 👍1, 0c)
  - Generic class names (`.menu`) collide with CSS frameworks. Adjacent to [#4125](https://github.com/vuejs/vitepress/issues/4125) and brc-dd's [#4425](https://github.com/vuejs/vitepress/issues/4425) roadmap note ("zero specificity selectors and better internal naming"). [#5397](https://github.com/vuejs/vitepress/issues/5397) constrains the shape: renaming must be additive — new scoped names alongside the kept aliases, ideally inside a cascade layer.

- **[#3194](https://github.com/vuejs/vitepress/issues/3194) — TOC aside height problem** (kind: issue-open; demand: 👍0, 0c)
  - The aside is the last piece of chrome using viewport-relative geometry where container-relative would be correct. The PR body rules container queries out for the bar specifically; the aside is the opposite case and the natural place for them during the rework.

## Not viable

- **[#4920](https://github.com/vuejs/vitepress/issues/4920) — CSS Modules in default theme** (issue-not-planned; 👍0, 6c) — Stable user-targetable class names are required; [#5397](https://github.com/vuejs/vitepress/issues/5397) strengthens that constraint.
- **[#3534](https://github.com/vuejs/vitepress/issues/3534) — breadcrumb** (issue-open; 👍7, 11c) — [This sweep's view: blocker is the data model — markdown files don't know ancestors' titles. NB other sweeps dispute; resolved in the [README](./README.md).]
- **[#3160](https://github.com/vuejs/vitepress/issues/3160) — Full width layout for larger screens** (issue-not-planned; 👍0, 2c) — Typographic decline unaffected.
- **[#4953](https://github.com/vuejs/vitepress/issues/4953) — Show "On this page" more often <1280px** (issue-not-planned; 👍0, 2c) — ~80px recoverable; unaffected.
- **[#5178](https://github.com/vuejs/vitepress/issues/5178) — Cookie consent banner** (issue-not-planned; 👍0, 1c) — Out of scope; layout side covered under [#2071](https://github.com/vuejs/vitepress/issues/2071).
- **[#2938](https://github.com/vuejs/vitepress/issues/2938) — grayscale filter** (issue-not-planned; 👍0, 2c) — One-line custom.css override.
- **[#4917](https://github.com/vuejs/vitepress/issues/4917) — nav icon repaint claims** (issue-not-planned; 👍0, 4c) — Premise disputed with measurements.
- **[#4439](https://github.com/vuejs/vitepress/issues/4439) — --vp-c-text-1 bundle output** (issue-not-planned; 👍0, 1c) — Fixed in later releases.
- **[#703](https://github.com/vuejs/vitepress/issues/703) — font size follows browser settings** (pr-unmerged; 👍0, 1c) — Superseded by the rem migration.
- **[#5211](https://github.com/vuejs/vitepress/issues/5211) — css custom properties for font sizes** (pr-unmerged; 👍0, 1c) — Closed as unnecessary post-rem; line-height remainder tracked as [#5209](https://github.com/vuejs/vitepress/issues/5209).
- **[#4413](https://github.com/vuejs/vitepress/issues/4413) — theme switcher tri-state** (issue-not-planned; 👍1, 3c) and **[#5159](https://github.com/vuejs/vitepress/issues/5159) — auto detect system theme** (pr-unmerged; 👍0, 0c) — Product decline ("keep the UI simple as a toggle") undisturbed.
- **[#2912](https://github.com/vuejs/vitepress/issues/2912) — Hide JS-required features if JS disabled** (pr-open; 👍0, 9c) and **[#2680](https://github.com/vuejs/vitepress/issues/2680)** (issue-not-planned; 👍0, 4c) — kiaking: "wouldn't it make more sense if we create a new JS free theme"; structural objection stands.
- **[#2133](https://github.com/vuejs/vitepress/issues/2133) — smooth scroll** + duplicate cluster [#978](https://github.com/vuejs/vitepress/issues/978)/[#979](https://github.com/vuejs/vitepress/issues/979)/[#981](https://github.com/vuejs/vitepress/issues/981)/[#1002](https://github.com/vuejs/vitepress/issues/1002)/[#1449](https://github.com/vuejs/vitepress/issues/1449)/[#1544](https://github.com/vuejs/vitepress/issues/1544) — UI declined; motion-safety already handled (`base.css:232` forces `scroll-behavior: auto !important` under reduced motion).
- **[#4215](https://github.com/vuejs/vitepress/issues/4215) — page width changes when scrollbar appears** (issue-not-planned; 👍0, 3c) — Duplicate of [#1054](https://github.com/vuejs/vitepress/issues/1054).
