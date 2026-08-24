# Planned follow-ups

Moved here from the [#5397](https://github.com/vuejs/vitepress/pull/5397) description. This is the plan of record; the audit pages in this directory carry the requirements each item has since accumulated.

## Reworks and features

- Rework the local nav and the sidebar on the same principles: the sidebar curtain, the nav-height DOM probe, the closed sidebar staying in the tab order, and SSR determinism for the local nav ([#4897](https://github.com/vuejs/vitepress/issues/4897), and the unification asked for in [#3393](https://github.com/vuejs/vitepress/issues/3393)). The full requirements register is in the [README](./README.md#the-local-nav--sidebar-rework--requirements-register), backed by [local-nav.md](./local-nav.md) and [sidebar.md](./sidebar.md).
- An opt-in contract for collapsing custom component items with richer context ([#4000](https://github.com/vuejs/vitepress/issues/4000)). The audit widened this to cover slot content in both axes (width — invisible to the overflow engine; height — the [#1273](https://github.com/vuejs/vitepress/pull/1273) bar-growth delta) and separator items ([#3407](https://github.com/vuejs/vitepress/issues/3407)) — see [navbar.md](./navbar.md) and [pr-1273.md](./pr-1273.md).
- Version switcher ([#109](https://github.com/vuejs/vitepress/issues/109)), link-with-dropdown parents ([#2989](https://github.com/vuejs/vitepress/issues/2989)) and nested dropdowns ([#3816](https://github.com/vuejs/vitepress/issues/3816)) — the new structure leaves room for all three. For nested dropdowns, [#3069](https://github.com/vuejs/vitepress/pull/3069) adds the disclosure-semantics requirement: groups render now, but `VPMenuGroup` titles are static and need `aria-expanded` toggles — see [navbar.md](./navbar.md).
- Navbar title overflow: instead of showing an ellipsis, wrap or shrink the title to fit the sidebar column, using container queries or the proposed text-fit sizing.

## Progressive enhancements

From a researched pass against current interop data:

- `@starting-style` with `transition-behavior: allow-discrete` for the flyout and drawer transitions. Baseline since mid-2024; the fallback is instant show and hide.
- `popover` with CSS anchor positioning for the flyouts, behind one `@supports` gate. Top-layer rendering removes the Safari clipping hazard ([#5050](https://github.com/vuejs/vitepress/issues/5050)) structurally and replaces the outside-tap and Escape handling. [#5097](https://github.com/vuejs/vitepress/pull/5097)'s author hitting the scroll-container stacking trap independently confirms the value — see [theming-css.md](./theming-css.md).
- Logical properties across the navbar. Verified to pass through postcss-rtlcss untouched, so there is no double-flip risk. This is the sound core of [#5034](https://github.com/vuejs/vitepress/issues/5034) and [#5071](https://github.com/vuejs/vitepress/pull/5071). The audit adds the benefit argument the [#2056](https://github.com/vuejs/vitepress/pull/2056) decline asked for, the outline-marker regression test that attempt exposed, and the runtime `dir` toggle ([#2794](https://github.com/vuejs/vitepress/issues/2794)) it unlocks — see [theming-css.md](./theming-css.md).
- Scroll-driven animations for the top and scrolled states once Firefox ships them (around v157). This also fixes a first-paint flash on scroll-restored loads — the residual complaint on [#1897](https://github.com/vuejs/vitepress/issues/1897).
- `light-dark()` token consolidation once it reaches Baseline widely available, as its own PR. Pair it with `color-mix()` ([#3433](https://github.com/vuejs/vitepress/issues/3433)) in the same pass, and keep a plain-token override seam so multi-mode theming ([#4471](https://github.com/vuejs/vitepress/issues/4471)) stays possible — see [theming-css.md](./theming-css.md).
- `details` and `summary` with `::details-content` for the drawer accordions, as its own accessibility review. The sidebar-groups half has two competing PRs to reconcile and four behavioral constraints on record — see the [README](./README.md) and [sidebar.md](./sidebar.md).
- A `prefers-reduced-transparency` override in the documented glass recipe.

## Investigated and not planned

- `dialog` for the drawer — it would render the hamburger inert and does not lock scroll.
- Container queries for the bar — its layout is viewport-coupled by design. The aside is the opposite case and the natural home for them ([#3194](https://github.com/vuejs/vitepress/issues/3194)) — see [theming-css.md](./theming-css.md).
- `scrollbar-gutter: stable` for [#5310](https://github.com/vuejs/vitepress/issues/5310) — the gutter painting is per spec and overlay-scrollbar platforms are unaffected. The modal/scroll-lock case still needs a mechanism regardless — see the scrollbar decision in the [README](./README.md#three-decisions-to-make-once).
- `popover="hint"` and `hidden="until-found"`.
