# Local nav & outline chrome

Part of the [theme chrome audit](./README.md) · snapshot 2026-08-24 · baselined on [#5397](https://github.com/vuejs/vitepress/pull/5397) (`navbar-redesign`)

## Already solved by [#5397](https://github.com/vuejs/vitepress/issues/5397)

- **[#2329](https://github.com/vuejs/vitepress/issues/2329) — feat(theme): use inert to avoid traverse menus and content with keyboard** (kind: pr-unmerged; demand: 👍0, 0c)
  - Moves `isScreenOpen` out of the composable closure and applies `inert` in `Layout.vue` so the covered page (including the local nav) is unreachable by keyboard while the mobile screen is open.
  - [#5397](https://github.com/vuejs/vitepress/issues/5397) lands exactly this, same files: `nav.ts` hoists `isScreenOpen`/`screenTriggerEl` to module scope, and `Layout.vue` passes `:inert="isScreenOpen"` to `VPLocalNav`, `VPSidebar`, `VPContent`, `VPFooter` and `VPSkipLink` (which gained an explicit `inert` prop because it has two root nodes).

## Fits a planned follow-up

- **[#4359](https://github.com/vuejs/vitepress/issues/4359) — Local navigation dropdown misplaced without sidebar** (kind: issue-open; demand: 👍0, 5c)
  - The outline dropdown panel is offset by the sidebar width even on pages with no sidebar, so it floats off-position. Maintainer's stated fix in-thread: `--vp-sidebar-width` should be 0 when there is no sidebar.
  - Local-nav/sidebar rework. Still unfixed on `navbar-redesign`: `VPLocalNavOutlineDropdown.vue:172` keeps `left: calc(var(--vp-sidebar-width) + 2rem)` unconditionally at `@media (min-width: 60rem)`, and `styles/vars.css:541` defines `--vp-sidebar-width: 17rem` as a static token that is never zeroed. The rework must make the sidebar column width a state-driven variable (0 when `hasSidebar` is false) so the dropdown, and every other consumer, positions from one source of truth instead of per-component overrides.

- **[#4393](https://github.com/vuejs/vitepress/issues/4393) — fix(components): Local navigation location error** (kind: pr-open; demand: 👍0, 16c)
  - Community fix for [#4359](https://github.com/vuejs/vitepress/issues/4359): adds a `has-sidebar` class to `VPLocalNavOutlineDropdown` and a `:not(.has-sidebar) .items { left: 32px }` override. Approved by a contributor, stalled awaiting a maintainer for months.
  - Local-nav/sidebar rework. The rework must absorb the outcome but not the mechanism — this PR adds a second hard-coded `left` and a duplicate `useSidebar()` call inside the dropdown, which is the exact per-component-override pattern [#5397](https://github.com/vuejs/vitepress/issues/5397) removed from the navbar. Implement at the variable level (zeroed `--vp-sidebar-width`) and credit/close this PR.

- **[#5090](https://github.com/vuejs/vitepress/issues/5090) — Theme suggestion: mobile TOC active highlight** (kind: issue-open; demand: 👍0, 0c)
  - The local nav's "On this page" dropdown renders the outline with no active-heading highlight, unlike the desktop aside.
  - Local-nav/sidebar rework. `useActiveAnchor` is currently single-consumer: it is called only from `VPDocAsideOutline.vue:16` and binds one container plus one marker element. The rework must make active-anchor tracking support two simultaneous consumers (aside outline and local-nav dropdown), so the dropdown gets `.active` and a marker without a parallel implementation.

- **[#5091](https://github.com/vuejs/vitepress/issues/5091) — feat: mobile TOC active highlight** (kind: pr-open; demand: 👍0, 0c)
  - Implements [#5090](https://github.com/vuejs/vitepress/issues/5090) by adding a second composable, `useFloatActiveAnchor(items, marker, open)`, plus a duplicated `.outline-marker` and `.outline-link.active` ruleset inside the dropdown.
  - Local-nav/sidebar rework. This PR is the evidence for the requirement above: the fork exists only because `useActiveAnchor` cannot serve a second, conditionally-mounted container. Rework should generalize the one composable and delete the need for `useFloatActiveAnchor`.

- **[#3392](https://github.com/vuejs/vitepress/issues/3392) — feat(theme): add 'inert' attribute to prevent unnecessary traversal of hidden content** (kind: pr-open; demand: 👍0, 1c)
  - Successor to [#2932](https://github.com/vuejs/vitepress/issues/2932): global inert controls exported from the default theme, plus a focus trap in the "On this page" popup. Touches `VPLocalNavOutlineDropdown.vue`, `Layout.vue`, `nav.ts`, `sidebar.ts`, `VPSkipLink.vue`.
  - Local-nav/sidebar rework. [#5397](https://github.com/vuejs/vitepress/issues/5397) took only the screen/Layout inert half. The unabsorbed delta is the local-nav dropdown itself: on the branch it has Escape and `useBodyScrollLock` but **no focus trap, no focus return to the trigger on close, and no inert on the page behind it** — even though it renders a near-full-height panel. The rework must give the dropdown the same disclosure contract [#5397](https://github.com/vuejs/vitepress/issues/5397) gave the navbar flyouts (focus containment while open, restore focus to the trigger on Escape/dismiss), and should also export the inert state so custom themes can reuse it.

- **[#3811](https://github.com/vuejs/vitepress/issues/3811) — 'Return to top' button is always visible in custom layout page** (kind: issue-open; demand: 👍0, 0c)
  - With `layout: foo` + `navbar: false` + `sidebar: false`, the local nav renders as a bare "Return to top" bar permanently, even at scroll top.
  - Local-nav/sidebar rework, specifically the nav-height DOM probe. Two concrete defects survive on the branch. (1) The probe in `VPLocalNav.vue:24-32` does `document.body.appendChild(probe)` with `height: var(--vp-nav-height)`, but the `--vp-nav-height: 0px` override lives on `.hide-nav` (`vars.css:520-522`), which is on the layout div, not `body` — so the probe always resolves the `:root` value of `4rem` and the `isScrolled` gate is wrong whenever `navbar: false`. (2) The render gate `!isHome && (hasLocalNav || hasSidebar || isScrolled)` has no notion of custom layouts, so any non-`home` layout gets the `empty`+`fixed` local nav. The rework must replace the probe with a declared `--vp-local-nav-height` variable resolved in the right cascade scope, and gate rendering on layout type rather than raw scroll position.

- **[#2320](https://github.com/vuejs/vitepress/issues/2320) — fix(theme): 'Return to top' button is always visible in the home page** (kind: pr-unmerged; demand: 👍0, 2c)
  - Earlier attempt at the same defect class (home-page variant, for [#2312](https://github.com/vuejs/vitepress/issues/2312)), patching `VPLocalNav.vue` and `sidebar.ts` together.
  - Local-nav/sidebar rework. Its value is the precedent that the visibility decision cannot live in the raw `y >= navHeight` comparison and must be co-derived with sidebar/layout state — the same coupling the rework is unifying. The home case was fixed since; the custom-layout case ([#3811](https://github.com/vuejs/vitepress/issues/3811)) was not.

- **[#2071](https://github.com/vuejs/vitepress/issues/2071) — Add support of Global Notification** (kind: issue-open; demand: 👍0, 5c)
  - Asks for a built-in dismissible banner. Reopened by a maintainer "for docs", then argued by a contributor (xsjcTony) that the slot approach is structurally broken.
  - Local-nav/sidebar rework — this is the `--vp-layout-top-height` requirement. The thread documents exactly what the rework must own: with the `layout-top` slot, users must hand-maintain a media-query-matched banner height, inject a `<head>` script to avoid a dismissal flash on reload, and still get CLS because the fixed navbar and `VPLocalNav` (`padding-top: var(--vp-layout-top-height, 0px)`, `VPLocalNav.vue:75`) are offset by a JS-set variable. Requirement: the layout-top offset must be resolved in SSR output, not assigned by script after hydration, and the local nav's sticky origin must follow it without a magic constant. Cited real-world breakage: oxc.rs shows the banner flash.

- **[#2334](https://github.com/vuejs/vitepress/issues/2334) — Using slot doc-top messes up active heading determination in aside** (kind: issue-open; demand: 👍0, 0c)
  - Content injected into `doc-top` shifts headings, so the active-heading calculation picks the wrong one. Reporter asks that it not depend on hard-coded constants.
  - Local-nav/sidebar rework. Partly addressed already — the old `__PAGE_OFFSET__` is gone and `outline.ts:165-166` now reads per-header `scrollMarginTop`. What remains is a local-nav-owned magic number: `styles/components/vp-doc.css:7,13` bakes `2.9375rem` (the local nav's height) into every heading's `scroll-margin-top` below `80rem`, and assumes the local nav is present there regardless of whether it actually renders. There is no `--vp-local-nav-height` variable anywhere in the theme. The rework must introduce one and have both `vp-doc.css` and the runtime probe consume it, so scroll-margin tracks the chrome that is actually on screen.

- **[#4940](https://github.com/vuejs/vitepress/issues/4940) — fix(theme): skip link jumps to aside instead main content heading/anchor** (kind: pr-open; demand: 👍0, 2c)
  - "Skip to content" resolves into the aside/outline rather than the main content heading; PR retargets to the first `h1` inside `#VPContent main` and makes the skip anchor `position: fixed`.
  - Local-nav/sidebar rework. [#5397](https://github.com/vuejs/vitepress/issues/5397) touched `VPSkipLink.vue` but only to add the `inert` prop — `href="#VPContent"` is unchanged, so the bug ships. The rework must define the skip target relative to main content, and decide the skip link's relationship to the sticky local nav (a `position: fixed` skip link and a sticky sub-bar compete for the same top-of-page region).

- **[#3773](https://github.com/vuejs/vitepress/issues/3773) — '#nav-screen-content-after' does not work when screen width between [768,1280)** (kind: issue-not-planned; demand: 👍0, 8c)
  - Neither `nav-screen-content-after` nor `nav-bar-content-after` gives the user a place to put extra nav content in the tablet band; reporter wants it folded into a popup menu there.
  - Local-nav/sidebar rework. The decline reason was structural, not a rejection of the need: in [768,1280) there is no nav screen to append to and the bar had no overflow container. [#5397](https://github.com/vuejs/vitepress/issues/5397) removed half that premise by giving the bar a real `⋯` overflow menu at any width. The rework must define where page-level extra nav content lives in the band where the local nav is the primary chrome, and make the slot contract explicit rather than silently rendering nothing.

- **[#4953](https://github.com/vuejs/vitepress/issues/4953) — Show "On this page" sidebar more often in <1280px width** (kind: issue-not-planned; demand: 👍0, 2c)
  - Asks for the aside outline below 1280px, showing that trimming `VPSidebar` padding 32→24px and dropping `VPDoc .content` horizontal padding frees the needed 80px at 1200px.
  - Local-nav/sidebar rework. The decline rested on two claims, and the rework invalidates the load-bearing one: "no community interest" plus "even in smaller viewports, the *on this page* section is still expandable" — i.e. the local nav dropdown is the accepted substitute for the aside in this band. That makes it the rework's obligation to make the dropdown an adequate substitute (active highlight per [#5090](https://github.com/vuejs/vitepress/issues/5090), correct positioning per [#4359](https://github.com/vuejs/vitepress/issues/4359), focus handling per [#3392](https://github.com/vuejs/vitepress/issues/3392)). If the rework also revisits the 960/1280 band for [#4897](https://github.com/vuejs/vitepress/issues/4897), the padding budget in this issue is concrete input.

- **[#1764](https://github.com/vuejs/vitepress/issues/1764) — Navbar is not sticky in mobile breakpoint** (kind: issue-not-planned; demand: 👍1, 2c)
  - The primary navbar is not sticky at mobile widths; only the secondary (local) nav is. Reporter notes the home layout has no secondary nav, so nothing is sticky there.
  - Local-nav/sidebar rework. Declined as "a design choice — only the secondary nav is sticky", which is precisely the contract the rework is redefining. The unmet case is concrete and survives: on `isHome` and on any page where `VPLocalNav` does not render, the "secondary nav is the sticky one" rule leaves the user with no sticky chrome at all. The rework must state which element owns stickiness per layout, rather than leaving it implicit in the local nav's render gate.

- **(delta on known [#4897](https://github.com/vuejs/vitepress/issues/4897))** (kind: issue-open; demand: 👍0, 5c)
  - Thread carries a concrete SSR mechanism the PR body does not record.
  - The PR body says only "SSR determinism for the local nav ([#4897](https://github.com/vuejs/vitepress/issues/4897))". The thread adds: brc-dd proposes stamping a class on `<html>` **at build time**, conditional on the SSR'd HTML actually containing header anchors *and* outline/aside not being disabled in frontmatter/themeConfig — i.e. decide the local nav's presence from build output rather than on hydration. sapphi-red adds a hard constraint the rework must not break: header-less pages must end up with no local nav, and he was unable to remove it on hydration for `/guide/mpa-mode` (a real page with no headers). brc-dd also signals MPA mode is acceptable collateral. Record both the mechanism and the header-less-page test case.

- **(delta on known [#3393](https://github.com/vuejs/vitepress/issues/3393))** (kind: issue-not-planned; demand: 👍0, 5c)
  - Thread contains a requirement and a constraint the PR body's "the sidebar curtain" bullet does not capture.
  - Requirement: giladgd needs the curtain back as an **opt-in flag**, not a CSS recipe, and demonstrates why — it needs an extra DOM element plus the logic built around it, so a pure-CSS override cannot reproduce it (he is pinned to an old VitePress version over this). Constraint from elringus, which the rework's implementation must satisfy: the old curtain intercepted pointer events over visibly-unobscured links, so a restored curtain must be pointer-events-transparent. bluwy's "can't please everyone with different designs" is the standing counterweight, which an opt-in flag resolves rather than fights.

## New candidates for future rework

- **[#3534](https://github.com/vuejs/vitepress/issues/3534) — breadcrumb** (kind: issue-open; demand: 👍7, 11c)
  - Requests a built-in breadcrumb trail above the page title. Highest 👍 count in this area and unaddressed anywhere in [#5397](https://github.com/vuejs/vitepress/issues/5397)'s plan.
  - A rework of page-level nav chrome would incorporate it as the natural third element of the local nav / doc-top region, alongside the "Menu" trigger and the outline dropdown. The blocker recorded in-thread is data, not layout: brc-dd notes only the leaf can be inferred from the title, and peterbe's case (markdown copied in from another repo, no controllable frontmatter) rules out per-file frontmatter. So the requirement is deriving the ancestor path from the resolved sidebar structure, with frontmatter as an override — the same sidebar resolution the rework already has in hand.

- **[#4521](https://github.com/vuejs/vitepress/issues/4521) — Scroll to top button on desktop** (kind: issue-open; demand: 👍4, 3c)
  - Wants a go-to-top affordance on long pages at desktop widths. Commenters note the mobile "Go to top" is not visible to them either.
  - A rework would treat this as parity, not a new feature: the local nav already ships "Return to top" as the dropdown's empty-state button, so the question is where that same action lives once the local nav is absent (≥80rem). Natural home is the aside outline footer, sharing the local nav's `scrollToTop` and the `returnToTopLabel` string rather than adding a second label and handler.

- **[#4522](https://github.com/vuejs/vitepress/issues/4522) — feat: add scroll to top button in VPDocAsideOutline component** (kind: pr-unmerged; demand: 👍3, 0c)
  - 16-line implementation of [#4521](https://github.com/vuejs/vitepress/issues/4521) in `VPDocAsideOutline.vue`. Closed without discussion.
  - Shows the minimal shape but hard-codes its own button and copy. A rework should hoist the return-to-top control into a shared piece used by both the local nav dropdown and the aside, so the two surfaces cannot drift.

- **[#2146](https://github.com/vuejs/vitepress/issues/2146) — Auto expand/collapse sections in page outline** (kind: issue-open; demand: 👍8, 2c)
  - Deeply nested outlines are hard to scan; asks that child headings expand only while their parent is active. Includes light/dark mockups of the target behavior.
  - Highest-demand outline behavior request. It interacts with the local nav because `VPDocOutlineItem` is shared verbatim by the dropdown, where vertical space is scarcest (the panel is height-capped by `--vp-vh`) — so collapsing benefits the dropdown more than the aside. A rework that generalizes active-anchor tracking to two consumers (see [#5090](https://github.com/vuejs/vitepress/issues/5090)/[#5091](https://github.com/vuejs/vitepress/issues/5091)) is the same change that makes "expand the active branch" implementable in both.

- **[#2297](https://github.com/vuejs/vitepress/issues/2297) — fix: better .has-aside condition** (kind: pr-unmerged; demand: 👍0, 0c)
  - Recomputes `.has-aside` from rendered slots, `theme.carbonAds`, `getHeaders()` and the `layout`/`aside` configs, with unit tests for slot detection.
  - Relevant because `hasAside` and `hasLocalNav` are decided by different rules today (`layout.ts` derives `hasAside` from config only, `hasLocalNav` from `headers.length`), so the two can disagree about whether a page has an outline at all. A rework should make outline presence one derived fact consumed by the aside, the local nav and the band handoff at 960/1280px; this PR's slot-and-config detection is the prior art for that predicate.

## Not viable

- **[#4735](https://github.com/vuejs/vitepress/issues/4735) — feat: add scroll support for the TOC** (kind: pr-unmerged; demand: 👍5, 1c) — Shipped differently in [#5377](https://github.com/vuejs/vitepress/issues/5377) (merged); `outline.ts:199` now calls `activeLink.scrollIntoView({ block: 'nearest' })`.
- **[#3351](https://github.com/vuejs/vitepress/issues/3351) — Keep aside marker visible** (kind: issue-open; demand: 👍0, 0c) — Resolved by merged [#5377](https://github.com/vuejs/vitepress/issues/5377) but never closed. Recommend closing rather than reworking.
- **[#3387](https://github.com/vuejs/vitepress/issues/3387) — Fix: Make the outline follow the page scroll** (kind: pr-unmerged; demand: 👍0, 2c) — Superseded by merged [#5377](https://github.com/vuejs/vitepress/issues/5377).
- **[#4634](https://github.com/vuejs/vitepress/issues/4634) — feat: active outline link scroll to page center** (kind: pr-unmerged; demand: 👍0, 3c) — Superseded by merged [#5377](https://github.com/vuejs/vitepress/issues/5377), which chose `block: 'nearest'` over centering.
- **[#4457](https://github.com/vuejs/vitepress/issues/4457) — feat(theme): add doc aside scroll spy** (kind: pr-unmerged; demand: 👍0, 1c) — Superseded by merged [#5377](https://github.com/vuejs/vitepress/issues/5377).
- **[#3901](https://github.com/vuejs/vitepress/issues/3901) — feat: Improve Sidebar and Aside Link Visibility on Mount and Route Change** (kind: pr-open; demand: 👍0, 0c) — Aside half superseded by merged [#5377](https://github.com/vuejs/vitepress/issues/5377); remaining half ([#3426](https://github.com/vuejs/vitepress/issues/3426), scroll active sidebar link into view) is sidebar scope.
- **[#2189](https://github.com/vuejs/vitepress/issues/2189) — fix(theme): ensure correct outline state** (kind: pr-unmerged; demand: 👍0, 1c) — Both symptoms gone from current `outline.ts`; bluwy closed as "most of the issue explained is now fixed".
- **[#2676](https://github.com/vuejs/vitepress/issues/2676) — fix(theme): outline marker flicks when navigating towards above** (kind: pr-unmerged; demand: 👍0, 3c) — Targets an activation path that no longer exists; marker positioning rewritten (`outline.ts:190-201`).
- **[#1631](https://github.com/vuejs/vitepress/issues/1631) — feat: add Set custom menu/return to top labels** (kind: pr-unmerged; demand: 👍0, 1c) — Already shipped: `sidebarMenuLabel` and `returnToTopLabel` live.
- **[#2455](https://github.com/vuejs/vitepress/issues/2455) — fix(theme): nav bar overflowed by aside when no sidebar** (kind: pr-unmerged; demand: 👍0, 7c) — Its issue [#2442](https://github.com/vuejs/vitepress/issues/2442) closed as completed; [#5397](https://github.com/vuejs/vitepress/issues/5397) rebuilt the geometry it patched.
- **[#1916](https://github.com/vuejs/vitepress/issues/1916) — fix 1915: aside always rendered even when outline is false** (kind: pr-unmerged; demand: 👍0, 1c) — Issue [#1915](https://github.com/vuejs/vitepress/issues/1915) closed as completed; handling in `layout.ts` today.
- **[#3194](https://github.com/vuejs/vitepress/issues/3194) — TOC aside height problem** (kind: issue-open; demand: 👍0, 0c) — Aside-only positioning complaint; no local-nav interaction.
- **[#5074](https://github.com/vuejs/vitepress/issues/5074) — feat(theme): add active link on mobile menu** (kind: pr-unmerged; demand: 👍0, 2c) — Patches `VPNavScreenMenuLink.vue`, which [#5397](https://github.com/vuejs/vitepress/issues/5397) deletes; [#5068](https://github.com/vuejs/vitepress/issues/5068) addressed on main by 0f0fe135.
- **[#1145](https://github.com/vuejs/vitepress/issues/1145) — Dynamic Outline** (kind: issue-not-planned; demand: 👍0, 6c) — Markdown/build-time concern, out of area.
- **[#2134](https://github.com/vuejs/vitepress/issues/2134) — Aside Location Order** (kind: issue-not-planned; demand: 👍0, 3c) — Already supported via `aside: 'left'`.
