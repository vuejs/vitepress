# Sidebar — drawer, groups, scroll, data layer

Part of the [theme chrome audit](./README.md) · snapshot 2026-08-24 · baselined on [#5397](https://github.com/vuejs/vitepress/pull/5397) (`navbar-redesign`)

## Already solved by [#5397](https://github.com/vuejs/vitepress/issues/5397)

- **[#3517](https://github.com/vuejs/vitepress/issues/3517) — accessibility: interactive controls should not be nested** (kind: issue-open; demand: 👍0, 1c)
  - The collapsible group header was a `tabindex="0"` / `role="button"` row wrapping a second `role="button"` caret; axe reports ~102 failing nodes per page and ~70 redundant tab stops on a 326-page site.
  - Solved in the branch, but by `ed2bfb26 fix(theme): render sidebar group toggles as native buttons` on `main` (which [#5397](https://github.com/vuejs/vitepress/issues/5397) sits on), not by [#5397](https://github.com/vuejs/vitepress/issues/5397)'s own diff. `VPSidebarItem.vue` now renders one native `<button type="button" :aria-expanded>` caret, the row keeps a mouse-only click handler, and `sectionTag` only emits `<section>` when a heading exists. The commenter's separate Space-key ask is also resolved for free by the native button. Safe to close.
- **[#5251](https://github.com/vuejs/vitepress/issues/5251) — fix: avoid nested sidebar controls** (kind: pr-open; demand: 👍0, 0c)
  - Makes non-link carets decorative and keeps the caret as the toggle for linked groups; fixes [#3517](https://github.com/vuejs/vitepress/issues/3517) with e2e coverage.
  - Superseded by `ed2bfb26`, which took the inverse split (caret is always the single control). Close as obsolete.
- **[#5371](https://github.com/vuejs/vitepress/issues/5371) — fix(theme): remove invalid role and tabindex from VPSidebarItem wrapper** (kind: pr-unmerged; demand: 👍0, 0c)
  - Same nested-control removal, minimal diff.
  - Already absorbed: `ed2bfb26` says `closes #5371` and credits the author as co-author.
- **[#3802](https://github.com/vuejs/vitepress/issues/3802) — interactive controls are not nested [#3517]** (kind: pr-unmerged; demand: 👍0, 1c)
  - Original 2024 attempt at the same one-control-per-header rule.
  - Superseded by `ed2bfb26`; its rationale is what shipped.

## Fits a planned follow-up

- **[#3392](https://github.com/vuejs/vitepress/issues/3392) — feat(theme): add 'inert' attribute to prevent unnecessary traversal of hidden content** (kind: pr-open; demand: 👍0, 1c)
  - Adds a shared `composables/inert.ts` exposing `isScreenOpen` / `isSidebarOpen` / `isSidebarVisible` and threads `inert` into nav, localNav, sidebar, content, footer and skip-link; also adds a focus trap to the outline popup.
  - Fits the sidebar rework (the "closed sidebar staying in the tab order" item). [#5397](https://github.com/vuejs/vitepress/issues/5397) wired inert for `isScreenOpen` only. Concretely the rework must: (a) give closed `.VPSidebar` `visibility: hidden` — the base rule only sets `opacity: 0; transform: translateX(-100%)`, and `visibility: visible` appears only under `.open` and the `min-width: 60rem` block, so every sidebar link is focusable while the drawer is shut; (b) mark the page inert behind the open drawer and trap focus, generalizing [#5397](https://github.com/vuejs/vitepress/issues/5397)'s `isScreenOpen` inert to a shared control; (c) fix `VPSidebar.vue`'s open-focus, which puts `ref="navEl"` on the `<aside>` while `tabindex="-1"` is on the inner `<nav>`, so `navEl.value?.focus()` is a no-op today. Note the reviewer comment "Sidebar not woking..." — the draft's sidebar branch is unfinished.
- **[#2329](https://github.com/vuejs/vitepress/issues/2329) — feat(theme): use inert to avoid traverse menus and content with keyboard** (kind: pr-unmerged; demand: 👍0, 0c)
  - Earlier inert pass over `Layout.vue`, `VPSkipLink.vue` and `nav.ts`.
  - Same follow-up. Its load-bearing datum: it states [#1332](https://github.com/vuejs/vitepress/issues/1332) ("drawer should not be traversable when not shown") was closed by [#1491](https://github.com/vuejs/vitepress/issues/1491) but regressed and is not fixed in current versions — [#1332](https://github.com/vuejs/vitepress/issues/1332) is still marked completed, so the rework should reopen or re-verify it rather than trust the closed state.
- **[#4359](https://github.com/vuejs/vitepress/issues/4359) — Local navigation dropdown misplaced without sidebar** (kind: issue-open; demand: 👍0, 5c)
  - With no sidebar the "On this page" dropdown is offset right by the sidebar width. Maintainer's stated fix: `--vp-sidebar-width` should be 0 when there is no sidebar.
  - Fits the local-nav rework. [#5397](https://github.com/vuejs/vitepress/issues/5397) touched `VPLocalNavOutlineDropdown.vue` only for disclosure semantics; line 172 still reads `left: calc(var(--vp-sidebar-width) + 2rem)` unconditionally, and `VPLocalNav.vue:90` has the same unconditional `padding-left`. The rework must make `--vp-sidebar-width` resolve to 0 without a sidebar (or gate on a `has-sidebar` class) — the same one-variable discipline [#5397](https://github.com/vuejs/vitepress/issues/5397) applied when it deleted the five duplicated sidebar-width calcs from the navbar.
- **[#4393](https://github.com/vuejs/vitepress/issues/4393) — fix(components): Local navigation location error** (kind: pr-open; demand: 👍0, 16c)
  - The fix for [#4359](https://github.com/vuejs/vitepress/issues/4359), reworked on review feedback to drive `left` from a `has-sidebar` class; explicitly LGTM'd by yuyinws and cc'd to the maintainer, then stalled.
  - Same follow-up as [#4359](https://github.com/vuejs/vitepress/issues/4359). The rework should adopt the class-driven approach and credit the author; there is no technical objection on the thread, only inactivity.
- **[#3804](https://github.com/vuejs/vitepress/issues/3804) — sidebar: use native <details> for collapsible groups** (kind: issue-open; demand: 👍0, 1c)
  - Asks for native `<details>` for group toggles: standard keyboard behavior, better announcement, less custom JS.
  - Fits the sidebar rework. Delta after `ed2bfb26`: the Space-key half is already fixed (native `<button>`), so what remains is purely the structural ask. [#5397](https://github.com/vuejs/vitepress/issues/5397)'s progressive-enhancement list already commits to `details`/`summary` with `::details-content` for the *nav drawer* accordions — the sidebar rework should extend that same decision to sidebar groups, which is where the request originated.
- **[#3806](https://github.com/vuejs/vitepress/issues/3806) — sidebar uses native <details> for collapsible groups [#3804. also [#3517](https://github.com/vuejs/vitepress/issues/3517)]** (kind: pr-open; demand: 👍0, 12c)
  - Real implementation, +78/−99 across 3 files, unblocked by the Vue fix it was waiting on and repeatedly offered by the author, who has been asking for review since 2024.
  - Same follow-up; this is the ready-made starting point. One requirement it surfaces that the PR body does not cover: the maintainer explicitly rejected the [#3805](https://github.com/vuejs/vitepress/issues/3805) half ("clicking a linked group heading should still uncollapse the section"), so the rework must keep click-on-heading toggling as-is when moving to `<details>` — the `<summary>` cannot swallow the link's navigation.
- **[#5090](https://github.com/vuejs/vitepress/issues/5090) — Theme suggestion: mobile TOC active highlight** (kind: issue-open; demand: 👍0, 0c)
  - The mobile "On this page" dropdown does not mark the currently-active heading, unlike the desktop outline.
  - Fits the local-nav rework. `VPLocalNavOutlineDropdown.vue` renders `VPDocOutlineItem` with no active state and carries `data-allow-mismatch="style"`; the rework's SSR-determinism pass over the local nav should replace that band-aid and add the active marker in the same change.
- **[#5091](https://github.com/vuejs/vitepress/issues/5091) — feat: mobile TOC active highlight** (kind: pr-open; demand: 👍0, 0c)
  - The implementation of [#5090](https://github.com/vuejs/vitepress/issues/5090).
  - Same follow-up; fold into the local-nav rework rather than merging standalone, since the rework rewrites the component it patches.
- **[#4330](https://github.com/vuejs/vitepress/issues/4330) — Open sidebar with touch navigation (swipe) (bug in useSidebar?)** (kind: issue-not-planned; demand: 👍0, 3c)
  - Asks for VuePress-style swipe-to-open, and reports that `useSidebar` cannot be used to open/close the drawer from a custom layout at all.
  - The decline reason (bluwy: swipe conflicts with mobile back-gestures and is hard to trigger) still holds for the gesture, but the *second* half was never addressed and a ground-up drawer rework invalidates it: `useSidebarControl`'s `open`/`close`/`toggle` live in a module-level ref that is not exported from the theme entry, so both commenters resort to `document.querySelector('.VPBackdrop.backdrop').click()`. The rework should expose the drawer's open/close control publicly, which closes the actionable part regardless of the swipe verdict.

## New candidates for future rework

- **[#2257](https://github.com/vuejs/vitepress/issues/2257) — Highlight active sidebar item when child page is loaded** (kind: issue-open; demand: 👍9, 7c)
  - A page not listed in the sidebar leaves no item highlighted and no section expanded; five separate commenters converge on wanting `activeMatch` for sidebar items, as nav items already have.
  - Highest-demand active-link issue in the area. The rework's active-link logic should accept a per-item `activeMatch` (and/or prefix-match a parent when no exact link matches). `useSidebarItemControl` currently calls `isActive(relativePath, hash, item.link)` exact-only, so this is a targeted change at the point the rework already has open. Related closed-as-duplicate: [#1565](https://github.com/vuejs/vitepress/issues/1565).
- **[#4345](https://github.com/vuejs/vitepress/issues/4345) — Auto-anchor the sidebar to the opened page** (kind: issue-open; demand: 👍3, 1c)
  - Opening a deep link leaves the sidebar scrolled to the top, hiding the active item.
  - Core of the "auto-scroll to the active item" requirement. Incorporate as first-class scroll management in the reworked sidebar: scroll the active item into view on mount and on route change, with `scroll-behavior` respecting reduced motion. The commenter's workaround (`querySelector('#VPSidebarNav div.is-link.is-active.has-active').scrollIntoView`) shows the state is already rendered — only the scroll is missing.
- **[#4296](https://github.com/vuejs/vitepress/issues/4296) — Opening or navigating to sidebar links should focus/scroll to the sidebar item** (kind: issue-open; demand: 👍2, 3c)
  - Same ask framed as VS Code's `explorer.autoReveal`, with two reproductions on vitepress.dev itself.
  - Same rework item as [#4345](https://github.com/vuejs/vitepress/issues/4345); adds the requirement that it fire on in-site navigation (clicking a nav link that changes the sidebar), not just first load.
- **[#3426](https://github.com/vuejs/vitepress/issues/3426) — Automatically scroll to active page on sidebar** (kind: issue-open; demand: 👍0, 0c)
  - Duplicate framing of the same auto-scroll ask; author offers to contribute.
  - Fold into the same rework item. Also closed-as-duplicate [#4579](https://github.com/vuejs/vitepress/issues/4579) carries 👍2 for this behavior, so real demand is higher than any single record shows.
- **[#2881](https://github.com/vuejs/vitepress/issues/2881) — an option to auto-collapse sidebar group + scroll sidebar item into view** (kind: issue-open; demand: 👍1, 0c)
  - Pairs the auto-scroll ask with auto-collapsing other groups.
  - The rework should treat scroll-into-view and group auto-collapse as one behavior, since collapsing changes the scroll target's position — doing them independently produces a wrong final scroll offset.
- **[#3654](https://github.com/vuejs/vitepress/issues/3654) — feat: scroll active sidebar link into view on page load** (kind: pr-open; demand: 👍6, 0c)
  - Minimal +7/−1 implementation in `VPSidebar.vue`; highest-👍 open sidebar PR.
  - The author themselves flags the two gaps a rework must close: it uses `querySelector` rather than a template ref, and it does not re-run on in-page hash navigation.
- **[#3901](https://github.com/vuejs/vitepress/issues/3901) — feat: Improve Sidebar and Aside Link Visibility on Mount and Route Change** (kind: pr-open; demand: 👍0, 0c)
  - Broader take (+44/−7) covering both sidebar and aside, on mount and on route change.
  - Opened only because the author could not push to [#3654](https://github.com/vuejs/vitepress/issues/3654). Use it as the reference for the route-change half; it also targets [#3351](https://github.com/vuejs/vitepress/issues/3351) (aside marker scrolling out of view), which the rework can cover with the same mechanism.
- **[#5194](https://github.com/vuejs/vitepress/issues/5194) — feat: Auto-anchor the sidebar to the active item** (kind: pr-open; demand: 👍0, 1c)
  - The most complete attempt (+69/−2): centers the active link, re-centers on resize, and suppresses auto-positioning once the user scrolls the sidebar manually until the route, sidebar content, or drawer state changes. Links [#3426](https://github.com/vuejs/vitepress/issues/3426), [#4296](https://github.com/vuejs/vitepress/issues/4296), [#4345](https://github.com/vuejs/vitepress/issues/4345), [#4579](https://github.com/vuejs/vitepress/issues/4579).
  - This is the behavioral spec the rework should adopt wholesale — the manual-scroll-wins rule is the part naive implementations get wrong, and it doubles as the "preserved scroll position" requirement.
- **[#4211](https://github.com/vuejs/vitepress/issues/4211) — [Feature Proposal] Expand only active sidebar group** (kind: issue-open; demand: 👍0, 0c)
  - Opt-in accordion mode: navigating opens the active group and closes the others, while an explicit toggle click affects only that group. Author has a working `enhanceApp` implementation and offers to PR.
  - The rework should hoist collapse state out of per-item local `ref`s into shared state so one group can close another; `useSidebarItemControl` currently owns `collapsed` privately per item, which makes an accordion mode impossible without exactly the rework being planned.
- **[#3441](https://github.com/vuejs/vitepress/issues/3441) — How to make multiple sidebars expand only one at a time** (kind: issue-open; demand: 👍0, 1c)
  - Same accordion-exclusivity request, bumped by another user as "a very reasonable feature, should not be staled".
  - Same shared-collapse-state requirement as [#4211](https://github.com/vuejs/vitepress/issues/4211); count them as one feature with two requesters.
- **[#4683](https://github.com/vuejs/vitepress/issues/4683) — 侧边栏最大层级是多少 (max sidebar depth)** (kind: issue-not-planned; demand: 👍0, 3c)
  - Sidebar silently stops rendering past 5 levels; the reporter has a 9-level tree, and the maintainer's answer was "re-organize your content" plus a `patch-package` diff.
  - The decline reason is a horizontal-space argument, but the cap is not a space decision — it is `v-if="depth < 5"` in `VPSidebarItem.vue` plus `textTag` computing `h${depth + 2}`, i.e. the depth limit exists because heading levels run out at `h6`. A rework that decouples the visual nesting from the heading hierarchy (a flat `nav` + `aria-level`, or `<details>` per [#3806](https://github.com/vuejs/vitepress/issues/3806)) removes the cap as a side effect, which invalidates the "just re-organize" answer. The fact that a patch diff was handed out is evidence the limit is arbitrary.
- **[#563](https://github.com/vuejs/vitepress/issues/563) — Deep nested side bar title isn't indented.** (kind: issue-not-planned; demand: 👍0, 3c)
  - Indentation breaks past 4 levels of nesting.
  - Gold: declined by kiaking with "sidebar has no more nested structure in `theme-next`" — a reason that is now completely invalid, since multi-level nesting shipped in [#851](https://github.com/vuejs/vitepress/issues/851)/[#1835](https://github.com/vuejs/vitepress/issues/1835) and the same in-thread exchange confirms it. The indent rules are still per-level hardcoded selectors (`.level-2 … .level-5`), so the rework should derive indentation from depth rather than enumerating levels, which fixes [#563](https://github.com/vuejs/vitepress/issues/563) and [#4683](https://github.com/vuejs/vitepress/issues/4683) together.
- **[#4841](https://github.com/vuejs/vitepress/issues/4841) — getSidebar's matching logic is buggy** (kind: issue-open; demand: 👍0, 3c)
  - Multi-sidebar keys are prefix-matched without normalizing a trailing slash, so `/api-examples.md` matches the `/a` sidebar and `/api-b/a.md` matches `/api/`.
  - Multi-sidebar matching is in scope for the rework. The reporter's argument is the strong one and unrebutted: the public type is `SidebarMulti { [path: string]: … }` documented as a directory, so the rework should normalize keys to directory boundaries rather than requiring users to remember a trailing slash. The maintainer's only reply was the workaround, not a design defense.
- **[#4842](https://github.com/vuejs/vitepress/issues/4842) — fix(theme): fix getSidebar's buggy logic when supporting subtree-lifting** (kind: pr-open; demand: 👍0, 1c)
  - Eight-line fix for [#4841](https://github.com/vuejs/vitepress/issues/4841) with a reproduction repo.
  - Adopt into the rework's data layer; verify it against the docs site's own config, since the change tightens matching and could shift which sidebar a page resolves to.
- **[#3621](https://github.com/vuejs/vitepress/issues/3621) — fix(VPSidebarItem): use depth and index as the key** (kind: pr-unmerged; demand: 👍0, 2c)
  - Attempt to fix collapsed groups not expanding on navigation by keying items on depth+index; two reviewers reported it did not work.
  - Worth absorbing as a structural requirement even though the patch failed. Today `VPSidebarItem` keys children on `:key="i.text"` (duplicate texts collide) while `VPSidebar.vue` separately bumps a `key` on any deep change to `sidebarGroups`, remounting the entire tree. That blunt remount is what will destroy preserved scroll position and collapse state once the rework adds them, so the rework needs stable per-item identity instead of a whole-tree key bump.
- **[#1037](https://github.com/vuejs/vitepress/issues/1037) — Allow footer compatible with sidebar** (kind: issue-open (reopened); demand: 👍7, 5c)
  - Footer and sidebar cannot be shown together; users need copyright/legal text on doc pages and are patching it in with `display: block !important`.
  - Sidebar/layout coupling. The maintainer already conceded the shape ("make it optional to enable footer using frontmatter or some theme config"), so the rework only needs to add the opt-in and make the footer respect the sidebar column offset.
- **[#4532](https://github.com/vuejs/vitepress/issues/4532) — feat(theme): allow footer and sidebar to be displayed at the same time** (kind: pr-open; demand: 👍6, 2c)
  - Implements exactly the maintainer's requested shape: `footer.showWithSidebar` plus a per-page `footer` frontmatter override.
  - Ready to absorb; the only outstanding review note is that the footer's horizontal divider should span the full browser width — the same full-bleed surface problem [#5397](https://github.com/vuejs/vitepress/issues/5397) already solved for the navbar, so the rework can apply the identical technique.
- **[#3071](https://github.com/vuejs/vitepress/issues/3071) — Notion-style "Lock sidebar open" / "Close sidebar"** (kind: issue-open; demand: 👍0, 4c)
  - After clarification, the ask is a user-initiated sidebar collapse on *large* viewports, not the existing small-viewport drawer.
  - Sidebar sizing. A rework that already owns `--vp-sidebar-width` and its coupling to nav and content can add a collapsed desktop state as a variable flip plus a persisted preference, rather than the bolt-on it would be today.
- **[#5105](https://github.com/vuejs/vitepress/issues/5105) — feat(theme): add sidebar collapse functionality** (kind: pr-open; demand: 👍1, 2c)
  - Desktop collapse across 9 files (+330/−37), touching `VPNavBar`, `VPNavBarTitle`, `VPNavBarSearch`, `VPContent`, `VPLocalNav`, `VPSidebar` and `sidebar.ts`. Links [#4669](https://github.com/vuejs/vitepress/issues/4669) and [#3071](https://github.com/vuejs/vitepress/issues/3071).
  - Direct evidence for doing this inside the rework rather than after it: two-thirds of the diff is navbar files that [#5397](https://github.com/vuejs/vitepress/issues/5397) has just rewritten, so this PR cannot rebase cleanly. The feature is one variable's worth of work once the sidebar owns its width; as a standalone PR it is a cross-component patch.
- **[#4739](https://github.com/vuejs/vitepress/issues/4739) — feat(default-theme): collapsible sidebar** (kind: pr-unmerged; demand: 👍0, 2c)
  - The earlier attempt at the same feature (+141/−24); the author closed it and returned with a revised UI, which became [#5105](https://github.com/vuejs/vitepress/issues/5105).
  - Same rework item; its history shows the blocker was UI design, not feasibility, so the rework should settle the collapsed-state visual up front.
- **[#1054](https://github.com/vuejs/vitepress/issues/1054) — Reduce layout shifts with classic scrollbars** (kind: issue-open; demand: 👍0, 8c)
  - Pages with and without a vertical scrollbar render the content column at different widths, so navigating shifts the whole layout on classic-scrollbar platforms.
  - Sidebar-width coupling to layout. [#5397](https://github.com/vuejs/vitepress/issues/5397) investigated `scrollbar-gutter: stable` and declined it for [#5310](https://github.com/vuejs/vitepress/issues/5310) (gutter painting), which leaves this sibling symptom unaddressed — the rework should decide the width-coupling story for `VPSidebar`, `VPContent`, `VPLocalNav` and `VPFooter` in one place, as [#5397](https://github.com/vuejs/vitepress/issues/5397) did for the bar.
- **[#1844](https://github.com/vuejs/vitepress/issues/1844) — fix(theme): avoid layout shift caused by scrollbar** (kind: pr-open; demand: 👍5, 2c)
  - Fixes [#1054](https://github.com/vuejs/vitepress/issues/1054) by pinning `VPContent`/`VPFooter` to `100vw` above 768px; the author re-verified it on the current release and asked whether v2 is the moment to land it.
  - Absorb the intent, not the patch: `100vw` is the same full-bleed hazard [#5397](https://github.com/vuejs/vitepress/issues/5397) removed when it deleted the `-100vw` navbar background bleed. The rework should reach the same result through the shared width variables. Note this is a resubmission of [#1568](https://github.com/vuejs/vitepress/issues/1568), and [#5198](https://github.com/vuejs/vitepress/issues/5198) is a third independent attempt at the same bug — three PRs for one issue is a signal it needs a structural answer.
- **[#4048](https://github.com/vuejs/vitepress/issues/4048) — Add #sidebar-nav-active-link-after slot + expose VPDocAside** (kind: issue-open; demand: 👍0, 3c)
  - Wants the page outline nested under the active sidebar item to save horizontal space; the author already achieves a rougher version via `#sidebar-nav-after` and CSS.
  - The thread establishes that `aside: 'left'` is not a substitute (it consumes a separate column). The rework's slot surface should include a per-item insertion point, which is cheap while the item component is being rewritten and impossible to retrofit cleanly afterwards.
- **[#4114](https://github.com/vuejs/vitepress/issues/4114) — Sidebar's base need extends parent's base** (kind: issue-open; demand: 👍0, 3c)
  - Nested sidebar items should inherit and extend their parent's `base` rather than replacing it.
  - Real objection on the thread: inheritance leaves no way to *escape* a parent base, and the docs site itself relies on one group member having a different base. A rework can satisfy both with an explicit opt-out (an absolute link, or a `base: null`), which the current replace-only semantics cannot express. Related: closed-as-duplicate [#4821](https://github.com/vuejs/vitepress/issues/4821).

## Not viable

- **[#1297](https://github.com/vuejs/vitepress/issues/1297) — auto sidebar mode** (kind: issue-open; demand: 👍17, 19c) — Build-time config generation, not a component or CSS concern; a `VPSidebar` rework cannot close it. (Highest-demand sidebar issue; four community plugins named in-thread.)
- **[#1737](https://github.com/vuejs/vitepress/issues/1737) — Auto-sidebar mode** (kind: issue-not-planned; demand: 👍5, 6c) — Declined as duplicate of [#1297](https://github.com/vuejs/vitepress/issues/1297); decline still correct.
- **[#482](https://github.com/vuejs/vitepress/issues/482) — Support setting sidebar depth in themeConfig** (kind: issue-not-planned; demand: 👍5, 2c) — Outline moved out of the sidebar in theme-next; successor setting `themeConfig.outline.level` exists — satisfied, not blocked.
- **[#1493](https://github.com/vuejs/vitepress/issues/1493) — Ability to collapse subcategories in the sidebar** (kind: issue-not-planned; demand: 👍0, 1c) — Duplicate of [#1360](https://github.com/vuejs/vitepress/issues/1360), shipped in [#1835](https://github.com/vuejs/vitepress/issues/1835); nested collapse works today.
- **[#1718](https://github.com/vuejs/vitepress/issues/1718) — expand a collapsible section when navigating to a children page** (kind: issue-not-planned; demand: 👍0, 1c) — Already the default behavior; the named bug was fixed.
- **[#1887](https://github.com/vuejs/vitepress/issues/1887) — [Sidebar] collapsed: true didn't work** (kind: issue-not-planned; demand: 👍0, 2c) — User error, confirmed resolved by reporter.
- **[#4953](https://github.com/vuejs/vitepress/issues/4953) — Show "On this page" sidebar more often in <1280px width** (kind: issue-not-planned; demand: 👍0, 2c) — Declined on measured merit (~80px recoverable); a rework doesn't change the arithmetic. (Note: the local-nav sweep instead treats this as an obligation to make the dropdown an adequate substitute.)
- **[#4266](https://github.com/vuejs/vitepress/issues/4266) — Update VPSidebar.vue** (kind: pr-unmerged; demand: 👍0, 1c) — padding-bottom is an intentional UX choice, overridable in CSS.
- **[#4847](https://github.com/vuejs/vitepress/issues/4847) — Accordions now use native details/summary** (kind: pr-open; demand: 👍0, 5c) — Duplicate of [#3806](https://github.com/vuejs/vitepress/issues/3806) and unusable as-is (+9626/−61 lockfile noise).
- **[#3069](https://github.com/vuejs/vitepress/issues/3069) — feat(client): Add folding function to the navigation bar** (kind: pr-open; demand: 👍2, 0c) — Navbar scope; reintroduces the nested `role="button"` pattern that [#5397](https://github.com/vuejs/vitepress/issues/5397) and `ed2bfb26` removed.
- **[#4630](https://github.com/vuejs/vitepress/issues/4630) — feat(customization): sidenav components / skip title update** (kind: pr-open; demand: 👍0, 5c) — Extension-API scope; maintainer objection stands; needs full Vue compiler at runtime.
- **[#4637](https://github.com/vuejs/vitepress/issues/4637) — Sidenav Components / Skip title update** (kind: issue-open; demand: 👍0, 0c) — Markdown/compile-pipeline concern; sidebar `text` is `v-html`'d by design.
- **[#5198](https://github.com/vuejs/vitepress/issues/5198) — fix(theme-default): stabilize horizontal layout across pages with/without vertical scrollbar** (kind: pr-open; demand: 👍0, 0c) — Third attempt at [#1054](https://github.com/vuejs/vitepress/issues/1054); track under [#1054](https://github.com/vuejs/vitepress/issues/1054).
