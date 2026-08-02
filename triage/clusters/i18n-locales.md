[← Index](../README.md)

# i18n & locale handling

Priority: P2 · 1 actionable · last reviewed 2026-08-03

VitePress serves multi-language documentation by keying routing, theme strings, and search indexing off a URL's locale prefix, such as `/zh/` or `/ja/`. That matching has one live gap: it requires a trailing slash, so a bare `/zh` fails to match and silently falls back to the root locale — wrong config, wrong UI strings, and the wrong search bucket, with nothing to signal the mismatch. [#2002](https://github.com/vuejs/vitepress/pull/2002) closes exactly that gap and is the one item worth picking up below.

## Worth acting on

### [#2002](https://github.com/vuejs/vitepress/pull/2002) fix: allow to use language page without ending slash

**salvage** · value 3 · effort S · azat-io · closed 2023-02-28

**What it did.** Relaxed locale path matching so a bare `/zh` (no trailing slash) resolves to the `zh` locale rather than falling back to root, closing [#2001](https://github.com/vuejs/vitepress/issues/2001).

**Why it was closed.** Closed the day after opening with no recorded discussion — no stated objection.

**Why it still matters.** Verified against current main: `getLocaleForPath` in `src/shared/shared.ts:101` still matches with `` `^/${key}/` ``, and `isActive` normalises `/zh` to `/zh` before testing that regex, so a bare `/zh` misses every locale key and returns `'root'`. The bug is live. It affects more than the page render — the same function backs `resolveSiteDataByRoute`, `markdownToVue`, and locale bucketing in `localSearchPlugin`, so a bare-locale URL gets root-locale config, root-locale theme strings and the wrong search index bucket.

**Recommendation.** Reimplement directly rather than rebasing a three-year-old branch; the change is a single regex in a single tracked file (`src/client/shared.ts` and `src/node/shared.ts` are generated copies and are gitignored). Match `` `^/${key}(/|$)` `` or equivalent. Worth a unit test covering `/zh`, `/zh/`, `/zh/guide/` and a non-match like `/zhuang/` — that last case is the one a careless fix breaks.
