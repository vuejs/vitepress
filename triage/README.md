# Theme chrome audit — after the navbar redesign

Snapshot 2026-08-24 · baselined on [#5397](https://github.com/vuejs/vitepress/pull/5397) (`navbar-redesign`) · `main` @ v2.0.0-alpha.19

> Generated with Claude Code: five parallel sweeps (navbar core · local nav + outline · sidebar · theming/CSS/layout · a11y + i18n) over **open issues**, **issues closed as not planned**, **open PRs**, and **closed-unmerged PRs** touching what #5397 ships or its follow-ups plan to touch — plus a line-by-line review of [#1273](https://github.com/vuejs/vitepress/pull/1273). ≈120 unique records assessed, 60+ deep-dived. Every "solved" and "still broken" claim was verified against the `navbar-redesign` checkout, not taken from the threads. Spot-check before acting on close recommendations.

## Files

- [follow-ups.md](./follow-ups.md) — **the plan of record**, moved from the [#5397](https://github.com/vuejs/vitepress/pull/5397) description

The per-area pages carry the full write-ups (what each record asks, why it was declined, what verdict it gets and why):

- [navbar.md](./navbar.md) — the bar, mobile screen, dropdowns, overflow
- [local-nav.md](./local-nav.md) — VPLocalNav, outline dropdown, return-to-top
- [sidebar.md](./sidebar.md) — drawer, groups, scroll, data layer
- [theming-css.md](./theming-css.md) — variables, layout shift, modern CSS
- [a11y-i18n.md](./a11y-i18n.md) — focus, ARIA, labels, direction
- [pr-1273.md](./pr-1273.md) — what [#1273](https://github.com/vuejs/vitepress/pull/1273) contained vs what was adopted

## Fix now — live defects verified on the branch

Small, self-contained, and each lands on code [#5397](https://github.com/vuejs/vitepress/pull/5397) already touches.

| # | Defect | Where | Records |
| --- | --- | --- | --- |
| 1 | Custom `{ svg }` social links get a literal `aria-label=""`, which wins the name computation over any SVG `<title>` — the exact fix both declines prescribed provably cannot work. One fallback removal repairs bar, drawer and `⋯` menu at once. | `VPSocialLink.vue` | reopens [#2081](https://github.com/vuejs/vitepress/issues/2081), [#1325](https://github.com/vuejs/vitepress/pull/1325), [#3014](https://github.com/vuejs/vitepress/pull/3014) |
| 2 | `outline: none` on `button, input, textarea, select` is only restored for `button:focus-visible` — text inputs have no focus indicator at all. WCAG 2.4.7 (AA), meeting the "where WCAG is clearly defined" carve-out. | `styles/base.css` | answers the carve-out in [#2085](https://github.com/vuejs/vitepress/issues/2085) |
| 3 | With `siteTitle: false`, the title link has no accessible name — `VPImage` defaults string logos to `alt=""`. Derive alt from the site title. | `VPNavBarTitle.vue` | [#5056](https://github.com/vuejs/vitepress/issues/5056) delta |
| 4 | The skip link targets `#VPContent`, which has no `tabindex="-1"`, and the aside precedes `<main>` in DOM order — sequential focus resumes at the outline. | `VPSkipLink.vue`, `VPDoc.vue` | adopts [#4940](https://github.com/vuejs/vitepress/pull/4940) |
| 5 | `VPFlyout`'s `.text` still carries `line-height: var(--vp-nav-height)` — the wrapped-label height bomb removed from menu links, left armed in the sibling component. Flex already centers it. | `VPFlyout.vue` | from [#1273](https://github.com/vuejs/vitepress/pull/1273) |
| 6 | No icon flex child in the bar has a shrink guard; fvsch measured the chevron compressed to 9px. The overflow engine prevents steady-state squeeze, not the transient before the ResizeObserver callback. | `VPFlyout.vue` et al. | from [#1273](https://github.com/vuejs/vitepress/pull/1273) |

## The local nav + sidebar rework — requirements register

The follow-up [#5397](https://github.com/vuejs/vitepress/pull/5397)'s body already names, now with concrete obligations. Largest bucket: 40+ records converge here. Full detail in [local-nav.md](./local-nav.md) and [sidebar.md](./sidebar.md).

### Geometry and presence

- **[#4359](https://github.com/vuejs/vitepress/issues/4359) / [#4393](https://github.com/vuejs/vitepress/pull/4393)** — the outline dropdown hard-codes `left: calc(var(--vp-sidebar-width) + 2rem)` unconditionally; the local nav does the same with `padding-left`. Give the local nav the presence-derived column offset the navbar just got (`--vp-nav-col-offset` → `0px` without a sidebar). Absorb the outcome of #4393 (LGTM'd, 16 comments, stalled) — not its per-component override — and credit its author.
- **[#3811](https://github.com/vuejs/vitepress/issues/3811)** — the nav-height probe is wrong twice: it appends to `document.body` where the `.hide-nav` override can't reach it (so `navbar: false` always resolves 4rem), and `vp-doc.css` bakes the local nav's height as a magic `2.9375rem` into every heading's `scroll-margin-top` ([#2334](https://github.com/vuejs/vitepress/issues/2334)). Replace both with a declared `--vp-local-nav-height` token; gate rendering on layout type, not raw scroll.
- **[#2071](https://github.com/vuejs/vitepress/issues/2071)** — `--vp-layout-top-height` threads through ten files and must be set by user-injected head JS (CLS + dismissal flash, visible on oxc.rs). Resolve the offset in SSR output. Also: `--vp-z-index-layout-top: 40` paints above the nav's 30.
- **[#1764](https://github.com/vuejs/vitepress/issues/1764)** — "only the secondary nav is sticky" leaves mobile home with nothing sticky at all. The obstacles the decline anticipated (curtain, `-100vw` bleed) are gone; state which element owns stickiness per layout.

### The outline dropdown, made first-class

- **[#5090](https://github.com/vuejs/vitepress/issues/5090) / [#5091](https://github.com/vuejs/vitepress/pull/5091)** — `useActiveAnchor` is single-consumer, which is why #5091 forked a parallel composable. Generalize it to two consumers; the fork and the dropdown's `data-allow-mismatch="style"` band-aid both disappear. The same generalization enables [#2146](https://github.com/vuejs/vitepress/issues/2146) (auto-expand the active outline branch, 👍8) in both surfaces.
- **[#3392](https://github.com/vuejs/vitepress/pull/3392)** — the near-full-height dropdown panel has Escape and scroll lock but no focus containment, no focus restore, no inert page behind it. Give it the flyouts' disclosure contract, and export the inert state for custom themes (the PR's explicit ask).
- **[#4953](https://github.com/vuejs/vitepress/issues/4953)** — the decline's load-bearing claim was that the dropdown suffices below 1280px. That makes the three items above obligations, not enhancements.
- **[#4521](https://github.com/vuejs/vitepress/issues/4521) / [#4522](https://github.com/vuejs/vitepress/pull/4522)** — return-to-top exists only as the dropdown's empty state. Hoist it into a shared control used by the dropdown and the aside footer, sharing `scrollToTop` and `returnToTopLabel`.
- **[#2297](https://github.com/vuejs/vitepress/pull/2297)** — `hasAside` (config-only) and `hasLocalNav` (headers-only) can disagree about whether a page has an outline. One derived predicate should feed the aside, the local nav, and the band handoff.

### Drawer, focus, and curtain

- **[#3392](https://github.com/vuejs/vitepress/pull/3392) + [#2329](https://github.com/vuejs/vitepress/pull/2329)** — the closed sidebar only gets `opacity: 0; transform: translateX(-100%)`, so every link stays tabbable; the open drawer never marks the page behind it inert; and the open-focus call is a no-op (`ref="navEl"` on the `<aside>`, `tabindex="-1"` on the inner `<nav>`). Caution from #2329: [#1332](https://github.com/vuejs/vitepress/issues/1332) is marked completed but reported regressed — re-verify.
- **[#4330](https://github.com/vuejs/vitepress/issues/4330)** — the swipe decline stands, but the unanswered half doesn't: `useSidebarControl`'s open/close isn't exported, so custom layouts click `.VPBackdrop` programmatically. Expose it.
- **[#3393](https://github.com/vuejs/vitepress/issues/3393) delta** — curtain restoration needs an opt-in flag (pure CSS cannot reproduce it — giladgd is version-pinned over this) and must be pointer-events-transparent (elringus: the old one intercepted clicks over visibly-unobscured links).

### Groups and structure

- **[#3806](https://github.com/vuejs/vitepress/pull/3806) vs [#4847](https://github.com/vuejs/vitepress/pull/4847)** — two competing native-`<details>` PRs, both CONFLICTING after `ed2bfb26`; pick a lineage before the `::details-content` work. Constraints from the threads: a linked group heading must still navigate (`<summary>` can't swallow the link), auto-uncollapse on navigating into a collapsed group must drive native `open`, the summary-link nesting must not recreate [#3517](https://github.com/vuejs/vitepress/issues/3517), and Space-key toggling belongs in the e2e disclosure tests ([#3804](https://github.com/vuejs/vitepress/issues/3804)).
- **[#4211](https://github.com/vuejs/vitepress/issues/4211) + [#3441](https://github.com/vuejs/vitepress/issues/3441)** — collapse state is private per item, so one group can never close another. Hoisting it to shared state is the prerequisite for the requested opt-in accordion mode.
- **[#4683](https://github.com/vuejs/vitepress/issues/4683) + [#563](https://github.com/vuejs/vitepress/issues/563)** — the 5-level depth cap exists only because `textTag` computes `h{depth+2}` and heading levels run out at `h6`; #563's decline ("no more nested structure in theme-next") was invalidated the moment nesting shipped. Decouple nesting from headings, derive indentation from depth — both records fall together.
- **[#3621](https://github.com/vuejs/vitepress/pull/3621)** — items key on `i.text` (collides) while `VPSidebar` remounts the whole tree on any deep change. That remount will destroy preserved scroll and collapse state the moment the rework adds them; stable per-item identity is a structural requirement.

### Active item and scroll

- **[#5194](https://github.com/vuejs/vitepress/pull/5194)** — adopt this PR's behavioral spec wholesale: reveal on mount, route change and resize, suppressed once the user scrolls the sidebar manually (the part naive versions get wrong). Absorbs [#4345](https://github.com/vuejs/vitepress/issues/4345), [#4296](https://github.com/vuejs/vitepress/issues/4296), [#3426](https://github.com/vuejs/vitepress/issues/3426), [#2881](https://github.com/vuejs/vitepress/issues/2881) and PRs [#3654](https://github.com/vuejs/vitepress/pull/3654) (👍6), [#3901](https://github.com/vuejs/vitepress/pull/3901). Constraints: scroll-only (never focus-moving — it would fight the route-change focus reset in `VPSkipLink`), and composed with group auto-collapse in one pass, since collapsing moves the scroll target.
- **[#2257](https://github.com/vuejs/vitepress/issues/2257)** — `activeMatch` for sidebar items (👍9, highest-demand actionable sidebar issue). Constraint from [#5395](https://github.com/vuejs/vitepress/pull/5395): ancestor marking rides `has-active` and must not widen `aria-current` beyond the exact match.

### Data layer

- **[#4841](https://github.com/vuejs/vitepress/issues/4841) / [#4842](https://github.com/vuejs/vitepress/pull/4842)** — multi-sidebar keys prefix-match without trailing-slash normalization (`/api-examples.md` matches the `/a` sidebar). The public type documents keys as directories; make matching agree. Verify against the docs site's own config.
- **[#4114](https://github.com/vuejs/vitepress/issues/4114)** — nested `base` should extend the parent's, with an explicit escape hatch (absolute link or `base: null`) that answers the thread's real objection.

### Features that should ride the rework, not follow it

- **[#5105](https://github.com/vuejs/vitepress/pull/5105)** (desktop sidebar collapse; issue [#3071](https://github.com/vuejs/vitepress/issues/3071), prior attempt [#4739](https://github.com/vuejs/vitepress/pull/4739)) — two-thirds of its diff is navbar files #5397 rewrote; it cannot rebase. Once the sidebar owns its width as state, this is a variable flip plus a persisted preference. Settle the collapsed-state visual up front — that was the actual blocker.
- **[#1037](https://github.com/vuejs/vitepress/issues/1037) / [#4532](https://github.com/vuejs/vitepress/pull/4532)** (footer with sidebar, 👍7 + 👍6) — the PR implements the maintainer-conceded shape; the one open review note (full-width divider) is the same full-bleed problem the navbar surface just solved.
- **[#3534](https://github.com/vuejs/vitepress/issues/3534)** (breadcrumbs, 👍7 · 11c) — derive the ancestor path from the resolved sidebar structure with frontmatter as override; that answers the data-model objection for sidebar-bearing pages (leaf-only caveat stands elsewhere). As a second `<nav>` landmark it inherits #5397's conventions: locale-aware label, `aria-current` on the leaf only.
- **[#4048](https://github.com/vuejs/vitepress/issues/4048)** — a per-item slot insertion point is cheap while the item component is being rewritten, impossible to retrofit cleanly after.
- **[#3194](https://github.com/vuejs/vitepress/issues/3194)** — the aside is the last chrome using viewport-relative geometry where container-relative is correct; the natural home for container queries (the inverse of the bar, for which they were rightly rejected).

### SSR determinism — mechanism on record

- **[#4897](https://github.com/vuejs/vitepress/issues/4897) delta** — decide the local nav's presence from build output: stamp a class on `<html>` when the SSR'd HTML has header anchors and outline isn't disabled. Hard constraint (sapphi-red): header-less pages like `/guide/mpa-mode` must end with no local nav — he could not remove it on hydration. MPA mode is accepted collateral.

## Navbar follow-up additions

Full detail in [navbar.md](./navbar.md).

### Contracts the #4000 follow-up must widen

- **[#2866](https://github.com/vuejs/vitepress/pull/2866) + [#2831](https://github.com/vuejs/vitepress/issues/2831)** — slot content is invisible to the overflow engine in **both axes**: width (re-introduces the crowding [#2842](https://github.com/vuejs/vitepress/issues/2842) fixed) and height (the fixed-height bar lets over-tall slot content paint over the page — the [#1273](https://github.com/vuejs/vitepress/pull/1273) delta). The [#4000](https://github.com/vuejs/vitepress/issues/4000) contract should cover slot content and decide once: measure-and-collapse, grow, or document fixed-height as a constraint.
- **[#3069](https://github.com/vuejs/vitepress/pull/3069)** — nested groups render but aren't disclosures: `VPMenuGroup` still emits a static `<p class="title">`. The nested-dropdowns follow-up ([#3816](https://github.com/vuejs/vitepress/issues/3816)) needs per-group `collapsed?: boolean` with the disclosure treatment the screen variant already has. Absorb the feature, not the patch — it reintroduces nested `role="button"`.
- **[#3407](https://github.com/vuejs/vitepress/issues/3407)** — separator nav items need zero collapse priority in `computeNavFit`, or one stranded at the visible/collapsed boundary renders as a dangling rule.

### One-point-of-change wins created by the unification

- **[#4364](https://github.com/vuejs/vitepress/issues/4364)** — nav links ignore `rewrites`; every nav href now flows through `useNavItemLink`, so normalization has exactly one insertion point.
- **[#4347](https://github.com/vuejs/vitepress/issues/4347)** — the locale switcher links to 404s; all three renderings share one `useLangs` call, so an existence check with ancestor fallback fixes every surface. Cross-link [#3312](https://github.com/vuejs/vitepress/pull/3312)/[#3275](https://github.com/vuejs/vitepress/issues/3275) (content-side of the same gap).
- **[#3383](https://github.com/vuejs/vitepress/pull/3383)** — kiaking's counter-proposal (transparent by default on `layout: page` with no sidebar and no local nav) is now one extra condition on the single state rule; the variable route he prescribed also genuinely works now.
- **[#2085](https://github.com/vuejs/vitepress/issues/2085)** — three hover treatments coexist (flyouts → brand, social links → text-1, title → none). Now that all are siblings in one component set, a shared nav-interactive token is a contained change.

### New surface areas worth planning

- **[#3086](https://github.com/vuejs/vitepress/issues/3086) + [#2913](https://github.com/vuejs/vitepress/pull/2913) + [#3123](https://github.com/vuejs/vitepress/pull/3123)** — the theme has zero `@media print` rules. With one surface and one geometry, a print block is small and self-contained; the per-mode sprawl that stalled #2913's review is gone.
- **[#522](https://github.com/vuejs/vitepress/issues/522)** — per-page navbar hiding: kiaking's last word was "I think we can add this feature… open a new issue" — nobody did. `--vp-nav-height` is now the single geometry input, so zeroing it per-page is one rule (and the `.hide-nav` override must live where all consumers can see it).
- **[#4141](https://github.com/vuejs/vitepress/issues/4141)** — inline SVG logo: the one bar element CSS can't theme. Supersedes not-planned [#1742](https://github.com/vuejs/vitepress/issues/1742).
- **[#2706](https://github.com/vuejs/vitepress/issues/2706)** — a slot *below* the bar for full-bleed banners; composes with the surface and `--vp-nav-height` consumers, natural home in `VPNav.vue`.
- **[#3773](https://github.com/vuejs/vitepress/issues/3773)** — declined because [768, 1280) had no nav screen and no overflow container; the `⋯` menu removed half that premise. Define the slot contract for the band instead of rendering nothing silently.

## Theming & CSS program

Full detail in [theming-css.md](./theming-css.md).

- **[#4125](https://github.com/vuejs/vitepress/pull/4125)** — extend `@layer` from `base.css` (already layered via [#4425](https://github.com/vuejs/vitepress/issues/4425)) to the chrome component styles; the decline's browser floor no longer exists. Kept class aliases mean precedence changes without selector changes. Pairs with [#3021](https://github.com/vuejs/vitepress/issues/3021) — any renaming must be additive alongside the aliases.
- **[#1147](https://github.com/vuejs/vitepress/issues/1147)** — make `--vp-layout-max-width` and `--vp-sidebar-width` load-bearing in `VPDoc`/`VPSidebar`/`VPContent`; the named cause (hardcoded `max-width: 688px`-style numbers) is the same duplication class #5397 deleted inside the navbar.
- **[#3433](https://github.com/vuejs/vitepress/issues/3433)** — `color-mix()` with `light-dark()` in one pass (brc-dd's own #4425 roadmap pairs them; the decline's browser floor is dead). Constraint from [#4471](https://github.com/vuejs/vitepress/issues/4471): `light-dark()` hard-codes the two-scheme model — keep a plain-token override seam. Fold in [#3313](https://github.com/vuejs/vitepress/issues/3313): replace `opacity`-dimmed text with mixed tokens (fixes Persian/Arabic glyph-overlap artifacts, removes stray stacking contexts).
- **[#2056](https://github.com/vuejs/vitepress/pull/2056) delta** — the logical-properties decline was benefit-based, not correctness-based; the RTL work now supplies the benefit argument, and the attempt's one concrete regression (the outline marker stopped tracking — JS reads physical offsets) is the required regression test. Completing it unlocks [#2794](https://github.com/vuejs/vitepress/issues/2794): the unconditional `dir` writer in `app/index.ts` can become an opt-out or write-on-change guard, enabling runtime direction toggles.
- **[#5209](https://github.com/vuejs/vitepress/issues/5209)** — line-height variables: the explicitly invited remainder after the rem migration.

## Three decisions to make once

Each has multiple competing records; deciding once retires the cluster.

1. **Scrollbar layout shift** — [#1054](https://github.com/vuejs/vitepress/issues/1054) (8c) · PRs [#1844](https://github.com/vuejs/vitepress/pull/1844) (👍5), [#5198](https://github.com/vuejs/vitepress/pull/5198) · [#4884](https://github.com/vuejs/vitepress/issues/4884) · delta on [#5310](https://github.com/vuejs/vitepress/issues/5310). Three open PRs, three mechanisms, one bug. Two facts the #5397 body's #5310 reasoning doesn't account for: kiaking explicitly reversed on the modal case ("Modal thing should be fixed"), and `scrollbar-gutter` was tested to fail exactly there (gutter paints above the modal scrim). #5397 shrinks #1844 to roughly one body rule by deleting the `100vw` bleed it compensated for.
2. **Appearance-transition recipe** — [#2347](https://github.com/vuejs/vitepress/pull/2347), 58 reactions (🚀33 ❤️19), the strongest signal in the audit. The hooks exist (`appearance.onChanged`, `disableTransition`); the "wonky with default theme" blocker was the six scattered nav background selectors, now one color-only surface. A documented recipe (gated on `prefers-reduced-motion`) satisfies the demand without shipping an opinionated animation.
3. **Route announcer** — [#1357](https://github.com/vuejs/vitepress/pull/1357), declined on a factually wrong premise ("we have this via nprogress" — a visual bar with no accessible output). Nothing announces SPA navigations; the `tabindex="-1"` sentinel #5397 added to `VPSkipLink` is the ready-made mount point for a polite live region.

## PR #1273 — adopted vs left behind

Full comparison in [pr-1273.md](./pr-1273.md).

**Adopted or superseded:** menu-link `min-height` + flex centering (credited in the #5397 body) · menu alignment and search spacing by equivalent means · the 768–960px band it declared out of scope is exactly where the overflow engine activates · the title border, its +1px accounting, and the border-color transition flash vanished with the border itself.

**Not implemented:** the flyout's line-height trick and the icon shrink guards (Fix now, items 5–6) — and the bar-growth mechanism (`min-height` below desktop, argued from WCAG 1.4.4) so over-tall content expands the bar instead of overflowing the page. Nowrap-plus-collapse resolves 1.4.4 for theme-managed content; custom slot content is the uncovered case, folded into the #4000 contract as the height axis.

## Housekeeping — closeable today

| Record | Why |
| --- | --- |
| [#3517](https://github.com/vuejs/vitepress/issues/3517) | Nested sidebar controls — fixed on `main` by `ed2bfb26` (native button toggles); the axe complaint is resolved. |
| [#5251](https://github.com/vuejs/vitepress/pull/5251) | Same fix landed the other way round in `ed2bfb26`; obsolete. |
| [#3351](https://github.com/vuejs/vitepress/issues/3351) | Aside marker visibility — resolved by merged [#5377](https://github.com/vuejs/vitepress/pull/5377), never closed. |
| [#2259](https://github.com/vuejs/vitepress/pull/2259) | Fully satisfied: switch titles shipped in [#3311](https://github.com/vuejs/vitepress/pull/3311), name/state split completed by #5397. |
| [#1332](https://github.com/vuejs/vitepress/issues/1332) | The opposite — marked completed but reported regressed ([#2329](https://github.com/vuejs/vitepress/pull/2329)); re-verify, #5397's inert work likely re-fixes it. |
| on #5397 merge | Keywords close [#2842](https://github.com/vuejs/vitepress/issues/2842), [#5364](https://github.com/vuejs/vitepress/pull/5364), [#5376](https://github.com/vuejs/vitepress/pull/5376); superseded unmerged PRs [#5097](https://github.com/vuejs/vitepress/pull/5097), [#1283](https://github.com/vuejs/vitepress/pull/1283), [#1448](https://github.com/vuejs/vitepress/pull/1448), [#2329](https://github.com/vuejs/vitepress/pull/2329), [#5074](https://github.com/vuejs/vitepress/pull/5074), [#4978](https://github.com/vuejs/vitepress/pull/4978), [#2260](https://github.com/vuejs/vitepress/pull/2260), [#2741](https://github.com/vuejs/vitepress/pull/2741), [#2455](https://github.com/vuejs/vitepress/pull/2455) can close with a pointer. |

## Confirmed not viable

Declines that still hold after the redesign — reasons re-checked, not assumed.

| Record | Standing reason |
| --- | --- |
| [#1297](https://github.com/vuejs/vitepress/issues/1297) (👍17) | Auto-sidebar from the filesystem — highest demand in the audit, but build-time config generation; no component rework can close it. |
| [#2912](https://github.com/vuejs/vitepress/pull/2912) (9c) | No-JS feature hiding — the separate-theme objection is structural; #5397 degrades cleanly (engine is all-visible during SSR) but deepens JS reliance. |
| [#4920](https://github.com/vuejs/vitepress/issues/4920) | CSS Modules — stable targetable class names are a contract #5397 strengthens. Layering ([#4125](https://github.com/vuejs/vitepress/pull/4125)) is the compatible alternative. |
| [#4413](https://github.com/vuejs/vitepress/issues/4413) · [#5221](https://github.com/vuejs/vitepress/issues/5221) · [#1008](https://github.com/vuejs/vitepress/issues/1008) · [#3160](https://github.com/vuejs/vitepress/issues/3160) | Product-design declines (tri-state switch, arrow-key paging, secondary navbars, full-width layout) untouched by the architecture. |
| [#4917](https://github.com/vuejs/vitepress/issues/4917) · [#4938](https://github.com/vuejs/vitepress/issues/4938) · [#2747](https://github.com/vuejs/vitepress/issues/2747) | Premise disputed with measurements · heading semantics correct with documented opt-out · working as designed. |
| Outline PR cluster | [#4735](https://github.com/vuejs/vitepress/pull/4735), [#3387](https://github.com/vuejs/vitepress/pull/3387), [#4634](https://github.com/vuejs/vitepress/pull/4634), [#4457](https://github.com/vuejs/vitepress/pull/4457), [#2189](https://github.com/vuejs/vitepress/pull/2189), [#2676](https://github.com/vuejs/vitepress/pull/2676) — all superseded by merged [#5377](https://github.com/vuejs/vitepress/pull/5377) or the rewritten `outline.ts`. |

## Demand signals

| Record | Signal | Where it lands |
| --- | ---: | --- |
| [#2347](https://github.com/vuejs/vitepress/pull/2347) | 58 reactions · 11c | Appearance-transition recipe (decision) |
| [#1297](https://github.com/vuejs/vitepress/issues/1297) | 👍17 · 19c | Not viable (build-time; plugins) |
| [#2257](https://github.com/vuejs/vitepress/issues/2257) | 👍9 · 7c | Rework — sidebar `activeMatch` |
| [#2146](https://github.com/vuejs/vitepress/issues/2146) | 👍8 | Rework — outline auto-expand |
| [#3534](https://github.com/vuejs/vitepress/issues/3534) | 👍7 · 11c | Rework — breadcrumbs from resolved sidebar |
| [#1037](https://github.com/vuejs/vitepress/issues/1037) + [#4532](https://github.com/vuejs/vitepress/pull/4532) | 👍7 + 👍6 | Rework — footer with sidebar |
| [#3654](https://github.com/vuejs/vitepress/pull/3654) cluster | 👍6 + 👍3 + 👍2 | Rework — auto-reveal active item ([#5194](https://github.com/vuejs/vitepress/pull/5194) spec) |
| [#1844](https://github.com/vuejs/vitepress/pull/1844) | 👍5 | Scrollbar-shift decision |
| [#3806](https://github.com/vuejs/vitepress/pull/3806) + [#4847](https://github.com/vuejs/vitepress/pull/4847) | 12c + 5c | Rework — native `<details>` groups |
| [#2913](https://github.com/vuejs/vitepress/pull/2913) | 7c | Print styles |
