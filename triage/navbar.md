# Navbar core — bar, mobile screen, dropdowns, overflow

Part of the [theme chrome audit](./README.md) · snapshot 2026-08-24 · baselined on [#5397](https://github.com/vuejs/vitepress/pull/5397) (`navbar-redesign`)

## Already solved by [#5397](https://github.com/vuejs/vitepress/issues/5397)

- **[#5097](https://github.com/vuejs/vitepress/issues/5097) — Allow overflow-x with horizontal scrolling in VPNav** (kind: pr-unmerged; demand: 👍0, 4c)
  - Adds `overflow-x: auto` to the nav so a wide nav scrolls instead of being truncated above the hard-coded 960px media query; author later scoped it to the menu only and got stuck because dropdowns stopped floating once a scroll container existed.
  - Solved by the measured `⋯` overflow menu plus removal of the fixed cluster breakpoint. The author's blocker (dropdown panels clipped by the scroll container) is structurally avoided because nothing becomes a scroll/clip ancestor. Downstream reports LuxDL/DocumenterVitepress.jl [#61](https://github.com/LuxDL/DocumenterVitepress.jl/issues/61) and [#118](https://github.com/LuxDL/DocumenterVitepress.jl/issues/118) are covered too.

- **[#2329](https://github.com/vuejs/vitepress/issues/2329) — feat(theme): use inert…** (kind: pr-unmerged; demand: 👍0, 0c)
  - Solved: `Layout.vue` passes `:inert="isScreenOpen"` to `VPSkipLink`, `VPLocalNav`, `VPSidebar`, `VPContent`, `VPFooter`, with `isScreenOpen` module-scoped in `composables/nav.ts`.

- **[#1448](https://github.com/vuejs/vitepress/issues/1448) — fix(theme): Make the menu traversable only when the menu is visible** (kind: pr-unmerged; demand: 👍0, 3c)
  - Solved on all three review counts: inert is the trap, Escape closes + restores focus to hamburger, screen accordions are real disclosures — which also closes the residual leak where the collapsed locale list kept links tabbable behind `overflow: hidden`.

- **[#1283](https://github.com/vuejs/vitepress/issues/1283) — fix: nav items overflow** (kind: pr-unmerged; demand: 👍0, 1c)
  - One-line CSS attempt at [#1271](https://github.com/vuejs/vitepress/issues/1271); superseded by the priority-plus `⋯` menu.

- **[#5198](https://github.com/vuejs/vitepress/issues/5198) — fix(theme-default): stabilize horizontal layout across pages with/without vertical scrollbar** (kind: pr-open; demand: 👍0, 0c)
  - Diagnoses a ~15px shift at ≥1440px on classic-scrollbar browsers: offsets computed from `100vw` inside `width: 100%` containers. Proposes `overflow-y: scroll` on `html`.
  - The navbar's contribution is deleted: no more `margin-right: -100vw; padding-right: 100vw` bleed; `VPNavBar`/`VPLocalNav`/`VPContent` contain zero `100vw`. Residual is the already-decided [#5310](https://github.com/vuejs/vitepress/issues/5310) scrollbar-gutter question. (Sidebar sweep tracks the general problem under [#1054](https://github.com/vuejs/vitepress/issues/1054).)

## Fits a planned follow-up

- **[#3069](https://github.com/vuejs/vitepress/issues/3069) — feat(client): Add folding function to the navigation bar** (kind: pr-open; demand: 👍2, 0c)
  - Adds a `collapsed` flag on dropdown menu groups so a group inside a flyout renders as an expandable section with a chevron.
  - Fits the "nested dropdowns ([#3816](https://github.com/vuejs/vitepress/issues/3816))" follow-up. Requirement beyond the PR body: [#5397](https://github.com/vuejs/vitepress/issues/5397) made nested groups *render*, but `VPMenuGroup.vue` still emits a static `<p class="title">` — no toggle, no disclosure semantics. Needs a per-group `collapsed?: boolean` on `NavItemChildren` and a button/`aria-expanded` title, the same disclosure treatment `VPNavMenuGroup` already applies in the screen. (Note: the sidebar sweep flags this PR's implementation as reintroducing nested `role="button"` — absorb the feature, not the patch.)

- **[#4359](https://github.com/vuejs/vitepress/issues/4359) / [#4393](https://github.com/vuejs/vitepress/issues/4393) — Local nav dropdown misplaced without sidebar** (issue-open 5c / pr-open 16c)
  - Fits the local-nav/sidebar rework. Requirement it adds: the local nav needs the same presence-derived column offset the navbar just gained (`--vp-nav-col-offset`), rather than reading `--vp-sidebar-width` unconditionally — `VPLocalNav.vue` still does `padding-left: var(--vp-sidebar-width)`.

- **[#2866](https://github.com/vuejs/vitepress/issues/2866) — feat: add middle slot in navbar** (kind: pr-open; demand: 👍1, 0c) and **[#2831](https://github.com/vuejs/vitepress/issues/2831) — Whether can add a slot in VPnavbar** (kind: issue-open; demand: 👍0, 1c)
  - Request for a slot in the middle of the bar.
  - Fits the "[#4000](https://github.com/vuejs/vitepress/issues/4000) component-collapse contract" follow-up. Requirement it adds: arbitrary slot content in the bar is invisible to the ResizeObserver in `composables/nav-overflow.ts`, which only measures registered menu items and the three cluster units. The [#4000](https://github.com/vuejs/vitepress/issues/4000) contract has to cover slot content, not just `component` nav items, or a middle slot silently re-introduces the crowding [#2842](https://github.com/vuejs/vitepress/issues/2842) fixed.

## New candidates for future rework

- **[#2081](https://github.com/vuejs/vitepress/issues/2081) — socialLinks items are not accessible** (issue-not-planned; 👍0, 1c) and **[#3014](https://github.com/vuejs/vitepress/issues/3014) — style(theme): configurable title attribute on custom social icons** (pr-unmerged; 👍0, 2c)
  - Both declined with "put a `<title>` inside your SVG".
  - Live gap: `VPSocialLink.vue` computes `:aria-label="ariaLabel ?? (typeof icon === 'string' ? icon : '')"` — a custom `{ svg }` icon with no `ariaLabel` gets `aria-label=""`, an unnamed link, rendered in the bar, drawer and `⋯` menu. The unified `VPNavSocialLinks` gives one place to require or derive a name (fall back to hostname, or warn in dev).

- **[#3086](https://github.com/vuejs/vitepress/issues/3086) — Navbar visible on print when navbar=false** (issue-open; 👍0, 0c), **[#2913](https://github.com/vuejs/vitepress/issues/2913) — Hide some UI elements when printing** (pr-open; 👍0, 7c), **[#3123](https://github.com/vuejs/vitepress/issues/3123) — don't print navbar when disabled in frontmatter (narrow screens)** (pr-unmerged; 👍0, 2c)
  - The theme has no `@media print` rules at all. With the bar now one surface with a single state rule and one shared geometry, a print block is a small self-contained addition rather than the per-mode selector sprawl that made [#2913](https://github.com/vuejs/vitepress/issues/2913)'s review stall on scope.

- **[#3383](https://github.com/vuejs/vitepress/issues/3383) — Fix transparent nav bar** (kind: pr-unmerged; demand: 👍0, 5c)
  - Proposed a `transparentNavBar` frontmatter flag for `layout: page`. Declined by kiaking: styling belongs in CSS variables, not config — but he counter-proposed that the bar should be transparent by default on `page` when there is no sidebar and no local nav.
  - The decline reason is now fully satisfiable: `--vp-nav-home-bg-color` exists and transparent-until-scroll is a single state rule. kiaking's counter-proposal is the unaddressed part and is now a one-condition change to that rule.

- **[#2085](https://github.com/vuejs/vitepress/issues/2085) — navbar inconsistent behaviour** (kind: issue-open; demand: 👍0, 6c)
  - Three different hover treatments across nav element types: `VPFlyout` hovers to `--vp-c-brand-1`, `VPSocialLink` to `--vp-c-text-1`, `VPNavMenuLink` has its own rule, `VPNavBarTitle` has no hover rule at all.
  - Now that all are siblings in one component set, a shared nav-interactive token is a contained change. (A11y sweep adds: the thread's WCAG carve-out is met by the missing `input:focus-visible` outline defect.)

- **[#4347](https://github.com/vuejs/vitepress/issues/4347) — Language selector points to missing URLs** (kind: issue-open; demand: 👍0, 0c)
  - `VPNavTranslations.vue` calls `useLangs({ linkToCorrespondingPage: true })` once and feeds all three renderings, so an existence check in `composables/langs.ts` fixes every surface at once. Needs build-time knowledge of which locale pages exist.

- **[#4364](https://github.com/vuejs/vitepress/issues/4364) — Links in the Nav bar do not support rewrites** (kind: issue-open; demand: 👍1, 0c)
  - A `rewrites` entry is honored by hero actions, feature cards and in-page links, but not nav links.
  - [#5397](https://github.com/vuejs/vitepress/issues/5397) routed every nav href through one composable, `useNavItemLink` in `composables/nav.ts`, consumed by `VPNavMenuLink` and `VPMenuLink` in the bar, drawer, dropdowns and `⋯` menu. Rewrite-aware normalization now has exactly one insertion point.

- **[#4141](https://github.com/vuejs/vitepress/issues/4141) — Allow SVG logo to be inlined** (kind: issue-open; demand: 👍1/tot 2, 1c)
  - Inline the logo as `<svg>` rather than `<img>` so CSS can theme it (dark-mode-adaptive single file).
  - `VPNavBarTitle.vue` renders `<VPImage>` unconditionally. Logo-shaped counterpart to the surface theming pass; `--vp-nav-logo-height` establishes the precedent. Related: [#1742](https://github.com/vuejs/vitepress/issues/1742) (not planned, same request).

- **[#2706](https://github.com/vuejs/vitepress/issues/2706) — nav-bar-after slot below the bar** (kind: issue-open; demand: 👍0, 2c)
  - A slot *below* the bar (not inside it) for a full-bleed banner. Doesn't touch overflow measurement, but must compose with the full-bleed background surface and `--vp-nav-height` consumers. Natural home: `VPNav.vue` between the bar and `VPLocalNav`.

- **[#522](https://github.com/vuejs/vitepress/issues/522) — NavBar can not be hidden** (kind: issue-not-planned; demand: 👍0, 5c)
  - Closed with "use `display: none`", but the thread surfaced two real gaps: per-page hiding isn't possible with CSS, and `VPContent` keeps its `padding-top` for a bar that isn't there. kiaking's last word was "Yeah I think we can add this feature... open a new issue" — nobody did.
  - `frontmatter.navbar !== false` already gates `VPNav`, and `--vp-nav-height` is now the single geometry input consumed by `VPContent`, `VPNavScreen` and the local nav, so zeroing it per-page is one rule. Pairs with [#3086](https://github.com/vuejs/vitepress/issues/3086)/[#2913](https://github.com/vuejs/vitepress/issues/2913). (Local-nav sweep: the `.hide-nav` → `--vp-nav-height: 0px` override currently lives on the layout div where the local nav's body-appended probe can't see it.)

- **[#3407](https://github.com/vuejs/vitepress/issues/3407) — Add separator/delimiter between nav links** (kind: issue-open; demand: 👍0, 0c)
  - `{ type: 'separator' }` as a nav item. `VPNavMenu.vue` already branches on item shape, so a fourth branch is cheap — but the overflow engine must treat separators as zero-priority: `computeNavFit` collapses items right-to-left by index, and a separator stranded at the visible/collapsed boundary would render as a dangling rule.

- **[#1764](https://github.com/vuejs/vitepress/issues/1764) — Navbar is not sticky in mobile breakpoint** (kind: issue-not-planned; demand: 👍1, 2c)
  - Declined as design choice ("only the secondary nav is sticky"). Unanswered rebuttal: on mobile home there is no secondary nav, so nothing is sticky at all.
  - Still exactly true — `VPNav.vue` is `position: relative`, `fixed` only at `min-width: 60rem`. With one background surface and one state rule, the change is a media-query edit rather than a background/divider cascade.

## Not viable

- **[#4413](https://github.com/vuejs/vitepress/issues/4413) — Theme switcher should be more clear and obvious** (issue-not-planned; 👍1, 3c) — Declined on product grounds; [#5397](https://github.com/vuejs/vitepress/issues/5397) already fixed the concrete half (accessible name no longer contradicts state).
- **[#4978](https://github.com/vuejs/vitepress/issues/4978) — gap between VPNavBar and VPNavScreen when partially scrolled** (pr-unmerged; 👍0, 2c) — Target [#4972](https://github.com/vuejs/vitepress/issues/4972) fixed by merged [#5369](https://github.com/vuejs/vitepress/issues/5369).
- **[#5074](https://github.com/vuejs/vitepress/issues/5074) — active link on mobile menu** (pr-unmerged; 👍0, 2c) — [#5068](https://github.com/vuejs/vitepress/issues/5068) completed via [#5086](https://github.com/vuejs/vitepress/issues/5086); current-link marking in [#5395](https://github.com/vuejs/vitepress/issues/5395); `VPMenuLink` already emits `active` + `aria-current`.
- **[#2260](https://github.com/vuejs/vitepress/issues/2260) — close dropdown menus after item click** (pr-unmerged; 👍0, 3c) — [#2132](https://github.com/vuejs/vitepress/issues/2132) completed; `VPFlyout` closes on `route.path` change.
- **[#2741](https://github.com/vuejs/vitepress/issues/2741) — properly re-apply navbar classes** (pr-unmerged; 👍0, 0c) — Target [#2364](https://github.com/vuejs/vitepress/issues/2364) completed.
- **[#2455](https://github.com/vuejs/vitepress/issues/2455) — nav bar overflowed by aside when no sidebar** (pr-unmerged; 👍0, 7c) — Target [#2442](https://github.com/vuejs/vitepress/issues/2442) completed.
- **[#4502](https://github.com/vuejs/vitepress/issues/4502) — Allow clicks on custom navbar** (pr-unmerged; 👍0, 3c) — `pointer-events: none` on `VPNav` is deliberate (keeps sidebar scrollbar top clickable), unchanged after [#5397](https://github.com/vuejs/vitepress/issues/5397).
- **[#2597](https://github.com/vuejs/vitepress/issues/2597) — css variable for navbar logo height** (pr-unmerged; 👍0, 0c) — Shipped: `--vp-nav-logo-height` via merged [#2644](https://github.com/vuejs/vitepress/issues/2644).
- **[#1631](https://github.com/vuejs/vitepress/issues/1631) / [#2259](https://github.com/vuejs/vitepress/issues/2259) — label config PRs** — Shipped (`returnToTopLabel`, `darkModeSwitchLabel`, `lightModeSwitchTitle`, `darkModeSwitchTitle`) alongside [#5397](https://github.com/vuejs/vitepress/issues/5397)'s new labels.
- **[#2747](https://github.com/vuejs/vitepress/issues/2747) — langMenuLabel does nothing** (issue-not-planned; 👍0, 1c) — Working as designed (aria-label, not visible text).
- **[#5129](https://github.com/vuejs/vitepress/issues/5129) — Add force-light appearance** (pr-unmerged; 👍0, 3c) — `appearance: false` is equivalent; no counter-repro produced.
- **[#5170](https://github.com/vuejs/vitepress/issues/5170) — normalize navbar search keycaps** (pr-unmerged; 👍0, 0c) — Target [#2885](https://github.com/vuejs/vitepress/issues/2885) completed.
- **[#4917](https://github.com/vuejs/vitepress/issues/4917) — Frequent redrawing of navigation bar icons** (issue-not-planned; 👍0, 4c) — Traced to the reporter's own clock widget.
- **[#2912](https://github.com/vuejs/vitepress/issues/2912) — Hide JS-required features if JS disabled** (pr-open; 👍0, 9c) — kiaking argued for a separate JS-free theme; [#5397](https://github.com/vuejs/vitepress/issues/5397) doesn't worsen it (`nav-overflow` is all-visible during SSR; `VPNavBarExtra` is `v-if="hasContent"`), degrades cleanly.
- **[#1008](https://github.com/vuejs/vitepress/issues/1008) / [#4061](https://github.com/vuejs/vitepress/issues/4061) — Multiple/secondary navbars** — kiaking's scope decline stands.
- **[#1216](https://github.com/vuejs/vitepress/issues/1216) — export VPSocialLinks** (pr-unmerged; 👍0, 1c) — Deliberate API-surface decision, unrelated to the redesign.
- **[#1089](https://github.com/vuejs/vitepress/issues/1089), [#1682](https://github.com/vuejs/vitepress/issues/1682), [#1550](https://github.com/vuejs/vitepress/issues/1550), [#1742](https://github.com/vuejs/vitepress/issues/1742)** (issue-not-planned) — Obsolete or redirected: first two answered by i18n work ([#631](https://github.com/vuejs/vitepress/issues/631)); [#1550](https://github.com/vuejs/vitepress/issues/1550) duplicate of known [#109](https://github.com/vuejs/vitepress/issues/109); [#1742](https://github.com/vuejs/vitepress/issues/1742) superseded by [#4141](https://github.com/vuejs/vitepress/issues/4141).
