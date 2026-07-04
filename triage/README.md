# vuejs/vitepress open-issue triage

**Snapshot:** 2026-07-04 · **375 open issues** (of 375 fetched)

> First-pass triage generated with Claude Code: each issue (body + up to 8 comments) was assessed by a small-model agent; results were merged and aggregated here. Treat type/priority/status as informed suggestions, not ground truth — spot-check before acting, especially before closing.

## Files

- [bugs.md](./bugs.md) — bugs by area
- [features.md](./features.md) — feature requests & enhancements by demand
- [docs.md](./docs.md) — documentation issues
- [questions.md](./questions.md) — questions / support threads
- [maintenance-upstream.md](./maintenance-upstream.md) — upstream-rooted issues & chores
- [actions.md](./actions.md) — **start here**: close candidates, repro pings, quick wins

## Breakdown

### By type

| Type | Count |
|---|---|
| feature | 167 |
| bug | 127 |
| question | 39 |
| enhancement | 28 |
| docs | 9 |
| upstream | 4 |
| maintenance | 1 |

### By priority

| Priority | Count |
|---|---|
| P0 | 0 |
| P1 | 52 |
| P2 | 220 |
| P3 | 103 |

### By status

| Status | Count |
|---|---|
| actionable | 176 |
| likely-answered | 82 |
| needs-info | 35 |
| stale-candidate | 27 |
| possibly-fixed | 26 |
| upstream-blocked | 15 |
| needs-repro | 13 |
| possible-duplicate | 1 |

### By area

| Area | Count |
|---|---|
| default-theme | 115 |
| build | 54 |
| markdown | 45 |
| config | 35 |
| search-local | 21 |
| other | 18 |
| router | 15 |
| ssr-hydration | 15 |
| head-meta | 11 |
| css | 9 |
| i18n | 9 |
| dev-server | 8 |
| cli | 5 |
| a11y | 5 |
| types | 4 |
| deps | 3 |
| search-algolia | 3 |

### Label hygiene

7 of 375 open issues have no labels.

## High-priority bugs (P0/P1) — 32

| Issue | Prio | Area | Status | 👍 | Age |
|---|---|---|---|---|---|
| [#2939](https://github.com/vuejs/vitepress/issues/2939) Dynamic routes/pages not visible in `local` search | P1 | search-local | needs-info | 9 | 2.8y |
| [#3024](https://github.com/vuejs/vitepress/issues/3024) can not use $frontmatter with Local Search | P1 | search-local | actionable | 4 | 2.8y |
| [#4242](https://github.com/vuejs/vitepress/issues/4242) [Memory Leak]: Builds incorporating Shiki Twoslash crash with JavaScript heap out of memory errors | P1 | other | upstream-blocked | 4 | 1.8y |
| [#2873](https://github.com/vuejs/vitepress/issues/2873) npx vitepress init does not install the vitepress dependency in package.json | P1 | cli | actionable | 3 | 2.8y |
| [#3028](https://github.com/vuejs/vitepress/issues/3028) Vitepress' router.js prevents event trackers accurately recording | P1 | router | actionable | 3 | 2.8y |
| [#1298](https://github.com/vuejs/vitepress/issues/1298) Content Security Policy: Ensure innerHTML assignments are TrustedHTML and publish security policy name, hashes | P1 | head-meta | actionable | 2 | 3.8y |
| [#2984](https://github.com/vuejs/vitepress/issues/2984) :target css only works on reload | P1 | ssr-hydration | actionable | 2 | 2.8y |
| [#4415](https://github.com/vuejs/vitepress/issues/4415) Crash with JS heap OOM when editing LaTeX-heavy pages under `vitepress dev` | P1 | dev-server | upstream-blocked | 2 | 1.6y |
| [#3685](https://github.com/vuejs/vitepress/issues/3685) Content Security Policy: unsafe-eval has to be set due to `new Function` call when using customized search | P1 | search-local | actionable | 1 | 2.3y |
| [#4313](https://github.com/vuejs/vitepress/issues/4313) When using bun to start, modifying the content of the config.mts file will get stuck at restarting the service | P1 | dev-server | actionable | 1 | 1.7y |
| [#4364](https://github.com/vuejs/vitepress/issues/4364) Links in the Nav bar do not support rewrites | P1 | router | actionable | 1 | 1.6y |
| [#2980](https://github.com/vuejs/vitepress/issues/2980) a11y: Headings are read verbosely by VoiceOver | P1 | a11y | actionable | 0 | 2.8y |
| [#3062](https://github.com/vuejs/vitepress/issues/3062) Enable rewrites function got 404 when running in preview and build mode. | P1 | router | actionable | 0 | 2.7y |
| [#3314](https://github.com/vuejs/vitepress/issues/3314) Vite's "transformIndexHtml" hook is not invoked on build | P1 | build | actionable | 0 | 2.6y |
| [#3363](https://github.com/vuejs/vitepress/issues/3363) bug: Repeated builds will result in incorrect cache | P1 | build | actionable | 0 | 2.5y |
| [#3517](https://github.com/vuejs/vitepress/issues/3517) accessibility: interactive controls should not be nested | P1 | a11y | actionable | 0 | 2.4y |
| [#3774](https://github.com/vuejs/vitepress/issues/3774) dead link errors should show transformed URL | P1 | build | actionable | 0 | 2.2y |
| [#3878](https://github.com/vuejs/vitepress/issues/3878) Outline marker does not move to correct item | P1 | default-theme | actionable | 0 | 2.1y |
| [#4134](https://github.com/vuejs/vitepress/issues/4134) TypeError: Cannot read properties of null (reading 'parentNode') | P1 | ssr-hydration | possibly-fixed | 0 | 1.9y |
| [#4200](https://github.com/vuejs/vitepress/issues/4200) 动态路由打包后遇到的bug，开发环境正常 | P1 | ssr-hydration | needs-repro | 0 | 1.8y |
| [#4227](https://github.com/vuejs/vitepress/issues/4227) Packaging optimization | P1 | build | upstream-blocked | 0 | 1.8y |
| [#4331](https://github.com/vuejs/vitepress/issues/4331) createContentLoader doesn't respect cleanUrls | P1 | build | actionable | 0 | 1.7y |
| [#4359](https://github.com/vuejs/vitepress/issues/4359) Local navigation dropdown misplaced without sidebar | P1 | default-theme | actionable | 0 | 1.6y |
| [#4361](https://github.com/vuejs/vitepress/issues/4361) Big BUG: Page flashing issue when scrolling down and navigating back in VitePress | P1 | ssr-hydration | needs-repro | 0 | 1.6y |
| [#4625](https://github.com/vuejs/vitepress/issues/4625) Including non-existent regions includes entire file content | P1 | markdown | actionable | 0 | 1.3y |
| [#4750](https://github.com/vuejs/vitepress/issues/4750) Some SVG icons go missing on vue components | P1 | ssr-hydration | possibly-fixed | 0 | 1.1y |
| [#4833](https://github.com/vuejs/vitepress/issues/4833) JavaScript heap out of memory when building large documentation sites with extensive mathematical formulas | P1 | build | possibly-fixed | 0 | 12mo |
| [#4897](https://github.com/vuejs/vitepress/issues/4897) Reduce layout shifts caused by LocalNav for devices with width 960px - 1280px | P1 | default-theme | actionable | 0 | 11mo |
| [#4997](https://github.com/vuejs/vitepress/issues/4997) static asset not working for poster attribute of video element in raw html | P1 | build | actionable | 0 | 8mo |
| [#5045](https://github.com/vuejs/vitepress/issues/5045) keycloak sso redirect show 404 | P1 | router | actionable | 0 | 7mo |
| [#5134](https://github.com/vuejs/vitepress/issues/5134) OOM (heap out of memory) during `vitepress build` with large dynamic routes (~26,000 pages) | P1 | build | actionable | 0 | 4mo |
| [#5143](https://github.com/vuejs/vitepress/issues/5143) Name Collision & Unintentional Link Leak | P1 | build | actionable | 0 | 4mo |

## Most-requested features (top 25 by 👍)

| Issue | 👍 | Area | Status | Age |
|---|---|---|---|---|
| [#109](https://github.com/vuejs/vitepress/issues/109) Versioning | 36 | config | actionable | 5.7y |
| [#3254](https://github.com/vuejs/vitepress/issues/3254) Searchable tags | 20 | search-local | actionable | 2.6y |
| [#1297](https://github.com/vuejs/vitepress/issues/1297) auto sidebar mode | 17 | config | actionable | 3.8y |
| [#3966](https://github.com/vuejs/vitepress/issues/3966) Unified API for VitePress Plugins | 17 | config | actionable | 2.0y |
| [#3093](https://github.com/vuejs/vitepress/issues/3093) Feature Request: Inline Syntax Highlight | 16 | markdown | actionable | 2.7y |
| [#2954](https://github.com/vuejs/vitepress/issues/2954) Sync code group selection | 14 | default-theme | actionable | 2.8y |
| [#285](https://github.com/vuejs/vitepress/issues/285) Add permalink feature | 14 | config | actionable | 5.2y |
| [#794](https://github.com/vuejs/vitepress/issues/794) Add "Index Page" feature | 13 | other | likely-answered | 4.1y |
| [#3461](https://github.com/vuejs/vitepress/issues/3461) support for single file output | 12 | build | stale-candidate | 2.5y |
| [#4590](https://github.com/vuejs/vitepress/issues/4590) Support llms.txt generation | 12 | other | actionable | 1.3y |
| [#854](https://github.com/vuejs/vitepress/issues/854) Allow images to be zoomed in on click | 10 | default-theme | likely-answered | 4.0y |
| [#2257](https://github.com/vuejs/vitepress/issues/2257) Highlight active sidebar item when child page is loaded | 9 | default-theme | actionable | 3.2y |
| [#2826](https://github.com/vuejs/vitepress/issues/2826) Generate dynamic routes after performing build-time data loading | 9 | build | upstream-blocked | 2.9y |
| [#3263](https://github.com/vuejs/vitepress/issues/3263) Link previews | 9 | default-theme | needs-info | 2.6y |
| [#2146](https://github.com/vuejs/vitepress/issues/2146) Auto expand/collapse sections in page outline | 8 | default-theme | actionable | 3.3y |
| [#1838](https://github.com/vuejs/vitepress/issues/1838) blog layout | 8 | default-theme | actionable | 3.4y |
| [#4425](https://github.com/vuejs/vitepress/issues/4425) Support native CSS layers | 8 | css | possibly-fixed | 1.6y |
| [#3746](https://github.com/vuejs/vitepress/issues/3746) How to custom the title of code block like docusaurus? | 7 | markdown | actionable | 2.2y |
| [#1037](https://github.com/vuejs/vitepress/issues/1037) Allow footer compatible with sidebar | 7 | default-theme | actionable | 4.0y |
| [#2410](https://github.com/vuejs/vitepress/issues/2410) Expose the built-in markdown parser to render markdown-valued variables with | 7 | markdown | actionable | 3.1y |
| [#3349](https://github.com/vuejs/vitepress/issues/3349) @include markdown and code files from an arbitrary public URL | 7 | markdown | needs-info | 2.5y |
| [#3591](https://github.com/vuejs/vitepress/issues/3591) feat(containers-plugin): Being able to add custom containers | 7 | markdown | actionable | 2.4y |
| [#2892](https://github.com/vuejs/vitepress/issues/2892) Runtime dynamic routes | 6 | router | actionable | 2.8y |
| [#3534](https://github.com/vuejs/vitepress/issues/3534) breadcrumb | 6 | default-theme | likely-answered | 2.4y |
| [#4160](https://github.com/vuejs/vitepress/issues/4160) Client-side redirects | 6 | other | actionable | 1.9y |

## Related-issue clusters

> Groups of open issues that ask for the same thing or share a root cause — candidates for consolidation into single tracking issues.

### Sidebar should track the active page (8 issues)
#4345, #4296, #3426, #4579, #4211, #3441, #2881, #2257 — all want the sidebar to follow the current page (auto-scroll the active item into view, auto-expand its group / accordion-collapse the others, highlight the parent for child pages); #2881 explicitly spans both halves, so one "sidebar active-state UX" tracking issue could absorb all of them.

### Dead-link checker coverage and reporting (7 issues)
#3244, #3039, #3081, #646, #4009, #3774, #4992 — five coverage gaps (sidebar links, frontmatter links, missing assets, hash fragments, external URLs) plus two reporting problems (transformed filenames, URL-encoded output) in the same link-validation subsystem; an obvious single "link checker improvements" epic.

### Richer per-page git/author metadata (6 issues)
#4892, #4491, #1891, #4820, #3848, #3520 — all want page metadata beyond `lastUpdated`: creation date (#4892/#4491/#1891 are direct duplicates), author/committer (#4820, #3848), and commit hash (#3520); consolidatable into one "extend page git metadata" issue.

### `@include` directive bugs and extensions (6 issues)
#4625, #4757, #4570, #4386, #3349, #4838 — two bugs (missing region silently includes the whole file; multi-section include from one file throws duplicate-id) plus asks for variable paths, per-reference parameterization, remote URLs, and an exported `processIncludes`, all in the include pipeline.

### Custom container types and theming (6 issues)
#3591, #4427, #3928, #4926, #3893, #3891 — all want the container set/palette extended or fixed: user-defined containers, `note` and `important` types, configurable Caution color, the unused `--vp-c-note-*` vars, and border styling; one "container extensibility" issue would cover them.

### Assets referenced outside markdown syntax aren't resolved (6 issues)
#4997, #4618, #3262, #2419, #3161, #3246 — same root cause: only markdown-syntax references go through the Vite asset pipeline, so raw-HTML `img`/`poster` paths, frontmatter `og:image`, head config assets, and `themeConfig.logo` break after build.

### Heap OOM on large builds (5 issues)
#5134, #4833, #4227, #4242, #4415 — JS heap out-of-memory building (or HMR-editing) large sites: generic scale (#5134 ~26k pages, #4227 1000+ files), KaTeX/MathJax-heavy content (#4833 build, #4415 dev), and Shiki Twoslash (#4242); same "render everything in one process, retain everything" root cause.

### Raw angle brackets break Vue/HTML compilation of markdown (5 issues)
#5220, #4216, #4622, #2962, #3712 — unescaped `<...>` in tables, changelogs, and even SVN conflict markers gets parsed as Vue template/HTML and errors or crashes dev; all ask for an opt-out/laxer parsing mode, so one "disable HTML tag parsing" feature would resolve the set.

### Permalinks / URLs decoupled from filenames (5 issues)
#285, #5021, #4980, #4981, #3326 — all want served URLs independent of source file names (frontmatter `permalink`, hash-based URLs, English URLs for Chinese-named files); #285/#5021/#4980 are direct duplicates and the others are the same ask motivated by non-Latin filenames.

### Production-only hydration breakage on static hosts (5 issues)
#3586, #4107, #4544, #3780, #4134 — hydration mismatches / blank or erroring pages that appear only when deployed (GitHub Pages, Azure, `serve`), mostly traceable to host redirect/trailing-slash serving behavior; could be tracked as one "hydration vs static host URL normalization" issue.

### npm-packaged themes/loaders break module resolution (5 issues)
#4529, #4342, #3292, #2154, #2179 — consuming a theme or data loader from `node_modules` fails in dev or build (`without-fonts` ERR_MODULE_NOT_FOUND, `import.meta.glob` paths, duplicated injection Symbols via optimizeDeps, `@theme/index`, transpiled `export { data }`); same "distributable packages aren't first-class" gap.

### Language switcher link fidelity (5 issues)
#4347, #3275, #4772, #2958, #4765 — switching locales should land users correctly: fall back when the translated page is missing (#4347/#3275 are duplicates) and preserve query params, hash, and anchor consistency (#4772, #2958, #4765); one "locale link resolution" tracking issue fits all.

### Default theme accessibility fixes (5 issues)
#5056, #3517, #2980, #3804, #2085 — WCAG/screen-reader/keyboard problems in the default theme (nested interactive sidebar controls, verbose headings in VoiceOver, non-native collapsibles, inconsistent navbar contrast), with #5056 already an umbrella list the others could fold into.

### Local search doesn't scale to large sites (4 issues)
#5077, #5009, #3873, #4621 — huge minisearch index chunks (500 KB–20 MB) make search slow to load and feel frozen; #5077 proposes the architecture fix (workers + binary index), #4621 the loading-state mitigation — natural one epic.

### Local search is blind to rendered/dynamic content (4 issues)
#4934, #3024, #4979, #2939 — the index is built from raw markdown before rendering, so `$frontmatter`-interpolated titles (#4934/#3024 duplicates), Vite-plugin-transformed content, and dynamic-route pages never become searchable; one root cause.

### Headings from Vue components get broken anchors/outline (4 issues)
#4867, #5046, #3133, #3511 — headings rendered by or containing Vue components are slugified from the raw template, yielding missing header-anchor elements, absent outline entries, and wrong IDs (including Badge children); same anchor/slug pipeline gap.

### Vue interpolation not applied to `<title>`/meta (4 issues)
#4640, #4907, #3758, #3798 — `{{ ... }}` / `$params` render fine in the page body but appear literally (or as `[object Object]`) in the HTML `<title>` and head metadata during SSG; three bug reports plus one question with the same root cause.

### Code snippet import (`<<<`) feature gaps (4 issues)
#4243, #3690, #3334, #3823 — all extend the same snippet-import feature: line-range selection, multiple regions, dynamic frontmatter-driven paths, and extra attributes like twoslash; consolidatable into one snippet-import enhancement issue.

### Configurable config file/directory location (4 issues)
#2909, #3793, #4151, #5200 — all want the hardcoded `.vitepress/config` convention relaxed: custom folder, renamable dir, `vitepress.config.js` naming, and a `--config` CLI flag; one feature would satisfy all four.

### createContentLoader output doesn't match the built site (4 issues)
#4331, #3036, #2999, #3147 — loader results ignore the real pipeline: `cleanUrls` not respected, image URLs unhashed/broken after build (#3036/#2999 near-duplicates), and `render: true` leaving Vue components unrendered.

### Synced code-group tabs (3 issues)
#5013, #2954, #3245 — same feature: synchronize (and persist) code-group tab selection across all groups on a page/site à la Docusaurus tabs; #5013 already has a PR that would close the other two.

### Auto-generated sidebar/nav from file structure (3 issues)
#1297, #4229, #3704 — all ask VitePress to generate the sidebar (and nav) from the filesystem or a SUMMARY.md instead of manual `themeConfig` wiring; #1297 is the long-standing anchor issue.

### Rewrites not applied consistently (3 issues)
#4364, #3062, #4335 — the `rewrites` option is honored only in parts of the system: nav links ignore it, preview/build 404 where dev works, and index/readme rules behave differently per mode; same subsystem bug family.

### Missing image dimensions cause CLS and anchor drift (3 issues)
#5079, #4853, #3428 — images (and components) without width/height shift the layout after load, making anchor links scroll to wrong positions; auto-emitting dimensions (#4853) would fix the two bug reports.

### MiniSearch "duplicate ID" on dev-server restart (2 issues)
#4688, #4642 — restarting the dev server (manually or via `server.restart()`) re-registers pages into a stale search index and crashes; #4688 even labels itself a duplicate, so these should be merged.

## Cross-cutting themes

- **Default theme extensibility / escape hatches** (~30 issues): more slots, exposed internal components/composables/types, coexistence with third-party CSS, and home-layout flexibility — #5184, #2831, #2595, #3021, #4425.
- **Large-site scalability** (~15 issues): build memory/speed (concurrent, progressive, chunked builds, git-log batching) plus oversized search indexes and shared-config chunks — #5134, #3183, #1991, #2645, #3367.
- **Markdown pipeline control** (~20 issues): custom containers, includes, snippet imports, disabling built-in plugins, even swapping the parser — #3591, #4625, #4243, #4556, #3347.
- **Raw-source vs rendered-output mismatch** (~12 issues): search, `<title>`/meta, outline, and anchors all read raw markdown instead of rendered Vue output, producing a whole bug family — #4934, #4640, #5046, #2939, #3133.
- **Navigation/sidebar ergonomics and config burden** (~18 issues): active-page tracking, accordion behavior, auto-generation, multi-level/multi-instance navbars — #4345, #4211, #1297, #3816, #2989.
- **Data-driven pages and content collections** (~15 issues): loader/route data sharing, lazy dynamic routes, blog/tags/taxonomy primitives, page-metadata APIs, versioning — #2826, #4803, #3380, #1838, #3254, #109.
- **i18n completeness** (~10 issues): missing-translation fallback, link fidelity across locales, and translatable theme/plugin strings (containers, alerts, copy button) — #4347, #2958, #3861, #3602, #4431.
- **Visual stability and polish** (~12 issues): layout shifts from scrollbars, images, and VPLocalNav, plus px-based font sizing blocking user overrides — #4884, #4877, #1054, #4897, #570.
