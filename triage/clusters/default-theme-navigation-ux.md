[← Index](../README.md)

# Default theme navigation, outline & reading UX

Priority: P1 · 7 actionable · last reviewed 2026-08-03

Everything in the default theme between the content and the reader: navbar and mobile nav screen, sidebar, outline/TOC and its scroll marker, doc footer (prev/next, last-updated, edit link), plus scroll behaviour. Five items below are worth picking up. Two are chronic: **smooth scrolling has been filed six times** ([#978](https://github.com/vuejs/vitepress/pull/978), [#981](https://github.com/vuejs/vitepress/pull/981), [#1002](https://github.com/vuejs/vitepress/pull/1002), [#1449](https://github.com/vuejs/vitepress/pull/1449), [#1544](https://github.com/vuejs/vitepress/pull/1544), [#2133](https://github.com/vuejs/vitepress/pull/2133)) and has always failed on the same two objections, while **outline scroll tracking on long pages** has been attempted three times ([#3387](https://github.com/vuejs/vitepress/pull/3387), [#4457](https://github.com/vuejs/vitepress/pull/4457), plus still-open [#3654](https://github.com/vuejs/vitepress/pull/3654)) with nothing merged — each deserves one maintainer decision recorded on an issue rather than a seventh drive-by PR. The other three are smaller, self-contained fixes: hiding the nav on a per-page basis, letting an overflowing top nav scroll instead of silently clipping, and a more accurate `.has-aside` check.

## Worth acting on

7 PRs, grouped into 5 items of work.

### [#3387](https://github.com/vuejs/vitepress/pull/3387) Fix: Make the outline follow the page scroll — with [#4457](https://github.com/vuejs/vitepress/pull/4457) feat(theme): add doc aside scroll spy

`redo` · value 3 · effort M · @huyikai, @userquin · closed 2024-01-26 / 2025-01-01

- **Did** — both make the aside outline scroll itself so the active-heading marker stays visible on long pages; [#4457](https://github.com/vuejs/vitepress/pull/4457) via `VPDoc.vue`/`outline.ts`.
- **Closed** — [#3387](https://github.com/vuejs/vitepress/pull/3387)'s review was dismissed after testing showed the fix "doesn't seem to be working on the deploy preview," and the discrepancy was never resolved. [#4457](https://github.com/vuejs/vitepress/pull/4457) was self-closed as a duplicate of [#3654](https://github.com/vuejs/vitepress/pull/3654) — which is still open and unmerged today.
- **Still matters** — `.aside-container` is `position: fixed; height: 100vh; overflow-y: auto` with only a CSS marker for the active link and no scroll-into-view logic. Three attempts, zero landed.
- **Do** — one implementation, verified live on a deploy preview with a genuinely long page (not just code review — that is exactly how [#3387](https://github.com/vuejs/vitepress/pull/3387) died). Check whether [#3654](https://github.com/vuejs/vitepress/pull/3654) is close enough to finish before starting over; if so, close this thread by reviewing that PR.

### [#1449](https://github.com/vuejs/vitepress/pull/1449) feat: Smooth Scrolling behavior — with [#1544](https://github.com/vuejs/vitepress/pull/1544) Added smooth scrolling

`redo` · value 3 · effort M · @g4rry420, @jessekelly881 · closed 2023-01-20 / 2022-10-27

- **Did** — both add smooth scrolling for anchor/outline navigation; [#1544](https://github.com/vuejs/vitepress/pull/1544) as a bare `scroll-behavior: smooth`.
- **Closed** — kiaking wanted more discussion on [#1449](https://github.com/vuejs/vitepress/pull/1449), citing a user report of broken header-anchor jump positions, and asked that it be configurable rather than global. [#1544](https://github.com/vuejs/vitepress/pull/1544) was self-closed as a duplicate.
- **Still matters** — this is the same request filed **six times**: [#978](https://github.com/vuejs/vitepress/pull/978), [#981](https://github.com/vuejs/vitepress/pull/981), [#1002](https://github.com/vuejs/vitepress/pull/1002), [#1449](https://github.com/vuejs/vitepress/pull/1449), [#1544](https://github.com/vuejs/vitepress/pull/1544), [#2133](https://github.com/vuejs/vitepress/pull/2133). Only the "back to top" button scrolls smoothly today; router and outline navigation jump. The four other filings failed on approach, never on the desire itself.
- **Do** — decide once, publicly, and link every future filing to that decision. The objections across all six are consistent and narrow: (a) CSS-only `scroll-behavior: smooth` breaks outline-link scroll targeting and desyncs the active-heading highlight and URL hash, because scroll handlers are throttled ([#978](https://github.com/vuejs/vitepress/pull/978), demonstrated on video in [#981](https://github.com/vuejs/vitepress/pull/981)); (b) a user-facing nav toggle is unwanted — kiaking on [#2133](https://github.com/vuejs/vitepress/pull/2133): "Never seen this in any site." That leaves exactly one viable shape: opt-in `themeConfig` flag, JS-driven scroll that keeps outline highlighting and hash in sync, honouring `prefers-reduced-motion` automatically, no new UI. Anything else has already been rejected.

### [#1236](https://github.com/vuejs/vitepress/pull/1236) feat(theme): add ability to hide nav per-page

`redo` · value 3 · effort M · @szsascha · closed 2022-09-01

- **Did** — a `hideNav` option removing the navbar by toggling a class on `VPNavBar`.
- **Closed** — brc-dd requested changes: the logic targeted the wrong component (`VPNavBar` rather than `VPNav`/`VPLocalNav`) and ignored sidebar/footer spacing; he suggested a broader `layout: blank`-style fix per [#1091](https://github.com/vuejs/vitepress/issues/1091) instead.
- **Still matters** — no blank/bare layout exists in the theme today, and [#1091](https://github.com/vuejs/vitepress/issues/1091) is closed with no matching implementation found.
- **Do** — implement the shape brc-dd asked for (a bare layout, or frontmatter that suppresses nav *and* reclaims its spacing) rather than the per-component class toggle.

### [#5097](https://github.com/vuejs/vitepress/pull/5097) Allow overflow-x with horizontal scrolling in VPNav

`redo` · value 2 · effort M · @mohdibntarek · closed 2026-05-15

- **Did** — let the top nav scroll horizontally instead of silently clipping when nav items exceed the viewport width, prompted by two downstream Documenter.jl bug reports.
- **Closed** — author self-closed after their own follow-up regressed dropdown positioning (menus stopped floating) and they could not fix it. No maintainer ever weighed in.
- **Still matters** — `VPNavBar.vue`/`VPNavBarMenu.vue` still have no overflow handling; items clip silently.
- **Do** — worth a maintainer opinion *before* anyone codes it, because kiaking rejected the adjacent [#1273](https://github.com/vuejs/vitepress/pull/1273) on [#1271](https://github.com/vuejs/vitepress/issues/1271) with the position that overflowing sites should restructure their menus. Scrolling is a different remedy from wrapping, so it is not automatically covered by that ruling — but confirm the philosophy first. If green-lit: scroll only the menu row, and keep flyouts positioned against the viewport so dropdowns still float.

### [#2297](https://github.com/vuejs/vitepress/pull/2297) fix: better `.has-aside` condition

`salvage` · value 2 · effort M · @bojanrajh · closed 2026-07-08

- **Did** — reworked how `.has-aside` is computed on `VPDoc`/`VPContent` to account for rendered slots, `theme.carbonAds` and `getHeaders()`, not just frontmatter/theme aside settings. Ships with slot tests.
- **Closed** — no comments ever left; closed roughly three years after opening in the recent bulk stale cleanup.
- **Still matters** — `composables/layout.ts` `hasAside` still ignores the carbonAds/slots/`getHeaders` edge cases, and `theme.carbonAds` config still exists in `VPDocAside.vue`, so the correctness gap is unaddressed.
- **Do** — rebase against today's component structure and re-verify the included slot tests; it's the cheapest correctness fix here if the rebase goes cleanly.
