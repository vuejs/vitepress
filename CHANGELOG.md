# [1.0.0-rc.6](https://github.com/vuejs/vitepress/compare/v1.0.0-rc.5...v1.0.0-rc.6) (2023-08-27)

### Reverts

- "perf: extract social icons as plugin to avoid unused icons" ([#2861](https://github.com/vuejs/vitepress/issues/2861)) ([47068ff](https://github.com/vuejs/vitepress/commit/47068ff0c5705795e1a8cd06212862dedd25f6d0))

# [1.0.0-rc.5](https://github.com/vuejs/vitepress/compare/v1.0.0-rc.4...v1.0.0-rc.5) (2023-08-27)

### Bug Fixes

- **a11y/theme:** disable transitions if user prefers reduced motion ([fc5092f](https://github.com/vuejs/vitepress/commit/fc5092fb651487e69737fff04d3979f00c67dcc6))
- **build:** respect preserveSymlinks ([#2780](https://github.com/vuejs/vitepress/issues/2780)) ([1bda710](https://github.com/vuejs/vitepress/commit/1bda710702f5569e26b24b44785d938296870884))
- **cli/init:** print the correct packageManager ([#2787](https://github.com/vuejs/vitepress/issues/2787)) ([b388b0a](https://github.com/vuejs/vitepress/commit/b388b0a8c169e399f8da43368022454b6e8ea489))
- **cli/init:** terminal message has not enough contrast ([#2786](https://github.com/vuejs/vitepress/issues/2786)) ([4d9d977](https://github.com/vuejs/vitepress/commit/4d9d9775190178d0eaea5b3cea86309ae420bd43))
- restart server on theme creation/deletion ([#2785](https://github.com/vuejs/vitepress/issues/2785)) ([e0be677](https://github.com/vuejs/vitepress/commit/e0be677554a517e8b02fcaf930828bb052d1c4a4))
- scroll-to-top in iOS when opens sidebar ([#2803](https://github.com/vuejs/vitepress/issues/2803)) ([3dab9a6](https://github.com/vuejs/vitepress/commit/3dab9a6be1b543cf52c7c61f1e439a7973cd6667))
- stackblitz not working on firefox ([877f643](https://github.com/vuejs/vitepress/commit/877f643b133b70f01bbf397900829050a399893f)), closes [#2817](https://github.com/vuejs/vitepress/issues/2817)
- **theme:** docsearch variables not applying properly on ios beta ([436e99a](https://github.com/vuejs/vitepress/commit/436e99a594d42650f69c062fd095eb0502a76b34))
- **theme:** improve logo svg and add `art` dir ([1f8c58a](https://github.com/vuejs/vitepress/commit/1f8c58aed0bf5a191021913dd7f9a87e9b75f3eb))
- **theme:** prevent sidebar re-render unless there is actual change ([33962e0](https://github.com/vuejs/vitepress/commit/33962e04ebb2724e12b131f61ff00fe0aaf990f3)), closes [#2796](https://github.com/vuejs/vitepress/issues/2796)
- **theme:** revert 79 to 179 in yellow-soft ([#2858](https://github.com/vuejs/vitepress/issues/2858)) ([74fcb60](https://github.com/vuejs/vitepress/commit/74fcb60fb4ceb97b9ab0442a26e22a726af2dcc9))
- **theme:** show only one carbon ad at a time ([5ced0cc](https://github.com/vuejs/vitepress/commit/5ced0cca837ac7fbf1884ab56255b29c69dbec40))
- **theme:** ssr issues on deno ([e8edd0a](https://github.com/vuejs/vitepress/commit/e8edd0a05f43491656c00db36630f391caf64461))

### Features

- allow customizing markdown renderer used for local search indexing ([#2770](https://github.com/vuejs/vitepress/issues/2770)) ([00dc1e6](https://github.com/vuejs/vitepress/commit/00dc1e6742273fe6fde74e7abbd160bd7724af4d))
- export postcssIsolateStyles for vp-raw ([3c736c1](https://github.com/vuejs/vitepress/commit/3c736c1c95814d1ca43b4e99bda62b8ccc908cd5))
- **theme:** allow overriding code copied text from css ([#2833](https://github.com/vuejs/vitepress/issues/2833)) ([e8ef1aa](https://github.com/vuejs/vitepress/commit/e8ef1aaabecd7374cdf6cefca6b02ff9d3d3573f))
- **theme:** allow overriding last updated time in doc footer from frontmatter ([#2848](https://github.com/vuejs/vitepress/issues/2848)) ([9a062a6](https://github.com/vuejs/vitepress/commit/9a062a6dd63db3dc9d951f2973c4ab606594a11f))
- **theme:** allow providing custom `toggle-appearance` function ([#2844](https://github.com/vuejs/vitepress/issues/2844)) ([a5f2eac](https://github.com/vuejs/vitepress/commit/a5f2eacf225ff1a9a82c10ae492658190f313fb0))
- **theme:** allow setting rel and target on sidebar links ([e477cdf](https://github.com/vuejs/vitepress/commit/e477cdfd2f62144cd6331f45aaaa865185a64575)), closes [#2851](https://github.com/vuejs/vitepress/issues/2851)
- **theme:** export VPButton and VPSponsors ([#2767](https://github.com/vuejs/vitepress/issues/2767)) ([6960ec1](https://github.com/vuejs/vitepress/commit/6960ec1cf61e973ffb238af2b77ad7aaf8c83500))
- **theme:** export VPImage ([#2814](https://github.com/vuejs/vitepress/issues/2814)) ([f242140](https://github.com/vuejs/vitepress/commit/f242140c47e8a15070f689d5a4e54c7d88100f96))
- **theme:** improve color system ([#2797](https://github.com/vuejs/vitepress/issues/2797)) ([e4f5c51](https://github.com/vuejs/vitepress/commit/e4f5c51bbe25d42fd52a1cd47e83dda4254fdd7e)), closes [#2100](https://github.com/vuejs/vitepress/issues/2100)

### Performance Improvements

- extract social icons as plugin to avoid unused icons ([#2768](https://github.com/vuejs/vitepress/issues/2768)) ([0c8cf0d](https://github.com/vuejs/vitepress/commit/0c8cf0df8903b3f48ccffa17c92fc988d88b7ad7))

### BREAKING CHANGES

- Switch to vite@5.0.0-beta.0. There might some warnings, feel free to ignore them unless they are due to some breaking changes in Vite 5. Refer their [changelog](https://github.com/vitejs/vite/blob/v5.0.0-beta.0/packages/vite/CHANGELOG.md#500-beta0-2023-08-24) for details.
- `pathname://` protocol is dropped. Specify `target="_self"` or `target="_blank"` instead. Refer [docs](https://vitepress.dev/guide/routing#linking-to-non-vitepress-pages) to learn more.
- Shiki's default theme is now changed to `github-light` and `github-dark`. If you want to use the old theme, you can set `markdown.theme` in your config to `'material-theme-palenight'`.
- Internal logic of `isDark` is changed to use vueuse. It might impact your custom theme. You can customize its behavior using [`appearance`](https://vitepress.dev/reference/site-config#appearance) option.
- Default theme's color system is updated to make it more easily customizable. Refer the [PR](https://github.com/vuejs/vitepress/pull/2797) for new variables.

# [1.0.0-rc.4](https://github.com/vuejs/vitepress/compare/v1.0.0-rc.3...v1.0.0-rc.4) (2023-08-08)

### Bug Fixes

- **cli:** generate mjs file on init if `"type": "module"` is not present ([23d7511](https://github.com/vuejs/vitepress/commit/23d751165f6def6fa6b3a5d7efd89b993a2780d8))
- **theme:** language menu undefined text ([#2755](https://github.com/vuejs/vitepress/issues/2755)) ([c9d4655](https://github.com/vuejs/vitepress/commit/c9d465587a3b2188ff9922483a15d7096e6a3e6c))

# [1.0.0-rc.3](https://github.com/vuejs/vitepress/compare/v1.0.0-rc.2...v1.0.0-rc.3) (2023-08-08)

### Bug Fixes

- **regression/theme:** fix sidebar collapsing ([#2753](https://github.com/vuejs/vitepress/issues/2753)) ([9a4ee07](https://github.com/vuejs/vitepress/commit/9a4ee07260191adeb4c3810d95b044439609525c))

# [1.0.0-rc.1](https://github.com/vuejs/vitepress/compare/v1.0.0-beta.7...v1.0.0-rc.1) (2023-08-08)

### Bug Fixes

- `createContentLoader` generates invalid url when `base` is set ([#2714](https://github.com/vuejs/vitepress/issues/2714)) ([0f38eb4](https://github.com/vuejs/vitepress/commit/0f38eb440492f3a486517714976fbfe6dfb30a09))
- **build:** make outDir from cli work properly ([17378c0](https://github.com/vuejs/vitepress/commit/17378c064f3e6f166ce180f8d7eeced2f1cc4224)), closes [#2716](https://github.com/vuejs/vitepress/issues/2716)
- **build:** nested rewrites not working properly ([0f421d7](https://github.com/vuejs/vitepress/commit/0f421d72221495b8ef14195db3e3df9297ebc6ff))
- **client:** handle empty hash in links ([#2738](https://github.com/vuejs/vitepress/issues/2738)) ([c6c983e](https://github.com/vuejs/vitepress/commit/c6c983ed73a019027b452b3eaf0ee4b502d38818))
- fix sitemap path resolution ([481a5e3](https://github.com/vuejs/vitepress/commit/481a5e3cb55c6fda2c318180cfa0532ed34e4fc5)), closes [#2749](https://github.com/vuejs/vitepress/issues/2749)
- **theme:** align max-width media queries ([d31051a](https://github.com/vuejs/vitepress/commit/d31051a05106f97924be3cdb3919f24acc232b59))
- **theme:** allow using h1 headings in outline ([e3f8fc7](https://github.com/vuejs/vitepress/commit/e3f8fc7972f5506cd9def08ad13c62141737318f)), closes [#1529](https://github.com/vuejs/vitepress/issues/1529)
- **theme:** close dropdown menus after an item is clicked ([#2380](https://github.com/vuejs/vitepress/issues/2380)) ([e54eea3](https://github.com/vuejs/vitepress/commit/e54eea3da0de640e7b343381bddf9a439d638954))
- **theme:** don't reset scroll position on changing tab in code groups ([039798a](https://github.com/vuejs/vitepress/commit/039798a8c14a8c455e1187c5584c7f518c40f66a)), closes [#2732](https://github.com/vuejs/vitepress/issues/2732) [#2362](https://github.com/vuejs/vitepress/issues/2362)
- **theme:** dont show transparent navbar other than home ([#2742](https://github.com/vuejs/vitepress/issues/2742)) ([1d6254b](https://github.com/vuejs/vitepress/commit/1d6254b615b48ceef85267045e8fce976a7eafd5))
- **theme:** hide outline marker on scroll to top ([81e7405](https://github.com/vuejs/vitepress/commit/81e7405e193e832442db9aedb50ed3dc741e92ed))
- **theme:** outline marker flicks when navigating towards above ([e8ebf1b](https://github.com/vuejs/vitepress/commit/e8ebf1b0483e025b7d3bc3ea6eb3fa02d4acac93)), closes [#2665](https://github.com/vuejs/vitepress/issues/2665) [#2676](https://github.com/vuejs/vitepress/issues/2676)
- **theme:** override docsearch button bg ([063b0e5](https://github.com/vuejs/vitepress/commit/063b0e520a0b34db934371f56ddba212ceb3ba4c)), closes [#2735](https://github.com/vuejs/vitepress/issues/2735)
- **theme:** respect feature icon dimensions set from frontmatter ([93823a8](https://github.com/vuejs/vitepress/commit/93823a8566df22c57cb4fbc81fa65c34222ece5e)), closes [#1886](https://github.com/vuejs/vitepress/issues/1886)
- **theme:** scroll code group tab into view on selection ([1a6efba](https://github.com/vuejs/vitepress/commit/1a6efbae8e13eb6612aacdb8d384554e72e5f562)), closes [#2355](https://github.com/vuejs/vitepress/issues/2355)
- **theme:** update sidebar active link status on hash change ([#2736](https://github.com/vuejs/vitepress/issues/2736)) ([3840eaa](https://github.com/vuejs/vitepress/commit/3840eaae163cc9307c8d8525ad03c59752443b2b))

### Features

- **theme:** final re-brand ([#2727](https://github.com/vuejs/vitepress/pull/2727)) ([c0d838b](https://github.com/vuejs/vitepress/commit/c0d838bda0121fc162d1e6a43324f75290bc1b72))
- allow html blocks inside code groups ([#2719](https://github.com/vuejs/vitepress/issues/2719)) ([7f0c18e](https://github.com/vuejs/vitepress/commit/7f0c18e01384d48380b64ba629229ec048f85453))
- **build:** add `markdown.preConfig` option ([ce85726](https://github.com/vuejs/vitepress/commit/ce85726c127d9478274126374df9c37ee8b31167)), closes [#1382](https://github.com/vuejs/vitepress/issues/1382)
- **build:** allow overriding vite config loading ([#2750](https://github.com/vuejs/vitepress/issues/2750)) ([1bed154](https://github.com/vuejs/vitepress/commit/1bed154612661ac3783558cf82a7e94832ee4ff8))
- **client:** allow customizing scrollOffset padding ([20b509c](https://github.com/vuejs/vitepress/commit/20b509c6e1d957c73be75da27635b23de42781d4)), closes [#2739](https://github.com/vuejs/vitepress/issues/2739)
- **client:** allow overriding props on Content ([1179484](https://github.com/vuejs/vitepress/commit/11794844327c65bd6086b1237b0d6568cb32a4cb)), closes [#2712](https://github.com/vuejs/vitepress/issues/2712)
- i18n with sitemap ([#2708](https://github.com/vuejs/vitepress/issues/2708)) ([7778187](https://github.com/vuejs/vitepress/commit/7778187f2dc31554fa7541da9648235c994d4ae8))
- **search:** allow enabling detailed view by default ([4af5975](https://github.com/vuejs/vitepress/commit/4af597582cd8ae565e22c912f26f67123babcd61)), closes [#2690](https://github.com/vuejs/vitepress/issues/2690)
- **theme:** allow adding custom layouts ([f4a5c43](https://github.com/vuejs/vitepress/commit/f4a5c43cb00d70143cefcd9dfd9ba536f120ffda)), closes [#2547](https://github.com/vuejs/vitepress/issues/2547)
- **theme:** allow customizing default theme's 404 page ([d7e2254](https://github.com/vuejs/vitepress/commit/d7e225473bd072119c3ce76317db2b723be74f81)), closes [#2715](https://github.com/vuejs/vitepress/issues/2715)
- **theme:** allow customizing prev/next text from config file ([09a4fdc](https://github.com/vuejs/vitepress/commit/09a4fdc9b844a3e1877045afc496282b988f6f6b)), closes [#1373](https://github.com/vuejs/vitepress/issues/1373)
- **theme:** allow overriding logo link ([2a7422b](https://github.com/vuejs/vitepress/commit/2a7422bbbf91b852e27525d64627e9cff6eff294)), closes [#1683](https://github.com/vuejs/vitepress/issues/1683)
- **theme:** allow passing html in nav links ([69251b7](https://github.com/vuejs/vitepress/commit/69251b7484d8e4591841c32dd2f5a0179859cf14)), closes [#1652](https://github.com/vuejs/vitepress/issues/1652)
- **theme:** allow setting base path in sidebar items ([#2734](https://github.com/vuejs/vitepress/issues/2734)) ([52884d9](https://github.com/vuejs/vitepress/commit/52884d9d4b3ad294f4c4fcab637c4e07c80dde3a))

### Reverts

- [#2689](https://github.com/vuejs/vitepress/issues/2689) ([#2722](https://github.com/vuejs/vitepress/issues/2722)) ([a56d608](https://github.com/vuejs/vitepress/commit/a56d608bec427ad51a9edb620d8fb01ebae29550))

### BREAKING CHANGES

- Node v18+ is now required to run VitePress.
- VitePress now only provides ESM API. Refer [#2703](https://github.com/vuejs/vitepress/issues/2703) for details.

# [1.0.0-beta.7](https://github.com/vuejs/vitepress/compare/v1.0.0-beta.6...v1.0.0-beta.7) (2023-07-29)

### Bug Fixes

- **build:** `createContentLoader` generates invalid url when `srcDir` is set ([#2578](https://github.com/vuejs/vitepress/issues/2578)) ([74d9ba2](https://github.com/vuejs/vitepress/commit/74d9ba27b53c6fd09b91b58bba9c1f138a6ee6f1))
- **build:** duplicate description tags with transformHead ([#2702](https://github.com/vuejs/vitepress/issues/2702)) ([68f25f5](https://github.com/vuejs/vitepress/commit/68f25f5a9cca1d059831184ad8876bb40326d9b6))
- **build:** use vue dev build when DEBUG is truthy ([#2689](https://github.com/vuejs/vitepress/issues/2689)) ([b61f36d](https://github.com/vuejs/vitepress/commit/b61f36d85326912ca67f552ecbe89aa4ca0b1919))
- **build:** remove index.html when using createContentLoader ([#2693](https://github.com/vuejs/vitepress/issues/2693)) ([6fc88a5](https://github.com/vuejs/vitepress/commit/6fc88a5cce431fa47330860155191f7b3eccb62e))
- **search:** add useFocusTrap and mark.js to optimizeDeps ([#2682](https://github.com/vuejs/vitepress/issues/2682)) ([fb048a6](https://github.com/vuejs/vitepress/commit/fb048a6f7289a12a8e67724cee29e55252568489))
- **theme:** incorrect header anchor icon position with multline headers ([#2694](https://github.com/vuejs/vitepress/issues/2694)) ([77c1b4d](https://github.com/vuejs/vitepress/commit/77c1b4d3cd3c47ffc5268ac24d0f983df443075d))
- **theme:** code group tab divider not showing full-width ([#2701](https://github.com/vuejs/vitepress/issues/2701)) ([b39b491](https://github.com/vuejs/vitepress/commit/b39b4912af9664d14f5f7c658e64b96de3865f04))
- **theme:** fix feature component always generating anchor tags ([51f28bf](https://github.com/vuejs/vitepress/commit/51f28bfac96bbb14ea0175c796e0d18fff3b2cc5))
- **theme:** respect empty rel and target ([#2705](https://github.com/vuejs/vitepress/issues/2705)) ([60dd0a4](https://github.com/vuejs/vitepress/commit/60dd0a474b056ec884f3173a233f1fb951d96870))

### Features

- sitemap generation ([#2691](https://github.com/vuejs/vitepress/issues/2691)) ([5563695](https://github.com/vuejs/vitepress/commit/5563695b1599165fa85ea69f15334e27ab6955bf))
- **build:** custom excerpt for `createContentLoader` ([#2698](https://github.com/vuejs/vitepress/issues/2698)) ([13f94a6](https://github.com/vuejs/vitepress/commit/13f94a6663d5b4472ce380ee1c27e6124da8fec3))
- **theme:** rel for feature links ([#2704](https://github.com/vuejs/vitepress/issues/2704)) ([5d18fd8](https://github.com/vuejs/vitepress/commit/5d18fd8978e418ce920aab357b180a58b1af3077))
- **theme:** support custom page class ([#2696](https://github.com/vuejs/vitepress/issues/2696)) ([2ae90a2](https://github.com/vuejs/vitepress/commit/2ae90a234338ea074b536e5583d81fd565d8e3f3))

### BREAKING CHANGES

- **build:** `createContentLoader` will now resolve globs relative to `srcDir` instead of `root`

# [1.0.0-beta.6](https://github.com/vuejs/vitepress/compare/v1.0.0-beta.5...v1.0.0-beta.6) (2023-07-22)

### Bug Fixes

- **build:** cannot handle file name containing single quote ([#2615](https://github.com/vuejs/vitepress/issues/2615)) ([9949f00](https://github.com/vuejs/vitepress/commit/9949f0046114fdbb59062ecc044aa0a735733e2e))
- **build:** remove `=""` from boolean attributes in head ([#2620](https://github.com/vuejs/vitepress/issues/2620)) ([e02adfe](https://github.com/vuejs/vitepress/commit/e02adfe3eaed9761f71d1d263822c5f94618ee72)), closes [#1131 (comment)](https://github.com/vuejs/vitepress/issues/1131#issuecomment-1574092184) [#2607](https://github.com/vuejs/vitepress/issues/2607)
- **build:** resolve nested md inclusions properly ([e8074e6](https://github.com/vuejs/vitepress/commit/e8074e60ec5941e7b447f21a289e59e9a91a9e33)), closes [#2584](https://github.com/vuejs/vitepress/issues/2584) [#2586](https://github.com/vuejs/vitepress/issues/2586)
- **compat:** disable stdin-discarder ([#2640](https://github.com/vuejs/vitepress/issues/2640)) ([08c4bac](https://github.com/vuejs/vitepress/commit/08c4bacac5e1acaa95a9878e71781f65b49f48f4))
- **hmr:** allow disabling md cache during dev ([#2581](https://github.com/vuejs/vitepress/issues/2581)) ([f60b32f](https://github.com/vuejs/vitepress/commit/f60b32f02f4236ec0c29f450c4fe79d6aabf5995))
- invalid css ([b199885](https://github.com/vuejs/vitepress/commit/b199885b9bc55082914fa651407989a03e4e3a9f))
- **lastUpdated:** use author date instead of commit date ([#2618](https://github.com/vuejs/vitepress/issues/2618)) ([47bf5bf](https://github.com/vuejs/vitepress/commit/47bf5bf991e48fd41b83613136396bc607751104))
- **theme:** code block style is broken inside custom block ([#2664](https://github.com/vuejs/vitepress/issues/2664)) ([8ff431a](https://github.com/vuejs/vitepress/commit/8ff431a6bcce8cca04d9ea23ef92045a728d686a))
- **theme:** don't show external link icon on social links ([f3a4597](https://github.com/vuejs/vitepress/commit/f3a459708d55b3b98a9d25b090e442beebcdaa92))
- **theme:** fix doc footer's prev and next's size difference ([#2600](https://github.com/vuejs/vitepress/issues/2600)) ([f52a262](https://github.com/vuejs/vitepress/commit/f52a2629a7f565ff10b263bf7efd8e258c7d4979))
- **theme:** fix sidebar's caret alignment issue with long text ([#2599](https://github.com/vuejs/vitepress/issues/2599)) ([01120a5](https://github.com/vuejs/vitepress/commit/01120a51d6d13f842678c6a1d418ac7bd3ccceca))
- **theme:** fix theme without fonts emitting inter ([#2588](https://github.com/vuejs/vitepress/issues/2588)) ([71eb11f](https://github.com/vuejs/vitepress/commit/71eb11f72e60706a546b756dc3fd72d06e2ae4e2))
- **theme:** invalid html -- article inside span ([d0e7374](https://github.com/vuejs/vitepress/commit/d0e73744412520fbbc36a8d701fa3aaaaa53ab35))
- **theme:** re-export default ([#2606](https://github.com/vuejs/vitepress/issues/2606)) ([9fdee9c](https://github.com/vuejs/vitepress/commit/9fdee9c2a30eeccb500e6aff165887d79a1686ef))
- **theme:** respect `--vp-nav-height` in local nav calculations ([#2663](https://github.com/vuejs/vitepress/issues/2663)) ([3912951](https://github.com/vuejs/vitepress/commit/3912951bad6f61950ba9da4f5cd3061218903e7d))
- **theme:** support missing meta description tag ([#2639](https://github.com/vuejs/vitepress/issues/2639)) ([cfa870f](https://github.com/vuejs/vitepress/commit/cfa870f060934c4738c2f70e7b21ad13b6acdb42))
- **theme:** two outlines at 1280px ([ceedb68](https://github.com/vuejs/vitepress/commit/ceedb68d3b22e5c5cc72be1777c6a3f7090d0a6a)), closes [#2668](https://github.com/vuejs/vitepress/issues/2668)
- **type:** `useSidebar()` type error ([#2643](https://github.com/vuejs/vitepress/issues/2643)) ([a07f959](https://github.com/vuejs/vitepress/commit/a07f959d472f1976d26c675066204eca9bc7c651))

### Features

- **build:** add `metaChunk` option to extract metadata to separate chunk ([#2626](https://github.com/vuejs/vitepress/issues/2626)) ([700fad1](https://github.com/vuejs/vitepress/commit/700fad192edef1f5d4681d714d3eaebbd77eab95))
- **build:** support custom `assetsDir` ([#2497](https://github.com/vuejs/vitepress/issues/2497)) ([64d7c3b](https://github.com/vuejs/vitepress/commit/64d7c3ba54ed2dceabcc1cb65634381d7b42ce47))
- **build:** support overriding meta viewport tag ([#2642](https://github.com/vuejs/vitepress/issues/2642)) ([94e2966](https://github.com/vuejs/vitepress/commit/94e2966babfe572a62c71907332450b18c6c9509))
- **search:** allow excluding content from search results ([#2602](https://github.com/vuejs/vitepress/issues/2602)) ([37d5b27](https://github.com/vuejs/vitepress/commit/37d5b273fbfddd41958e5cae4cc874a81dd9298a)), closes [#2344](https://github.com/vuejs/vitepress/issues/2344)
- **search:** support `minisearch` customization ([#2576](https://github.com/vuejs/vitepress/issues/2576)) ([9fee554](https://github.com/vuejs/vitepress/commit/9fee5542cb4bd0b83ccad5d625cb4eca8f8abb25))
- **theme:** allow using html text in VPHero ([#2635](https://github.com/vuejs/vitepress/issues/2635)) ([ec7643d](https://github.com/vuejs/vitepress/commit/ec7643dc1397d5b27158bd0865bd517f08e198a5))
- **theme:** make navbar logo's height customizable by css variable ([#2644](https://github.com/vuejs/vitepress/issues/2644)) ([c2e79aa](https://github.com/vuejs/vitepress/commit/c2e79aa58387281e482f88e4f307a3c36da60f40))
- **theme:** support footer frontmatter config ([#2574](https://github.com/vuejs/vitepress/issues/2574)) ([e79a13e](https://github.com/vuejs/vitepress/commit/e79a13eb42a0ab37713f09e7fd067cac559ab812))

### Performance Improvements

- fix race conditions with cache ([#2579](https://github.com/vuejs/vitepress/issues/2579)) ([32d65d4](https://github.com/vuejs/vitepress/commit/32d65d40c55b7df1a814820d5117c360f9d449a4))

# [1.0.0-beta.5](https://github.com/vuejs/vitepress/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2023-07-03)

### Bug Fixes

- **types:** `Sidebar` was exported multiple times breaking the config ([#2573](https://github.com/vuejs/vitepress/issues/2573)) ([a99dcf9](https://github.com/vuejs/vitepress/commit/a99dcf94436d6cbbd53ef5481a6ec5ffd8d887d2))

# [1.0.0-beta.4](https://github.com/vuejs/vitepress/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2023-07-02)

### Bug Fixes

- **build:** add `@vue/devtools-api` to `optimizeDeps.include` ([#2543](https://github.com/vuejs/vitepress/issues/2543)) ([b2a129f](https://github.com/vuejs/vitepress/commit/b2a129f49b8c83e528f594af977b1e901a57313e))
- **client:** bypass client router for links explicitly specifying target ([#2563](https://github.com/vuejs/vitepress/issues/2563)) ([e95015f](https://github.com/vuejs/vitepress/commit/e95015f598846e318c60929f1ef6466a8cfbb729))
- **client:** don't throw on using special chars in element ids ([#2560](https://github.com/vuejs/vitepress/issues/2560)) ([6b98113](https://github.com/vuejs/vitepress/commit/6b98113a4295e5db8d3876f176dab7e5a5b33e5c))
- **client:** scroll not working on clicking an anchor in search box ([#2527](https://github.com/vuejs/vitepress/issues/2527)) ([c30e758](https://github.com/vuejs/vitepress/commit/c30e758585ef512eef68b33918832d4413839e9c))
- **theme:** unresponsive back button with empty input in search box ([#2566](https://github.com/vuejs/vitepress/issues/2566)) ([fa3780f](https://github.com/vuejs/vitepress/commit/fa3780f8ef99b88e998523570f08a4e7f86dfd1b))

### Features

- **build:** support nested markdown includes ([#2545](https://github.com/vuejs/vitepress/issues/2545)) ([0c4210b](https://github.com/vuejs/vitepress/commit/0c4210bb5ed114fb8597786230cb145790578071))
- **client:** add onBeforePageLoad hook for router ([#2564](https://github.com/vuejs/vitepress/issues/2564)) ([665f3b0](https://github.com/vuejs/vitepress/commit/665f3b02f828175d4df5c0f79263dfa6e3f601d2))
- support selecting line range when importing md file ([#2502](https://github.com/vuejs/vitepress/issues/2502)) ([1ef33fe](https://github.com/vuejs/vitepress/commit/1ef33fe1c44875dc86835a698a708b1aa847e16e))
- **theme:** allow customizing last updated date time format options ([#2332](https://github.com/vuejs/vitepress/issues/2332)) ([24abc7c](https://github.com/vuejs/vitepress/commit/24abc7c6bda66df6e7ed543531f52c87f52f52df))
- **theme:** allow hiding navbar on specific pages via frontmatter ([#2565](https://github.com/vuejs/vitepress/issues/2565)) ([1e15001](https://github.com/vuejs/vitepress/commit/1e1500141bf6e2619caa7950f019016dc26d147f))
- **theme:** expose `useSidebar` ([#2496](https://github.com/vuejs/vitepress/issues/2496)) ([c4909e4](https://github.com/vuejs/vitepress/commit/c4909e4298ec706cf1762cb36af03e5fd3637ccc))
- **theme:** option to show icon for external links ([#2501](https://github.com/vuejs/vitepress/issues/2501)) ([52cfbc3](https://github.com/vuejs/vitepress/commit/52cfbc323615c3e017b656bb551e0d9de02d1e5f))

### BREAKING CHANGES

- **client:** specifying `target="_self"` for internal links will now perform full reload.

# [1.0.0-beta.3](https://github.com/vuejs/vitepress/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2023-06-20)

### Bug Fixes

- **build:** disable validation for rewrite compiling ([69b2625](https://github.com/vuejs/vitepress/commit/69b2625623292591207b6b591f6b39019a054a43))
- **theme:** prevent glitch when algolia chunk is loaded ([#2519](https://github.com/vuejs/vitepress/issues/2519)) ([51661de](https://github.com/vuejs/vitepress/commit/51661def8ff743733d391a61ffb2ab1b66473fd2))
- use extends in template custom theme ([#2500](https://github.com/vuejs/vitepress/issues/2500)) ([7e39e02](https://github.com/vuejs/vitepress/commit/7e39e02185f5b18da09b01bd4c132a8b50e15b07))

- revert!: sync defineConfig types with vite (#2529) ([cd03db8](https://github.com/vuejs/vitepress/commit/cd03db803d5e6b9f04e242f7843153dded73ccb2)), closes [#2529](https://github.com/vuejs/vitepress/issues/2529)

### Features

- **build:** allow using regex in rewrites ([f831767](https://github.com/vuejs/vitepress/commit/f831767764030c77cc79db4cc860e7d76afc1b6a))
- **client:** expose dataSymbol ([a547530](https://github.com/vuejs/vitepress/commit/a5475304faad7db037e19a9ffe4d6f48a816e6ed)), closes [#2489](https://github.com/vuejs/vitepress/issues/2489)

### BREAKING CHANGES

- reverts the breaking changes in beta-2. `defineConfig` and `defineConfigWithTheme` no longer accept functions as argument.

# [1.0.0-beta.2](https://github.com/vuejs/vitepress/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2023-06-11)

### Bug Fixes

- **build:** create markdown env for localSearchPlugin ([#2322](https://github.com/vuejs/vitepress/issues/2322)) ([c9a98ac](https://github.com/vuejs/vitepress/commit/c9a98ac6bb854a7a24c08cfc23e84ebc243ba347))
- **build:** use rimraf to handle temp folder deletion in windows ([#2483](https://github.com/vuejs/vitepress/issues/2483)) ([2f75769](https://github.com/vuejs/vitepress/commit/2f7576998587387ee32173b6de90f338fc7e85d3))
- **search:** detailed view not working when page contains script setup ([80e734d](https://github.com/vuejs/vitepress/commit/80e734d67763fea449647b7b21dfde0bde1c360b)), closes [#2485](https://github.com/vuejs/vitepress/issues/2485)
- **theme:** adjust z-index for active code group marker ([#2413](https://github.com/vuejs/vitepress/issues/2413)) ([06c0fc5](https://github.com/vuejs/vitepress/commit/06c0fc5d5cd55e03b4eee14feac67b749e7283ed))
- **theme:** properly show divider between navs ([#2481](https://github.com/vuejs/vitepress/issues/2481)) ([2bd55ec](https://github.com/vuejs/vitepress/commit/2bd55eca2e7d8384ac50c94b049310dc6173f849))
- **theme:** use brand color in skip link in dark theme ([#2431](https://github.com/vuejs/vitepress/issues/2431)) ([62d1110](https://github.com/vuejs/vitepress/commit/62d1110848e9b8944d920232bee185d8066194dd))
- **theme:** use document !== undefined check for browser ([#2417](https://github.com/vuejs/vitepress/issues/2417)) ([c869ea6](https://github.com/vuejs/vitepress/commit/c869ea64ae3c20aef60af1425b02e5797faa8d69))
- **types:** sync defineConfig types with vite ([b3ded34](https://github.com/vuejs/vitepress/commit/b3ded34d8a9ca7a9a82e9b0cf705a2ed6233e881))
- **types:** theme-without-fonts types for node ([#2416](https://github.com/vuejs/vitepress/issues/2416)) ([8e87c14](https://github.com/vuejs/vitepress/commit/8e87c14fba6a76d2dec8611f3d56c0c3a84accc0))

### Features

- **build:** support relative path for code snippet ([#1894](https://github.com/vuejs/vitepress/issues/1894)) ([90478b3](https://github.com/vuejs/vitepress/commit/90478b36cd4d161c2118a9e677384982805963b0))
- **cli:** add shortcut for restarting server ([#2403](https://github.com/vuejs/vitepress/issues/2403)) ([64b06db](https://github.com/vuejs/vitepress/commit/64b06db3ece7c4c2e73dd28c2f349f521afa390a))
- **theme:** add custom label for social links ([#2466](https://github.com/vuejs/vitepress/issues/2466)) ([c995b9f](https://github.com/vuejs/vitepress/commit/c995b9f61d90aa7671371373c5772ab59b516fc5))
- **theme:** add semantic markup to local search dialog ([#2325](https://github.com/vuejs/vitepress/issues/2325)) ([4ddb96f](https://github.com/vuejs/vitepress/commit/4ddb96fe508578893ee5a44621b5bac098bd4710))
- **theme:** allow prev/next links to be disabled globally ([#2317](https://github.com/vuejs/vitepress/issues/2317)) ([29a9647](https://github.com/vuejs/vitepress/commit/29a9647ee92efe8ea9a7c6698d5cacb22bf3e9ce))

### Performance Improvements

- parallelize mpa chunks copy ([#2389](https://github.com/vuejs/vitepress/issues/2389)) ([6d7d195](https://github.com/vuejs/vitepress/commit/6d7d195adcf354b94e2a69c330264a3106ed5955))
- **search:** use dom apis instead of regex-based section parsing ([#2486](https://github.com/vuejs/vitepress/issues/2486)) ([d62e6f6](https://github.com/vuejs/vitepress/commit/d62e6f6dd68e1ac31654e0da6102915a5a3709f0))
- **theme/search:** prevent repeated rendering of same page ([#2398](https://github.com/vuejs/vitepress/issues/2398)) ([e7be720](https://github.com/vuejs/vitepress/commit/e7be720ede403598dcec0a520ccc7bacf4e8b276))

### BREAKING CHANGES

- **types:** `defineConfig` and `defineConfigWithTheme` can now accept functions that return the config object. This might break typings in some third-party plugins that rely on the type of these functions.

# [1.0.0-beta.1](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.76...v1.0.0-beta.1) (2023-05-22)

### Bug Fixes

- **config:** set scrollOffset to 0 is not effect ([#2395](https://github.com/vuejs/vitepress/issues/2395)) ([8153f23](https://github.com/vuejs/vitepress/commit/8153f23c901a6200661813e65f0d8eb602ad46da))
- **theme:** make features section layout consistent ([#2382](https://github.com/vuejs/vitepress/issues/2382)) ([26f21d9](https://github.com/vuejs/vitepress/commit/26f21d95dfbd671477d425e6b8ac5b0172a846ac))
- **theme:** missing global properties in localSearch ([#2396](https://github.com/vuejs/vitepress/issues/2396)) ([4896811](https://github.com/vuejs/vitepress/commit/489681117f46a803704b6ec80546a5e787e19df2))
- **theme:** support custom target and rel in navbar links for mobile ([#2400](https://github.com/vuejs/vitepress/issues/2400)) ([f364a5d](https://github.com/vuejs/vitepress/commit/f364a5d1d3c066c9728beb5d07576d6cb4b0640d))

# [1.0.0-alpha.76](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.75...v1.0.0-alpha.76) (2023-05-18)

### Bug Fixes

- **a11y:** mobile and theme switcher ([#2354](https://github.com/vuejs/vitepress/issues/2354)) ([d6c0985](https://github.com/vuejs/vitepress/commit/d6c0985002ee792b1e8e052f71cdd6bd72c315ad))
- **build:** uniform handling of windows slash in localSearchPlugin ([#2358](https://github.com/vuejs/vitepress/issues/2358)) ([b31933f](https://github.com/vuejs/vitepress/commit/b31933fbdd7aabfe080234407153aefa8f6a3f30))
- hmr when `base` is set ([#2375](https://github.com/vuejs/vitepress/issues/2375)) ([484ff5d](https://github.com/vuejs/vitepress/commit/484ff5dd4bd2e5c2d5168437895d400a39f2bfa8))
- **theme:** don't update opacity on hover ([#2326](https://github.com/vuejs/vitepress/issues/2326)) ([35f8b89](https://github.com/vuejs/vitepress/commit/35f8b896372e75e62882df613a49e8945e7bc832))

### Features

- **cli:** add shortcuts ([#2353](https://github.com/vuejs/vitepress/issues/2353)) ([97065ce](https://github.com/vuejs/vitepress/commit/97065cefc22e4772c0295c5ad23a87eea286f46b))
- **theme:** add focus trap to local search dialog ([#2324](https://github.com/vuejs/vitepress/issues/2324)) ([2f482af](https://github.com/vuejs/vitepress/commit/2f482afaabdb4206b87e2453d0099257693c4653))
- **theme:** open search box on pressing slash too ([#2328](https://github.com/vuejs/vitepress/issues/2328)) ([c20bd28](https://github.com/vuejs/vitepress/commit/c20bd283319158135e2d850485970dfc5fe82812))

# [1.0.0-alpha.75](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.74...v1.0.0-alpha.75) (2023-04-30)

### Bug Fixes

- **build:** reset regex lastIndex before testing ([188893c](https://github.com/vuejs/vitepress/commit/188893c2c1569e332e8776581cfa40b4c5f1168e))
- **cli/init:** remove trailing slash from npm scripts ([64ecedc](https://github.com/vuejs/vitepress/commit/64ecedc73f3e7010de85381d946af1c95404820e))
- **theme:** hide local nav on home page ([f07587a](https://github.com/vuejs/vitepress/commit/f07587af8a51f92a5ec491e5789dd088e28067b5)), closes [#2312](https://github.com/vuejs/vitepress/issues/2312)
- **theme:** local search get 404 on build when use route rewrites in windows ([#2301](https://github.com/vuejs/vitepress/issues/2301)) ([494c634](https://github.com/vuejs/vitepress/commit/494c634eb1d77963e555a736fa057dcb23700989))
- **theme:** vitepress data not properly injected in app when use localSearch ([#2299](https://github.com/vuejs/vitepress/issues/2299)) ([69c7646](https://github.com/vuejs/vitepress/commit/69c7646dafe7a774e0717e032f697b008d9cf7aa))

### Features

- add `filePath` to `PageData` ([#2140](https://github.com/vuejs/vitepress/issues/2140)) ([b24acc6](https://github.com/vuejs/vitepress/commit/b24acc6991570aa054a99b8d3977b8b4d0255418))
- **build:** allow using `@` prefix with `@include` ([#2292](https://github.com/vuejs/vitepress/issues/2292)) ([a3b38d1](https://github.com/vuejs/vitepress/commit/a3b38d18824343fd5b571a7a9a5d2c4ccf29e8e1))
- preserve user log level ([#2310](https://github.com/vuejs/vitepress/issues/2310)) ([a647cd3](https://github.com/vuejs/vitepress/commit/a647cd384320101f6df31e03960dd2c40808c49c))
- **theme:** support light shiki themes ([#2319](https://github.com/vuejs/vitepress/issues/2319)) ([d0f0012](https://github.com/vuejs/vitepress/commit/d0f0012aea4cc71fb28f60f2dd649c23aae146b8))

### BREAKING CHANGES

- **theme:** Styling for code blocks might break, especially if you were earlier overriding it for light theme. Those workarounds are no longer required. VitePress will now show code blocks and groups in light mode too if a light shiki theme is specified.

# [1.0.0-alpha.74](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.73...v1.0.0-alpha.74) (2023-04-24)

### Bug Fixes

- **build:** allow data-loaders files in packages to be found (closes [#2272](https://github.com/vuejs/vitepress/issues/2272)) ([84cf457](https://github.com/vuejs/vitepress/commit/84cf45772ed59f5eae747c15fbffc375768007b8))
- **router:** scroll back to the hash anchor even if it is already selected ([#2265](https://github.com/vuejs/vitepress/issues/2265)) ([f3d3332](https://github.com/vuejs/vitepress/commit/f3d3332fff72d1df6f70c5893bfc90442b1776fb))

### Features

- allow using html in member description ([#2269](https://github.com/vuejs/vitepress/issues/2269)) ([f744364](https://github.com/vuejs/vitepress/commit/f7443643a4510a6c650f1a1bda977c1d55fddf64))
- **search:** support custom `disableQueryPersistence` in local search ([#2273](https://github.com/vuejs/vitepress/issues/2273)) ([2f0f2d5](https://github.com/vuejs/vitepress/commit/2f0f2d5ac6efcab22bdb452e5c0780e7cd8f1498))
- **theme:** mobile view show outline button after removing sidebar ([#2274](https://github.com/vuejs/vitepress/issues/2274)) ([25b9111](https://github.com/vuejs/vitepress/commit/25b9111222cbd3de008e18cac6554933d4db993e))

# [1.0.0-alpha.73](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.72...v1.0.0-alpha.73) (2023-04-20)

### Bug Fixes

- **search:** fix highlighting in detailed view ([1f4920c](https://github.com/vuejs/vitepress/commit/1f4920c60dc1be03444781539064be7b3ec9eb08))
- **search:** local search showDetailedList not working in windows ([#2253](https://github.com/vuejs/vitepress/issues/2253)) ([09be057](https://github.com/vuejs/vitepress/commit/09be057ffb767e55d3a86f1a3664ebd0690f2fc5))

### Features

- outline link add title attribute ([#2261](https://github.com/vuejs/vitepress/issues/2261)) ([1f5798e](https://github.com/vuejs/vitepress/commit/1f5798e43771ae1e13921a39319345c89bb2298a))

# [1.0.0-alpha.72](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.71...v1.0.0-alpha.72) (2023-04-17)

### Bug Fixes

- **search:** don't directly access userConfig ([3e0e9d2](https://github.com/vuejs/vitepress/commit/3e0e9d2b27c02e250c5b350bf83dce9b95e217a8))
- **search:** ready event is not fired on mac ([e37e5cb](https://github.com/vuejs/vitepress/commit/e37e5cb45a6c3507b906b9955897ce4e84adf500))
- **theme:** local search showDetailedList not working in windows ([#2248](https://github.com/vuejs/vitepress/issues/2248)) ([8354f8f](https://github.com/vuejs/vitepress/commit/8354f8fb8649d429b2cb525dd6f35127faba7ae6))

# [1.0.0-alpha.71](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.70...v1.0.0-alpha.71) (2023-04-16)

### Bug Fixes

- **search:** esm interop mark.js import ([1b0a249](https://github.com/vuejs/vitepress/commit/1b0a249ad66288ff56675e4db905959ff0079726))
- **search:** properly group nested headings ([b1c956c](https://github.com/vuejs/vitepress/commit/b1c956ce99505316842c157c76a4ec051eb7610b)), closes [#2238](https://github.com/vuejs/vitepress/issues/2238)

# [1.0.0-alpha.70](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.69...v1.0.0-alpha.70) (2023-04-16)

### Bug Fixes

- **a11y:** increase touch target size of search icons ([4449867](https://github.com/vuejs/vitepress/commit/44498675aca3271596b041881d44e1524d744df6))
- **search:** avoid body scroll when using local search ([#2236](https://github.com/vuejs/vitepress/issues/2236)) ([144a7d8](https://github.com/vuejs/vitepress/commit/144a7d8e4ee483475b6956090c267213a1e2f8e1))
- **search:** better highlighting in detailed view ([#2234](https://github.com/vuejs/vitepress/issues/2234)) ([be83524](https://github.com/vuejs/vitepress/commit/be8352441f8b9a8561961c69f3e1794370101de2))
- **search:** fix keyword highlighting and scrolling in excerpts ([ca8db8a](https://github.com/vuejs/vitepress/commit/ca8db8adca028bb982b819553b85ac19fe946e7e))
- **search:** remove double base on importing excepts ([185213c](https://github.com/vuejs/vitepress/commit/185213c6ba4416071025fbf3c5ca7fadf311fdbf)), closes [#2230](https://github.com/vuejs/vitepress/issues/2230)
- **search:** remove extra /index from routes ([9e04b43](https://github.com/vuejs/vitepress/commit/9e04b435671accfcaee795ec8ec2833d8aa358f8))
- **search:** show escape to close on footer ([6d5b4cd](https://github.com/vuejs/vitepress/commit/6d5b4cd784274786ad57cef378646320ba17faf1))

### Features

- **search:** allow force disabling detailed view ([40f1d1b](https://github.com/vuejs/vitepress/commit/40f1d1b6f6f2f6c43fd0d9bcf4b6bc1174ce4831))
- **search:** make styling more configurable, align more with the theme ([#2233](https://github.com/vuejs/vitepress/issues/2233)) ([b2077c7](https://github.com/vuejs/vitepress/commit/b2077c70250d5c390d69ce31111a1c44769dbc78))

# [1.0.0-alpha.69](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.68...v1.0.0-alpha.69) (2023-04-15)

### Bug Fixes

- **search:** fix errors on empty titles ([6d363ec](https://github.com/vuejs/vitepress/commit/6d363ec9ffd6b27e1c77e5aab853471c6883c7bd))
- **theme:** fix color of blockquote in custom containers ([#2173](https://github.com/vuejs/vitepress/issues/2173)) ([712a57f](https://github.com/vuejs/vitepress/commit/712a57fde74daa27f69319861d95f9dec6bc05ad))

# [1.0.0-alpha.68](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.67...v1.0.0-alpha.68) (2023-04-15)

### Bug Fixes

- **theme:** fix top of scrollbar being unusable ([#2224](https://github.com/vuejs/vitepress/issues/2224)) ([7178a22](https://github.com/vuejs/vitepress/commit/7178a22c9d317245e5167abf80f7081fbf87e78a))

# [1.0.0-alpha.67](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.66...v1.0.0-alpha.67) (2023-04-15)

### Bug Fixes

- **search:** avoid double base ([25a1fe9](https://github.com/vuejs/vitepress/commit/25a1fe90bddd021a1ce5e068d8cad455687647bf))
- **theme:** navbar style ([#2202](https://github.com/vuejs/vitepress/issues/2202)) ([8ee6b90](https://github.com/vuejs/vitepress/commit/8ee6b905f5243a036c2dee7688539ef33e164f09))

### Features

- allow passing props and children/slots to defineClientComponent ([#2198](https://github.com/vuejs/vitepress/issues/2198)) ([4c24960](https://github.com/vuejs/vitepress/commit/4c2496043394d9b14376e74a5bf11ccea5e6e7d7))

# [1.0.0-alpha.66](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.65...v1.0.0-alpha.66) (2023-04-15)

### Bug Fixes

- **search:** properly resolve page link ([609d447](https://github.com/vuejs/vitepress/commit/609d447ab50b2b8fb78a174e7d5aa0ff52411b0e))
- **theme:** fix meta key not showing on search button ([e295160](https://github.com/vuejs/vitepress/commit/e2951604fd61336df9559ea16972d3ea76a49894))

### Features

- offline search ([#2110](https://github.com/vuejs/vitepress/issues/2110)) ([6c92675](https://github.com/vuejs/vitepress/commit/6c92675e33d3276a02b790a34083a68093b58c7f))

# [1.0.0-alpha.65](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.64...v1.0.0-alpha.65) (2023-04-04)

### Bug Fixes

- **build:** remove extra line at end of code blocks ([#2191](https://github.com/vuejs/vitepress/issues/2191)) ([a681fd1](https://github.com/vuejs/vitepress/commit/a681fd11e32709367d673cf0d9d26e4288f27776))

# [1.0.0-alpha.64](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.63...v1.0.0-alpha.64) (2023-03-29)

### Bug Fixes

- **build:** make `lastUpdated` work with git submodules ([#2149](https://github.com/vuejs/vitepress/issues/2149)) ([4c23003](https://github.com/vuejs/vitepress/commit/4c2300318952bfdaabd766a6f16f26419ee854da))
- **theme:** fix color of table head row in custom containers ([#2160](https://github.com/vuejs/vitepress/issues/2160)) ([51ecd58](https://github.com/vuejs/vitepress/commit/51ecd580a29d9e2bea73d4d5897154954d750d9f))
- **theme:** hide outline dropdown scrollbar when it does not overflow ([#2151](https://github.com/vuejs/vitepress/issues/2151)) ([ff26ff1](https://github.com/vuejs/vitepress/commit/ff26ff1e6683def53bfbe6cbd7656740c77f4bcc))

### Features

- **build:** provide `siteConfig` in `transformPageData` context ([#2163](https://github.com/vuejs/vitepress/issues/2163)) ([3714741](https://github.com/vuejs/vitepress/commit/3714741b409f4e5f8df4cc42c7b59b065c8cc6f6))
- **theme:** add `page-top/bottom` and `doc-top/bottom` slots ([#2139](https://github.com/vuejs/vitepress/issues/2139)) ([53d0099](https://github.com/vuejs/vitepress/commit/53d0099ffa99582f552d7dff5676734c965ceb05))
- **theme:** allow moving aside to left ([#2138](https://github.com/vuejs/vitepress/issues/2138)) ([9e3cf0f](https://github.com/vuejs/vitepress/commit/9e3cf0fa7d2c2589d129ef931457ab40f513d187))

# [1.0.0-alpha.63](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.62...v1.0.0-alpha.63) (2023-03-26)

### Bug Fixes

- **theme:** allow adding html as feature icons ([e5bc1e1](https://github.com/vuejs/vitepress/commit/e5bc1e10862a765f6790f5f08aa2bd76bb258532))
- **theme:** remove label background of code-group tabs ([#2136](https://github.com/vuejs/vitepress/issues/2136)) ([eac03f2](https://github.com/vuejs/vitepress/commit/eac03f26e2d3ab47158ac2528210e95460f6c302))

### Features

- more flexible `ignoreDeadLinks` ([#2135](https://github.com/vuejs/vitepress/issues/2135)) ([3235c23](https://github.com/vuejs/vitepress/commit/3235c23313d81f8f95b91779a48db839c02aa952))

# [1.0.0-alpha.62](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.61...v1.0.0-alpha.62) (2023-03-25)

### Bug Fixes

- make md includes work with rewrites ([#1898](https://github.com/vuejs/vitepress/issues/1898)) ([3553f01](https://github.com/vuejs/vitepress/commit/3553f015a9138cb935d57487755d9d5717f79ae3))
- **theme:** don't show outline when no header is there ([#2117](https://github.com/vuejs/vitepress/issues/2117)) ([42a0ef2](https://github.com/vuejs/vitepress/commit/42a0ef21c17da20c8f22565807578a05a0461df6))
- **theme:** fix aside position when footer is there ([#2115](https://github.com/vuejs/vitepress/issues/2115)) ([aecdeb9](https://github.com/vuejs/vitepress/commit/aecdeb9b216803f407fe3b48574bf7664262ef01))
- **theme:** properly align not found icon in algolia ([#2116](https://github.com/vuejs/vitepress/issues/2116)) ([83ce1b8](https://github.com/vuejs/vitepress/commit/83ce1b8c5e95d2e29e733d9312f514d725fe7f0b))
- **theme:** use locale lang instead of navigator lang for last updated ([#2118](https://github.com/vuejs/vitepress/issues/2118)) ([56a7d9a](https://github.com/vuejs/vitepress/commit/56a7d9aa74bbb1d945c6ca3a3573b5e49ba3ca65))

# [1.0.0-alpha.61](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.60...v1.0.0-alpha.61) (2023-03-20)

### Bug Fixes

- **build:** skip warning for `txt` language ([#2109](https://github.com/vuejs/vitepress/issues/2109)) ([ac953ce](https://github.com/vuejs/vitepress/commit/ac953ce8bdeecb2854257613c849b82d38a91846))
- decode when query selecting current hash ([1f2f1ff](https://github.com/vuejs/vitepress/commit/1f2f1ff43dbb3c1598810fe04608678426e4fed5)), closes [#2089](https://github.com/vuejs/vitepress/issues/2089)
- **theme:** prevent code-groups conflict with shiki-twoslash ([#2059](https://github.com/vuejs/vitepress/issues/2059)) ([ee6cda4](https://github.com/vuejs/vitepress/commit/ee6cda42d8631c5f1f6ef47ac1aec0b178a6cbf2))

# [1.0.0-alpha.60](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.59...v1.0.0-alpha.60) (2023-03-15)

### Features

- support multiple selectors for scrollOffset ([86e2a6f](https://github.com/vuejs/vitepress/commit/86e2a6f97287c0999090d5af0e8362f3e48884db))
- **theme:** add animation to mobile page outline dropdown ([a6b18a8](https://github.com/vuejs/vitepress/commit/a6b18a8b9aba706aa3a567ee7b2564437a0850aa))

# [1.0.0-alpha.59](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.58...v1.0.0-alpha.59) (2023-03-15)

### Bug Fixes

- handle async enhanceApp when extending themes ([52b04f3](https://github.com/vuejs/vitepress/commit/52b04f324cc3a675ed87353d516a6302d282ccfb))
- **theme:** improve Chinese font handling ([81ae1c7](https://github.com/vuejs/vitepress/commit/81ae1c79cd1c0c9c31f48100f131715efc68efbd)), closes [#2036](https://github.com/vuejs/vitepress/issues/2036)
- **theme:** move doc-footer-before slot into the footer ([b0160bc](https://github.com/vuejs/vitepress/commit/b0160bc2619b50e3bca2bf1bba60d68708a39145)), closes [#2082](https://github.com/vuejs/vitepress/issues/2082)

### Features

- defineClientComponent helper ([2ad668c](https://github.com/vuejs/vitepress/commit/2ad668cd54174b37a8c68b389a5e31e0aae60828))

# [1.0.0-alpha.58](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.57...v1.0.0-alpha.58) (2023-03-14)

### Bug Fixes

- fix optional component imports from default theme ([7b0f289](https://github.com/vuejs/vitepress/commit/7b0f28915fc15e155fbb27d5153e25d004bdc294))

# [1.0.0-alpha.57](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.56...v1.0.0-alpha.57) (2023-03-14)

### Bug Fixes

- **types:** allow void return in transformHead hook ([32dfaf5](https://github.com/vuejs/vitepress/commit/32dfaf5adc9db5e87995c67a7060169cbf835b09))

### Features

- expose page and assets on build hooks TransformContext ([468c049](https://github.com/vuejs/vitepress/commit/468c049ccd7648144761def11c88ebf70c0d4226))
- **theme:** a11y improvements ([3b6a6d1](https://github.com/vuejs/vitepress/commit/3b6a6d1abdc42437d9e659ef598db1d93695db21))
- **theme:** aria-label for social links ([6ca34c4](https://github.com/vuejs/vitepress/commit/6ca34c4236c076fb40fb0b4fb01c1f9783e2210c))
- **theme:** page outline for mobile ([7182c42](https://github.com/vuejs/vitepress/commit/7182c4231f3c435f1471dfecacdce99d48270978))
- **theme:** support extending default theme without importing fonts ([da1691d](https://github.com/vuejs/vitepress/commit/da1691d77e371892cbe566ba45ca24f1fa03dc7c))
- **theme:** use more accessible header anchors [#2040](https://github.com/vuejs/vitepress/pull/2040)

### Performance Improvements

- **theme:** preload font ([24735db](https://github.com/vuejs/vitepress/commit/24735dbcde15be41bc2697a4ea44001a1a583511))

### BREAKING CHANGES

- `markdown.headers` is now disabled by default. This means `PageData` will no longer include extracted headers by default unless this option is explicitly enabled. This is because the default theme now extracts page headers at runtime, so the data is no longer needed by default.

# [1.0.0-alpha.56](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.55...v1.0.0-alpha.56) (2023-03-13)

### Bug Fixes

- do not include head tags in inlined site data ([2f26693](https://github.com/vuejs/vitepress/commit/2f26693a1d78f24d5a62a9b988c457e7c299fc5c))

# [1.0.0-alpha.55](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.54...v1.0.0-alpha.55) (2023-03-13)

### Bug Fixes

- fix scroll to hash on new tab during dev ([9aafc88](https://github.com/vuejs/vitepress/commit/9aafc88d5951684b9b583a7a164840a9b87467b0)), closes [#653](https://github.com/vuejs/vitepress/issues/653)
- gracefully handle config update with syntax error ([470ce3d](https://github.com/vuejs/vitepress/commit/470ce3d3f3272639288cb888dc89d37f041df104)), closes [#2041](https://github.com/vuejs/vitepress/issues/2041)

### Performance Improvements

- inline site data on page ([22ace7b](https://github.com/vuejs/vitepress/commit/22ace7b075276c340d0ae2a1f260d119e82c6470))
- kickoff main chunk fetch earlier in browsers without modulepreload support ([d64a76e](https://github.com/vuejs/vitepress/commit/d64a76eb366a270c56189096a5e0ae6b8ae23ea7))

# [1.0.0-alpha.54](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.53...v1.0.0-alpha.54) (2023-03-13)

### Bug Fixes

- fix chunking logic that causes breakage ([bed202d](https://github.com/vuejs/vitepress/commit/bed202dbcc8f3954c12aaef993369b29ff47211e)), closes [#2072](https://github.com/vuejs/vitepress/issues/2072) [#2073](https://github.com/vuejs/vitepress/issues/2073) [#2074](https://github.com/vuejs/vitepress/issues/2074) [#2075](https://github.com/vuejs/vitepress/issues/2075)

# [1.0.0-alpha.53](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.52...v1.0.0-alpha.53) (2023-03-13)

### Bug Fixes

- avoid circular dependency between siteData virtual module and useData() ([905f58b](https://github.com/vuejs/vitepress/commit/905f58b2a80cd1dd37b645dddde3d54b02cd60d4)), closes [#2072](https://github.com/vuejs/vitepress/issues/2072) [#2073](https://github.com/vuejs/vitepress/issues/2073) [#2074](https://github.com/vuejs/vitepress/issues/2074)

### Features

- createContentLoader ([d2838e3](https://github.com/vuejs/vitepress/commit/d2838e3755a8ef5861d1a921a336dfebc6156634))
- **theme:** editLink can accept function ([#2058](https://github.com/vuejs/vitepress/issues/2058)) ([192708d](https://github.com/vuejs/vitepress/commit/192708de678115116f3477293742c155b8f48e5d))

# [1.0.0-alpha.52](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.51...v1.0.0-alpha.52) (2023-03-11)

### Bug Fixes

- fix line higlighting for empty lines ([9708510](https://github.com/vuejs/vitepress/commit/9708510cbd893f02916c95fabad5a8f07d52dbaf))
- fix rewrites with non ascii chars ([6ce88da](https://github.com/vuejs/vitepress/commit/6ce88da3baa4bc9e6b8dc3254180ed995766c7ec)), closes [#2017](https://github.com/vuejs/vitepress/issues/2017)
- fix same page hash links with encoded chars ([e05a3f2](https://github.com/vuejs/vitepress/commit/e05a3f2b5aff54ec7e5211c1021c16814eb57e58)), closes [#1749](https://github.com/vuejs/vitepress/issues/1749)
- properly serialize header in outline ([8ab36d0](https://github.com/vuejs/vitepress/commit/8ab36d05fa4aa8b3707c1f89efc1c820ffaf9669))
- remove @vue/devtools from force include ([9bd940f](https://github.com/vuejs/vitepress/commit/9bd940f22cae0ec88dc1670a31fb9ebc015e1f92))
- respect user vue alias ([63f33d2](https://github.com/vuejs/vitepress/commit/63f33d2895d21c08903eb4d625c13d8d3721d861)), closes [#1065](https://github.com/vuejs/vitepress/issues/1065)
- **theme:** re-support dynamic headers ([657a7d3](https://github.com/vuejs/vitepress/commit/657a7d38df3c9022a7ef6977fd71a6bde6571cfc))
- trim spaces from outline headers ([9ceff1d](https://github.com/vuejs/vitepress/commit/9ceff1d587f6b61529806c5eb705fc417b685ad9))

### Features

- allow disabling markdown.headers ([868a9ff](https://github.com/vuejs/vitepress/commit/868a9ff81ea445556bc7500dfe4210d253da9ceb))

### Performance Improvements

- improve default theme chunking ([f6cb4c0](https://github.com/vuejs/vitepress/commit/f6cb4c0d44108116c91b28a3fcde820093d94340))

### BREAKING CHANGES

- default theme config option `outlineBadge` has been
  removed. Badges in headers are now always excluded when generating
  outline text.

# [1.0.0-alpha.51](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.50...v1.0.0-alpha.51) (2023-03-09)

### Bug Fixes

- **theme:** align number to code line ([#2044](https://github.com/vuejs/vitepress/issues/2044)) ([27e3adf](https://github.com/vuejs/vitepress/commit/27e3adf8ed888f03466fec2e10bc7589b0d010e8))
- **theme:** remove log in VPContent ([747a04d](https://github.com/vuejs/vitepress/commit/747a04d3416a4014e46e41ebfdc734643268bc29))

### Features

- **theme:** add not-found layout slot ([#2054](https://github.com/vuejs/vitepress/issues/2054)) ([41987b6](https://github.com/vuejs/vitepress/commit/41987b6a880d99e78e48ae3b4a2e6b815e183348))

### Performance Improvements

- **a11y:** add aria-label to language button ([#2025](https://github.com/vuejs/vitepress/issues/2025)) ([322c633](https://github.com/vuejs/vitepress/commit/322c633fd0df15b2dfae62b54479d7cdb3255155))

# [1.0.0-alpha.50](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.49...v1.0.0-alpha.50) (2023-03-07)

### Bug Fixes

- avoid deprecation warning when using --force ([0c0b6cc](https://github.com/vuejs/vitepress/commit/0c0b6cc5a3a06bb0bee14dc854c7c1102a1b6657))
- ensure HMR works properly for page outline ([1457681](https://github.com/vuejs/vitepress/commit/1457681484c873a7801729f9a9e11872b60b4868)), closes [#1281](https://github.com/vuejs/vitepress/issues/1281)
- extract all headers by default ([580a8e1](https://github.com/vuejs/vitepress/commit/580a8e1a551089e973745fd224d97aec9d3fa702))
- respect command line minify and outDir options ([22047f3](https://github.com/vuejs/vitepress/commit/22047f3363af290687cb3077ff617ae550af6e8a))
- **theme:** make tip box text color darker ([3158115](https://github.com/vuejs/vitepress/commit/3158115afc8f15bee3e35644a33328b02dee6d6d))
- **theme:** prevent text wrapping in nav dropdown menu ([2a1abbe](https://github.com/vuejs/vitepress/commit/2a1abbe45e10b38f03795357cd52dc4f6cea5dfc))

### Features

- **data-loader:** defineLoader() type helper ([4673bb1](https://github.com/vuejs/vitepress/commit/4673bb187905374896b7a1a3b1a1e5ad3777bdc4))
- **data-loader:** pass watched files into load() ([e29b6a0](https://github.com/vuejs/vitepress/commit/e29b6a051e89e23945e2acfdfca7057978929715))
- deprecate Theme.setup ([868a586](https://github.com/vuejs/vitepress/commit/868a58670e747310bba1f0f900a76243c6473da3))
- export loadEnv from vite ([7609704](https://github.com/vuejs/vitepress/commit/76097048f3570b3f2417ac76ef177ce16afb9116))
- expose isNotFound on PageData, deperecate Theme.NotFound ([74caccd](https://github.com/vuejs/vitepress/commit/74caccda4342feee3ab980b1a446ef7ec4819e0f))
- expose params at top level in useData() ([66f94fd](https://github.com/vuejs/vitepress/commit/66f94fd7a0f43882386d32769b6b98014154ffa6))
- support $params in page components ([a4ac055](https://github.com/vuejs/vitepress/commit/a4ac055dbf42848206683611a8d15e09572441ac))
- support Theme.extends ([f39b6a9](https://github.com/vuejs/vitepress/commit/f39b6a98d6d2cc9ba405204a4d7a91eadce64a0d))
- **theme:** add `as` prop to `Content` ([#2011](https://github.com/vuejs/vitepress/issues/2011)) ([254e15b](https://github.com/vuejs/vitepress/commit/254e15beb9b895c081e301eb379cbc2551b3e53c))
- **theme:** add `home-hero-info` slot ([#1807](https://github.com/vuejs/vitepress/issues/1807)) ([996a5f4](https://github.com/vuejs/vitepress/commit/996a5f47e9064da839aef9e81db22db70fa8d76d))
- vitepress init command ([#2020](https://github.com/vuejs/vitepress/issues/2020)) ([38bbdad](https://github.com/vuejs/vitepress/commit/38bbdaddb72ec426865d731c2f443e545e5bbbd7)), closes [#1252](https://github.com/vuejs/vitepress/issues/1252)

# [1.0.0-alpha.49](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.48...v1.0.0-alpha.49) (2023-02-28)

### Bug Fixes

- disable fuzzy link recognition by default ([2450710](https://github.com/vuejs/vitepress/commit/24507105b18362210632543b8a72893832b5940a))
- dyamic routes w/ srcDir + relative imports ([b075ee5](https://github.com/vuejs/vitepress/commit/b075ee5be6785e671b19ded066c22a1d506ec508))
- hmr on deps change of data loaders ([5913ebc](https://github.com/vuejs/vitepress/commit/5913ebc34f810e84b4ad482aa835e1a4e8beb404))
- normalize all paths in config ([8e8fcd9](https://github.com/vuejs/vitepress/commit/8e8fcd9caa4194787c5fc81ad10d17cf82638b8f))
- **theme:** "copy code" button not readable on hover state ([#819](https://github.com/vuejs/vitepress/issues/819)) ([#1892](https://github.com/vuejs/vitepress/issues/1892)) ([#1998](https://github.com/vuejs/vitepress/issues/1998)) ([c2de4ca](https://github.com/vuejs/vitepress/commit/c2de4caa345bdeda5252a8fc00cfcdbcc18d5d2d))
- **theme:** tip custom container has wrong bg color for `<code>` block ([d9a2e6e](https://github.com/vuejs/vitepress/commit/d9a2e6e8978f614d70f347be81b9b3b9df03d7a1))
- update route configs on file add / delete ([bccce98](https://github.com/vuejs/vitepress/commit/bccce98c62d1ea405c55a6f72bab6f2ce27e2e65))

### Features

- dynamic routes ([24fa862](https://github.com/vuejs/vitepress/commit/24fa862c39d1b5c2ea6da6faf08cfe95e07f5d2f))
- **theme:** enhance readability of custom containers ([#1824](https://github.com/vuejs/vitepress/issues/1824)) ([#1989](https://github.com/vuejs/vitepress/issues/1989)) ([472b6ec](https://github.com/vuejs/vitepress/commit/472b6ecf5e404bccc751bcf93b868ac30f43f22b))

# [1.0.0-alpha.48](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.47...v1.0.0-alpha.48) (2023-02-26)

### Bug Fixes

- **compat:** remove use of array.at ([fd99590](https://github.com/vuejs/vitepress/commit/fd995906f61e5181ca8e1116dcd93eec65075056))
- **theme:** add height constraints to hero image ([#1983](https://github.com/vuejs/vitepress/issues/1983)) ([803d5b6](https://github.com/vuejs/vitepress/commit/803d5b6d663b5293c70672ca5526a33f454e4a17))
- **theme:** allow empty details in home feature ([#1936](https://github.com/vuejs/vitepress/issues/1936)) ([#1963](https://github.com/vuejs/vitepress/issues/1963)) ([b56351c](https://github.com/vuejs/vitepress/commit/b56351c7785b7a3a3413dcf24d7ac63c1f40fd2b))
- **theme:** show external link icon in navbar ([#1881](https://github.com/vuejs/vitepress/issues/1881)) ([8e6e8d9](https://github.com/vuejs/vitepress/commit/8e6e8d9af534e124cb16552686b460e19d0f894f)), closes [#1948](https://github.com/vuejs/vitepress/issues/1948)
- **theme:** show external link icon on same line ([#1880](https://github.com/vuejs/vitepress/issues/1880)) ([6218b10](https://github.com/vuejs/vitepress/commit/6218b108bc78aed0ec1afd3d1cf4182e611eed90))

### Features

- **build:** add support for custom languages ([#1837](https://github.com/vuejs/vitepress/issues/1837)) ([5a6d384](https://github.com/vuejs/vitepress/commit/5a6d3849527ee1dfd9f4299f5350cfa7641effb7))
- **theme:** make prev/next links changeable ([#1972](https://github.com/vuejs/vitepress/issues/1972)) ([b8a5e8e](https://github.com/vuejs/vitepress/commit/b8a5e8e5b24b025c9a5e4850b72296f726ae71e5))
- **theme:** support custom target and rel in navbar links ([#1993](https://github.com/vuejs/vitepress/issues/1993)) ([e2d4edf](https://github.com/vuejs/vitepress/commit/e2d4edf45b5ec890c088d3b0517b21a7b3eab9df))

# [1.0.0-alpha.47](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.46...v1.0.0-alpha.47) (2023-02-20)

### Bug Fixes

- **build:** show error stack in logs ([#1960](https://github.com/vuejs/vitepress/issues/1960)) ([c4d8d72](https://github.com/vuejs/vitepress/commit/c4d8d7225c2d8dd75f1640730e8d1425097e3aa3))
- custom titles of code snippets inside code groups ([#1834](https://github.com/vuejs/vitepress/issues/1834)) ([bcb8cbf](https://github.com/vuejs/vitepress/commit/bcb8cbf3c839dc17c1eaee7e39edb3ecca236a27))
- **types:** augment vite user config ([#1946](https://github.com/vuejs/vitepress/issues/1946)) ([5c9b75e](https://github.com/vuejs/vitepress/commit/5c9b75e325c27f63373c969e16035a9df5292cc9))

### Reverts

- "docs: add linkage for `code-groups` in `getting-started`" ([#1943](https://github.com/vuejs/vitepress/issues/1943)) ([ed90724](https://github.com/vuejs/vitepress/commit/ed90724022359358de582a3c00e86f381d57eeba)), closes [#1906](https://github.com/vuejs/vitepress/issues/1906)

# [1.0.0-alpha.46](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.45...v1.0.0-alpha.46) (2023-02-12)

### Bug Fixes

- **build:** prepend base to all internal non-relative links ([#1908](https://github.com/vuejs/vitepress/issues/1908)) ([dcf2941](https://github.com/vuejs/vitepress/commit/dcf29419f24bfb0fe99e424771be931bf77b9961))
- **theme-default:** avoid preconnect without algolia ([#1902](https://github.com/vuejs/vitepress/issues/1902)) ([616fe5b](https://github.com/vuejs/vitepress/commit/616fe5b636050caa338cabede3794e658baa0ed6))
- **theme-default:** remove duplicate judgments in `preconnect()` ([#1903](https://github.com/vuejs/vitepress/issues/1903)) ([48c9b11](https://github.com/vuejs/vitepress/commit/48c9b113161823133276198ebeb15131b83a7a75))
- **theme:** make features support line wrapping ([#1913](https://github.com/vuejs/vitepress/issues/1913)) ([ea43076](https://github.com/vuejs/vitepress/commit/ea430760f507e3ba381c4ab01ec89a2111f35e8c))

### Features

- **build:** use vite logger ([#1899](https://github.com/vuejs/vitepress/issues/1899)) ([a00bb62](https://github.com/vuejs/vitepress/commit/a00bb621439b2571b3d33da6aa67c74ecd13d3c6))
- **shiki:** support `ansi` code highlight ([#1878](https://github.com/vuejs/vitepress/issues/1878)) ([f974381](https://github.com/vuejs/vitepress/commit/f9743816a55503c387b9c71793a92eb38817650d))
- **theme:** support disabling aside globally ([#1925](https://github.com/vuejs/vitepress/issues/1925)) ([dd0c4c6](https://github.com/vuejs/vitepress/commit/dd0c4c698c26d3e249d353c3baff568a8f406e8f))

### BREAKING CHANGES

- **build:** `base` is now prepended to all internal (non-relative) links, including any reference to a file present in the public directory. If you want the earlier behavior for such links, use absolute links.

# [1.0.0-alpha.45](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.44...v1.0.0-alpha.45) (2023-01-31)

### Bug Fixes

- safari use `window.requestIdleCallback` ([#1871](https://github.com/vuejs/vitepress/issues/1871)) ([507b193](https://github.com/vuejs/vitepress/commit/507b193ef0e09afe667fccbf6de256cbc86de53f))

# [1.0.0-alpha.44](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.43...v1.0.0-alpha.44) (2023-01-31)

### Bug Fixes

- take `<a>` in SVG into account ([#1850](https://github.com/vuejs/vitepress/issues/1850)) ([010b3e5](https://github.com/vuejs/vitepress/commit/010b3e5ad99f5e61fd01e27d0c3144896a8f3d86))
- **theme:** infer collapsible from collapsed ([#1865](https://github.com/vuejs/vitepress/issues/1865)) ([dea6cfa](https://github.com/vuejs/vitepress/commit/dea6cfa9cbccf4c6433295e80571acee9b260f71))

### Features

- **theme:** preconnect algolia when idle ([#1851](https://github.com/vuejs/vitepress/issues/1851)) ([1f77577](https://github.com/vuejs/vitepress/commit/1f775774da7ef51ae8e690bbd86f94c739611a65))

### BREAKING CHANGES

- **theme:** `collapsible` is dropped from sidebar, use `collapsed` instead

# [1.0.0-alpha.43](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.42...v1.0.0-alpha.43) (2023-01-29)

### Bug Fixes

- **build:** hmr with rewrites when base is set ([a05956f](https://github.com/vuejs/vitepress/commit/a05956f38a5295cf038ecfc762c044dbc1cdf040))

# [1.0.0-alpha.42](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.41...v1.0.0-alpha.42) (2023-01-29)

### Bug Fixes

- **build:** consider base when checking actual pathname ([#1858](https://github.com/vuejs/vitepress/issues/1858)) ([cf8ad1a](https://github.com/vuejs/vitepress/commit/cf8ad1a29133cc373a1a70720d36e02b38ba6898))

# [1.0.0-alpha.41](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.40...v1.0.0-alpha.41) (2023-01-28)

### Bug Fixes

- check document instead of window to detect browser ([#1833](https://github.com/vuejs/vitepress/issues/1833)) ([0f145cb](https://github.com/vuejs/vitepress/commit/0f145cb3c6568760199a9c8eee785aecaf0e0494))
- **router:** avoid duplicate history entries ([#1827](https://github.com/vuejs/vitepress/issues/1827)) ([1553dbc](https://github.com/vuejs/vitepress/commit/1553dbce8eac9ed4a65312d4590d6b0f9261135c))
- **theme:** don't show border on navbar when sidebar is there ([#1845](https://github.com/vuejs/vitepress/issues/1845)) ([3db532e](https://github.com/vuejs/vitepress/commit/3db532ed0999c9bddfd6bc90f6b627ae1b9178af))

### Features

- **build:** allow ignoring only localhost dead links ([#1821](https://github.com/vuejs/vitepress/issues/1821)) ([fe52fa3](https://github.com/vuejs/vitepress/commit/fe52fa34201dcfa87ac4886fe285331f0ef89ba8))
- **build:** expose vitepress site config to vite plugins ([#1822](https://github.com/vuejs/vitepress/issues/1822)) ([05430e4](https://github.com/vuejs/vitepress/commit/05430e45c90562b62796caba28c633070934d85f))
- **build:** support rewrites ([#1798](https://github.com/vuejs/vitepress/issues/1798)) ([00abac6](https://github.com/vuejs/vitepress/commit/00abac611664e12710e5152d0259390b22c0e8ca))
- stable `cleanUrls` ([#1852](https://github.com/vuejs/vitepress/issues/1852)) ([5ae4fbd](https://github.com/vuejs/vitepress/commit/5ae4fbde3843236e180e63e2cd2b7021efa0fad4))
- **theme:** allow removing badge text from outline ([#1825](https://github.com/vuejs/vitepress/issues/1825)) ([5d2fc3f](https://github.com/vuejs/vitepress/commit/5d2fc3f9228c9b26dec26264d0951d0f43b3d90d))
- **theme:** enable multi level sidebar nesting ([#1360](https://github.com/vuejs/vitepress/issues/1360)) ([#1835](https://github.com/vuejs/vitepress/issues/1835)) ([c35a1f0](https://github.com/vuejs/vitepress/commit/c35a1f0faee3702c0494fb22043ce058e7a2954c)), closes [#1361](https://github.com/vuejs/vitepress/issues/1361) [#1680](https://github.com/vuejs/vitepress/issues/1680)

# [1.0.0-alpha.40](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.39...v1.0.0-alpha.40) (2023-01-20)

### Bug Fixes

- **theme:** nav bg not being applied on some viewport ([39294e0](https://github.com/vuejs/vitepress/commit/39294e0a4ec53b245da4344187de842d0044dac8))

# [1.0.0-alpha.39](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.38...v1.0.0-alpha.39) (2023-01-20)

### Bug Fixes

- **theme:** adjust the position of the curtain to avoid block sidebar ([#1816](https://github.com/vuejs/vitepress/issues/1816)) ([48f0b01](https://github.com/vuejs/vitepress/commit/48f0b015694c17767180eb2f75e9eb12c3f2a358))
- **theme:** sidebar scrollbar is cropped by nav bar ([bd36224](https://github.com/vuejs/vitepress/commit/bd36224b45ee832765afcf4a57c211d362e4e6af))

# [1.0.0-alpha.38](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.37...v1.0.0-alpha.38) (2023-01-17)

### Bug Fixes

- **theme:** spacing between aside sponsors and ads section is missing ([5c2eb1b](https://github.com/vuejs/vitepress/commit/5c2eb1b3b0988ae98639543e60a740d6b40a17a5))

# [1.0.0-alpha.37](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.36...v1.0.0-alpha.37) (2023-01-17)

### Bug Fixes

- **build:** don't warn on blank lang in fences ([99ad162](https://github.com/vuejs/vitepress/commit/99ad162fb7b11ac80c787131714c9c8bf66fa8c7))
- **theme:** prevent vertical scrollbar on code group tabs ([#1793](https://github.com/vuejs/vitepress/issues/1793)) ([#1805](https://github.com/vuejs/vitepress/issues/1805)) ([4314b57](https://github.com/vuejs/vitepress/commit/4314b5795918ceaa798dee550b79ff2e8a686b26))

### Features

- add i18n feature ([#1339](https://github.com/vuejs/vitepress/issues/1339)) ([8de2f44](https://github.com/vuejs/vitepress/commit/8de2f4499d9364d85e6070ce4b94651a1902b101)), closes [#291](https://github.com/vuejs/vitepress/issues/291) [#628](https://github.com/vuejs/vitepress/issues/628) [#631](https://github.com/vuejs/vitepress/issues/631) [#902](https://github.com/vuejs/vitepress/issues/902) [#955](https://github.com/vuejs/vitepress/issues/955) [#1253](https://github.com/vuejs/vitepress/issues/1253) [#1381](https://github.com/vuejs/vitepress/issues/1381)
- support for teleports to body ([#1642](https://github.com/vuejs/vitepress/issues/1642)) ([09c2c52](https://github.com/vuejs/vitepress/commit/09c2c52d6c027f6e30fac33c2d11246a4a530c24))
- **build:** don't hard fail on unknown languages in fences ([#1750](https://github.com/vuejs/vitepress/issues/1750)) ([1ae0596](https://github.com/vuejs/vitepress/commit/1ae05969396ef1651af56c66696ed77f8c4e7e85))
- **theme:** refine overall styles ([#1049](https://github.com/vuejs/vitepress/issues/1049)) ([#1790](https://github.com/vuejs/vitepress/issues/1790)) ([471f00a](https://github.com/vuejs/vitepress/commit/471f00a68d1e3d8d925ab996f462adaf4f1261a0))

# [1.0.0-alpha.36](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.35...v1.0.0-alpha.36) (2023-01-11)

### Bug Fixes

- **build:** handle cleanUrls without trailing slash ([#1772](https://github.com/vuejs/vitepress/issues/1772)) ([2a80fbd](https://github.com/vuejs/vitepress/commit/2a80fbd14ae124eddb05deca71ebffa50de4c2ce))
- **theme:** `activeMatch` support regexp ([#1754](https://github.com/vuejs/vitepress/issues/1754)) ([0913e0f](https://github.com/vuejs/vitepress/commit/0913e0fe69167c796b0c3c22706b26f4840c6493)), closes [#1771](https://github.com/vuejs/vitepress/issues/1771)
- **theme:** add cursor for summary of custom block details ([#1774](https://github.com/vuejs/vitepress/issues/1774)) ([167a474](https://github.com/vuejs/vitepress/commit/167a474cb8121d758c2aa863016dffbe8d0a1e55))
- **theme:** wrap long words in `li` ([#1782](https://github.com/vuejs/vitepress/issues/1782)) ([48a42c1](https://github.com/vuejs/vitepress/commit/48a42c19b17417fea384bb0a7004d140b16d9c23)), closes [#1783](https://github.com/vuejs/vitepress/issues/1783) [#1405](https://github.com/vuejs/vitepress/issues/1405)

### Features

- allow `enhanceApp` to return a `Promise` ([#1760](https://github.com/vuejs/vitepress/issues/1760)) ([01ac579](https://github.com/vuejs/vitepress/commit/01ac57918767f44a0757414316e67072399ffb6d))
- **build:** support interpolation inside code blocks ([#1759](https://github.com/vuejs/vitepress/issues/1759)) ([3b7ff8d](https://github.com/vuejs/vitepress/commit/3b7ff8d66e9eda3aab1fb126984efc63132bd22d))

# [1.0.0-alpha.35](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.34...v1.0.0-alpha.35) (2023-01-03)

### Bug Fixes

- **theme:** adjust styles for copied button ([#1751](https://github.com/vuejs/vitepress/issues/1751)) ([565ae71](https://github.com/vuejs/vitepress/commit/565ae711b9b90ad2fe820cdbaa04a9d41506ac53))
- **theme:** adjust styles for diff indicator in code blocks ([#1755](https://github.com/vuejs/vitepress/issues/1755)) ([a642ea2](https://github.com/vuejs/vitepress/commit/a642ea2526f5638243283bd37ef9ba0af350d407))
- **theme:** prevent layout shift on carbon ads ([f6c5e1f](https://github.com/vuejs/vitepress/commit/f6c5e1f098d1fd4d4f6325a21adbb088c32a0740))
- **theme:** refresh ads per page navigation ([#1734](https://github.com/vuejs/vitepress/issues/1734)) ([8db20fe](https://github.com/vuejs/vitepress/commit/8db20fe02240bb1d3c02da738740f2433edb1e8b))

# [1.0.0-alpha.34](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.33...v1.0.0-alpha.34) (2023-01-01)

### Bug Fixes

- **build:** dedent of a single-line region ([#1687](https://github.com/vuejs/vitepress/issues/1687)) ([7de7fff](https://github.com/vuejs/vitepress/commit/7de7fff4178251a6173ac67b52de50176830f539))
- **build:** handle `-` in title of code blocks with line highlighting ([#1743](https://github.com/vuejs/vitepress/issues/1743)) ([ce9467e](https://github.com/vuejs/vitepress/commit/ce9467e389a2776f3230cb31e596cf9e575cc0df))
- handle cleanUrls with subfolders when using a trailing slash ([#1575](https://github.com/vuejs/vitepress/issues/1575)) ([195d867](https://github.com/vuejs/vitepress/commit/195d867ee9bb51a4c112534b34bda7bcd0c2c3f5))

### Features

- **build:** allow specifying default language for syntax highlighter ([#1296](https://github.com/vuejs/vitepress/issues/1296)) ([f40df31](https://github.com/vuejs/vitepress/commit/f40df319475dba9f3fe1e13ff8d8dc4c0950bf5f))
- **build:** fence-level config for line-numbers ([#1733](https://github.com/vuejs/vitepress/issues/1733)) ([c048076](https://github.com/vuejs/vitepress/commit/c048076370b081acc69c04754bf5deba2b8f5cd5))
- **theme:** add `home-hero-image` slot ([#1528](https://github.com/vuejs/vitepress/issues/1528)) ([e72998b](https://github.com/vuejs/vitepress/commit/e72998b68bfcc301d15553033a8b90dee0db65cf))
- **theme:** add mastodon icon ([#1736](https://github.com/vuejs/vitepress/issues/1736)) ([7a73784](https://github.com/vuejs/vitepress/commit/7a737845e5d81a09151320d373a787d2e5f881af))
- **theme:** allow adding images as icons in features section ([#1738](https://github.com/vuejs/vitepress/issues/1738)) ([9df598f](https://github.com/vuejs/vitepress/commit/9df598f36e30fdc9d1c7440bf98b45783126c39f))

### Performance Improvements

- **a11y:** make menu traversable only when it is open ([#1491](https://github.com/vuejs/vitepress/issues/1491)) ([257f9e6](https://github.com/vuejs/vitepress/commit/257f9e68e947a603f9c3ef0df4be7b2afa79fbe7))
- preload css to improve loading speed ([bf1315a](https://github.com/vuejs/vitepress/commit/bf1315ace670df0128682838736371e5381b3f42))

# [1.0.0-alpha.33](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.32...v1.0.0-alpha.33) (2022-12-21)

### Bug Fixes

- **theme:** remove experimental fonts ([#1710](https://github.com/vuejs/vitepress/issues/1710)) ([1ebde66](https://github.com/vuejs/vitepress/commit/1ebde6623ef7f279a77b5a2ddc61e50e322481d1))

### Features

- **build:** provide a `pathname://` protocol to escape SPA ([#1719](https://github.com/vuejs/vitepress/issues/1719)) ([ae21a3a](https://github.com/vuejs/vitepress/commit/ae21a3a622844af476f8311b1d7eba7ae3d5af36))
- **theme:** headings anchor should not be selectable ([#1701](https://github.com/vuejs/vitepress/issues/1701)) ([505a4f8](https://github.com/vuejs/vitepress/commit/505a4f8eee254844be98d224d7f0b943a33959e7))

# [1.0.0-alpha.32](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.31...v1.0.0-alpha.32) (2022-12-16)

### Bug Fixes

- **build:** fix code groups for line numbers mode ([#1700](https://github.com/vuejs/vitepress/issues/1700)) ([135b797](https://github.com/vuejs/vitepress/commit/135b797cfb572659726d9dfbe11ca6045dee9fa3))

### Features

- add code-group feature ([#728](https://github.com/vuejs/vitepress/issues/728)) ([#1560](https://github.com/vuejs/vitepress/issues/1560)) ([a684b67](https://github.com/vuejs/vitepress/commit/a684b67ec084fdc3b3a300ffbdd21e19fdcf7b1e)), closes [#1242](https://github.com/vuejs/vitepress/issues/1242)
- **build:** support `cacheDir` ([#1355](https://github.com/vuejs/vitepress/issues/1355)) ([f899764](https://github.com/vuejs/vitepress/commit/f899764bad8bfdf4fef91e23901d4af3cda91bcc))

# [1.0.0-alpha.31](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.30...v1.0.0-alpha.31) (2022-12-10)

### Features

- **build:** switch to rollup 3 and vite 4 ([#1591](https://github.com/vuejs/vitepress/issues/1591)) ([ae33896](https://github.com/vuejs/vitepress/commit/ae33896a322b6b4cc944d44398ddba6e60b5d1c7))

### Performance Improvements

- **a11y:** add aria-hidden to line numbers wrapper ([#1675](https://github.com/vuejs/vitepress/issues/1675)) ([4c5a892](https://github.com/vuejs/vitepress/commit/4c5a892d7787440faebf061daaaff908680dcd99))

# [1.0.0-alpha.30](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.29...v1.0.0-alpha.30) (2022-12-05)

### Bug Fixes

- **build:** allow importing files having numbers in extension ([#1618](https://github.com/vuejs/vitepress/issues/1618)) ([0565c38](https://github.com/vuejs/vitepress/commit/0565c38fc172cefb9a068882e215ac09dca6636d))
- **build:** allow serving files in dev from workspace root ([#1647](https://github.com/vuejs/vitepress/issues/1647)) ([dc59662](https://github.com/vuejs/vitepress/commit/dc596621cf5ad11585597423b0a98266949c932a))
- **theme:** default to vertical align top on badges inside headings ([#1584](https://github.com/vuejs/vitepress/issues/1584)) ([8a488de](https://github.com/vuejs/vitepress/commit/8a488deac111fbc43b8739c8959b8ae60cbedc80))
- **theme:** ignore removed diff lines while copying code ([f4d5417](https://github.com/vuejs/vitepress/commit/f4d54179306c0ecbc08e4275081e3e169d304e09))
- **theme:** move background colors to theme-default style ([#1347](https://github.com/vuejs/vitepress/issues/1347)) ([4f0194f](https://github.com/vuejs/vitepress/commit/4f0194f1dceec8c7aff70c490b5e757aca560e8a))

### Features

- **build:** add preview as an alias for serve in cli ([#1651](https://github.com/vuejs/vitepress/issues/1651)) ([4ba33da](https://github.com/vuejs/vitepress/commit/4ba33dac60b8b091627eb3e9c2347da0aa5efb82))

# [1.0.0-alpha.29](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.28...v1.0.0-alpha.29) (2022-11-15)

### Bug Fixes

- **build:** explicitly specify asset and entry file names ([#1607](https://github.com/vuejs/vitepress/issues/1607)) ([8601e15](https://github.com/vuejs/vitepress/commit/8601e1596b45e6684b71964d002133fb32d51b9f))
- **theme:** typo in attribute name ([#1597](https://github.com/vuejs/vitepress/issues/1597)) ([cc91d55](https://github.com/vuejs/vitepress/commit/cc91d555b5bfcbde35f2ba33aedcd79a5cef713b))

# [1.0.0-alpha.28](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.27...v1.0.0-alpha.28) (2022-11-08)

### Bug Fixes

- **theme:** use faux italics only with web fonts ([#1581](https://github.com/vuejs/vitepress/issues/1581)) ([124158e](https://github.com/vuejs/vitepress/commit/124158e3a9793fc466b96b51cf7330b8aa3e055b))

### Features

- **theme:** sidebar nav slots ([#1582](https://github.com/vuejs/vitepress/issues/1582)) ([d410d4d](https://github.com/vuejs/vitepress/commit/d410d4dd9f1140b68d140642c1bceaf5419ff304))
- **theme:** use v-html in VPDocFooter ([#1580](https://github.com/vuejs/vitepress/issues/1580)) ([9d10b1d](https://github.com/vuejs/vitepress/commit/9d10b1d5a1ec8d30689ddad5f2d63d22342cf707))

# [1.0.0-alpha.27](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.26...v1.0.0-alpha.27) (2022-11-03)

### Bug Fixes

- **build:** use addClass from shiki-processor ([#1557](https://github.com/vuejs/vitepress/issues/1557)) ([4b0b1ef](https://github.com/vuejs/vitepress/commit/4b0b1ef35f38461514f3e97e0a509029a70d3086)), closes [#1555](https://github.com/vuejs/vitepress/issues/1555)
- **build:** use default slugify from mdit-vue ([#1554](https://github.com/vuejs/vitepress/issues/1554)) ([8cd1f7c](https://github.com/vuejs/vitepress/commit/8cd1f7c4aadb7a911158ac628233b3878a60786a))
- prevent overlay getting hidden behind navbar ([#1547](https://github.com/vuejs/vitepress/issues/1547)) ([87d6c08](https://github.com/vuejs/vitepress/commit/87d6c085d6ccf084d5435216741e3af408c9897a))
- remove shell code copy trailing newline ([#1561](https://github.com/vuejs/vitepress/issues/1561)) ([f36cd0d](https://github.com/vuejs/vitepress/commit/f36cd0d62625c3221533b9e1f83a58b2cd4429a2))
- **theme:** use stored preference to be the value of `userPreference` ([#1543](https://github.com/vuejs/vitepress/issues/1543)) ([a7abf73](https://github.com/vuejs/vitepress/commit/a7abf73e432caa6b06b868e7c8c01c6f31b6cc54))

### Features

- **theme:** add built-in global component `Badge` ([#1239](https://github.com/vuejs/vitepress/issues/1239)) ([ac8619f](https://github.com/vuejs/vitepress/commit/ac8619f841862b8629ea0416ba2f188faceebc70))
- **theme:** add link feature in homepage features ([#984](https://github.com/vuejs/vitepress/issues/984)) ([#1404](https://github.com/vuejs/vitepress/issues/1404)) ([84b4abc](https://github.com/vuejs/vitepress/commit/84b4abc5fa29b353d52162508a31f55a4ea755e5)), closes [#1070](https://github.com/vuejs/vitepress/issues/1070)
- **theme:** sort multiple sidebars ([#1552](https://github.com/vuejs/vitepress/issues/1552)) ([db1c343](https://github.com/vuejs/vitepress/commit/db1c343dfb7011825b18253b4b8a47b5d8f6f817))

### Reverts

- **#1530:** explicitly exit process after build to prevent hangup ([#1572](https://github.com/vuejs/vitepress/issues/1572)) ([01719fa](https://github.com/vuejs/vitepress/commit/01719fa58e245291e640d5b0bc51cac5a4a3085c)), closes [#1530](https://github.com/vuejs/vitepress/issues/1530)

# [1.0.0-alpha.26](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.25...v1.0.0-alpha.26) (2022-10-27)

### Bug Fixes

- properly apply dark/light classes in code blocks ([#1546](https://github.com/vuejs/vitepress/issues/1546)) ([178895f](https://github.com/vuejs/vitepress/commit/178895f067e0f38e1c76d3efe64a75612cd4ad3a))

# [1.0.0-alpha.25](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.24...v1.0.0-alpha.25) (2022-10-25)

### Bug Fixes

- **banner:** prevent hidden local nav on scroll ([63449ca](https://github.com/vuejs/vitepress/commit/63449caf4cb2c7e8449e4f8aee1d8f504fa949df))

# [1.0.0-alpha.24](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.23...v1.0.0-alpha.24) (2022-10-25)

### Bug Fixes

- **banner:** broken layout on smaller viewports ([#1536](https://github.com/vuejs/vitepress/issues/1536)) ([028cc2c](https://github.com/vuejs/vitepress/commit/028cc2c76e540c595e55a399606701490afd4beb))

# [1.0.0-alpha.23](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.22...v1.0.0-alpha.23) (2022-10-25)

### Bug Fixes

- **build:** explicitly exit process after build to prevent hangup ([#1530](https://github.com/vuejs/vitepress/issues/1530)) ([09fcc46](https://github.com/vuejs/vitepress/commit/09fcc460794d515c48c38ccb47a936d58a2582b3))

### Features

- **build:** add `useWebFonts` option ([#1531](https://github.com/vuejs/vitepress/issues/1531)) ([c9f04e0](https://github.com/vuejs/vitepress/commit/c9f04e045922a6f1e11136bd1ccc824c2e9928f1))
- support focus, colored diffs, error highlights in code blocks ([#1534](https://github.com/vuejs/vitepress/issues/1534)) ([04ab0eb](https://github.com/vuejs/vitepress/commit/04ab0eb6dcacb065e865332580088891bc2df893))
- **theme:** add --vp-layout-top-height to adjust banner ([#1521](https://github.com/vuejs/vitepress/issues/1521)) ([a29a4a6](https://github.com/vuejs/vitepress/commit/a29a4a62c682b54ec88c609cb480ddb68b3f4699))

# [1.0.0-alpha.22](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.21...v1.0.0-alpha.22) (2022-10-22)

### Bug Fixes

- **types:** change ComponentOptions to DefineComponent ([#1499](https://github.com/vuejs/vitepress/issues/1499)) ([5711660](https://github.com/vuejs/vitepress/commit/57116607b83f79e62f399cd6430b0d80524861a3))

### Features

- expose isDark ([#1525](https://github.com/vuejs/vitepress/issues/1525)) ([d327811](https://github.com/vuejs/vitepress/commit/d327811fd5b333a73d77730b6b0b347e3d052ebc))
- **theme:** allow defining dark as the default theme ([#1498](https://github.com/vuejs/vitepress/issues/1498)) ([d404753](https://github.com/vuejs/vitepress/commit/d404753005bf4cc3bb645553ac473d08c6473180))
- **theme:** support html strings for SidebarGroup headings, SidebarItem text ([#1489](https://github.com/vuejs/vitepress/issues/1489)) ([946c579](https://github.com/vuejs/vitepress/commit/946c579f2b8957839b8e0ef3474bded5ad06de1a))
- transformPageData hook ([#1492](https://github.com/vuejs/vitepress/issues/1492)) ([afeb06f](https://github.com/vuejs/vitepress/commit/afeb06f17cbd439e3e0151f9571107754fe98b57))

# [1.0.0-alpha.21](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.20...v1.0.0-alpha.21) (2022-10-14)

### Bug Fixes

- **build:** better align server and client side filename sanitization ([3fd20fe](https://github.com/vuejs/vitepress/commit/3fd20fedb81c88c188cff22b4c03ccc2ad416d2c))
- **theme:** match switch background transition with page transition ([#1479](https://github.com/vuejs/vitepress/issues/1479)) ([962065a](https://github.com/vuejs/vitepress/commit/962065a46ee1ef34eccbffbde9e65d7f174f8ab1))
- **theme:** prevent body scrolling when sidebar has opened on small screens ([#1391](https://github.com/vuejs/vitepress/issues/1391)) ([3daabdc](https://github.com/vuejs/vitepress/commit/3daabdc480c0cc10a12a83a08a734f8719d092c5))

### Features

- **theme:** allow specifying common alt for logo ([#1451](https://github.com/vuejs/vitepress/issues/1451)) ([55688a8](https://github.com/vuejs/vitepress/commit/55688a87e3baa38d0e0a37a6eba0039484416875))

# [1.0.0-alpha.20](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.19...v1.0.0-alpha.20) (2022-10-12)

### Bug Fixes

- **a11y:** add title to copy code button ([#1437](https://github.com/vuejs/vitepress/issues/1437)) ([f79bb78](https://github.com/vuejs/vitepress/commit/f79bb78bf7f472d9bc376a3ec393f731bfe9e7ce))
- **router:** don't intercept download links ([#1452](https://github.com/vuejs/vitepress/issues/1452)) ([54cf6ce](https://github.com/vuejs/vitepress/commit/54cf6ce51fcf8ce91c0706332e0b51ddcc2b519d))
- **theme:** disable transitions on theme toggle ([#1447](https://github.com/vuejs/vitepress/issues/1447)) ([067e1a9](https://github.com/vuejs/vitepress/commit/067e1a97434f88835dbfedcf18e2f98d8bfacad9))
- **theme:** make text prop of VPHero optional ([#1445](https://github.com/vuejs/vitepress/issues/1445)) ([95e4f2a](https://github.com/vuejs/vitepress/commit/95e4f2acc9614360fbfe37450028d2067e5993b8))

### Reverts

- "fix(build): remove leading underscore from chunks" ([#1471](https://github.com/vuejs/vitepress/issues/1471)) ([18f0fb4](https://github.com/vuejs/vitepress/commit/18f0fb4e3989192ba95a397476371a945bf84542))

# [1.0.0-alpha.19](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.18...v1.0.0-alpha.19) (2022-10-02)

### Bug Fixes

- **build:** ignore tsconfig target in dev ([#1428](https://github.com/vuejs/vitepress/issues/1428)) ([a13bc86](https://github.com/vuejs/vitepress/commit/a13bc866d0af911256e0629136f4b48e88c44df1))

# [1.0.0-alpha.18](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.17...v1.0.0-alpha.18) (2022-10-01)

### Bug Fixes

- **theme:** break long words on overflow ([#1405](https://github.com/vuejs/vitepress/issues/1405)) ([2114d13](https://github.com/vuejs/vitepress/commit/2114d1326a9d3b952ca8a150f1c27c89169629cc))

# [1.0.0-alpha.17](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.16...v1.0.0-alpha.17) (2022-09-27)

### Bug Fixes

- **theme:** add cursor for collapsible sidebar title ([#1397](https://github.com/vuejs/vitepress/issues/1397)) ([ed37b9a](https://github.com/vuejs/vitepress/commit/ed37b9a0e04f85f941131ec9e2ca8b145d89a535))
- **theme:** remove extra space before docsearch key ([#1396](https://github.com/vuejs/vitepress/issues/1396)) ([6cb79bb](https://github.com/vuejs/vitepress/commit/6cb79bbe6a26f2e8dbd4b07b3fb5b6377f06958d))

### Reverts

- [#1064](https://github.com/vuejs/vitepress/issues/1064) ([9d70ca5](https://github.com/vuejs/vitepress/commit/9d70ca56f147a2ec30d12b03353ea7e4b0850df0))

# [1.0.0-alpha.16](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.15...v1.0.0-alpha.16) (2022-09-24)

### Bug Fixes

- **build:** line numbers mode when language specifier has symbol ([#1353](https://github.com/vuejs/vitepress/issues/1353)) ([9c04a10](https://github.com/vuejs/vitepress/commit/9c04a10c4d9fbfc591dc2386b4780a6728f6364a))
- **build:** remove leading underscore from chunks ([#1394](https://github.com/vuejs/vitepress/issues/1394)) ([66cd164](https://github.com/vuejs/vitepress/commit/66cd1640d16170e0c2d9eb4565ad1ebe81f940e1))
- **compat:** use default export of dns module ([#1388](https://github.com/vuejs/vitepress/issues/1388)) ([fa6fa56](https://github.com/vuejs/vitepress/commit/fa6fa56af9de78856017f935922e4f2f9376be62))
- **theme:** always add alt attribute to images ([#1348](https://github.com/vuejs/vitepress/issues/1348)) ([a621c69](https://github.com/vuejs/vitepress/commit/a621c6910c0083adc26dd4b7aaa7d532544cc7fa))

### Features

- **build:** allow using `transformIndexHtml` ([#1380](https://github.com/vuejs/vitepress/issues/1380)) ([ce8d139](https://github.com/vuejs/vitepress/commit/ce8d139a8e70e4d0a8d06711c50119990b041078))

# [1.0.0-alpha.15](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.14...v1.0.0-alpha.15) (2022-09-15)

### Bug Fixes

- **build:** properly resolve node_modules ([#1337](https://github.com/vuejs/vitepress/issues/1337)) ([0672a69](https://github.com/vuejs/vitepress/commit/0672a696a427731851e1ed79fe689c4a2a46fedf))
- **theme:** hide extra navbar when no content ([#1338](https://github.com/vuejs/vitepress/issues/1338)) ([4482c50](https://github.com/vuejs/vitepress/commit/4482c5019d89129791fe066f011648500d105f41))
- **theme:** remove trailing `#` from outline ([#1344](https://github.com/vuejs/vitepress/issues/1344)) ([f1cf1e8](https://github.com/vuejs/vitepress/commit/f1cf1e800f0e99fe726bdfa7767180473faaf2c2))

# [1.0.0-alpha.14](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.13...v1.0.0-alpha.14) (2022-09-14)

### Bug Fixes

- prevent jumping on clicking docsearch action buttons ([#1140](https://github.com/vuejs/vitepress/issues/1140)) ([86413e6](https://github.com/vuejs/vitepress/commit/86413e6739a834f8490c2004a62a27d1f5a59d00))
- **theme:** break long words ([#1064](https://github.com/vuejs/vitepress/issues/1064)) ([9c739fd](https://github.com/vuejs/vitepress/commit/9c739fd37d15bbf16e8214e20a4bca1c763c4510))
- **theme:** don't nest sidebar links ([#1279](https://github.com/vuejs/vitepress/issues/1279)) ([f840dbc](https://github.com/vuejs/vitepress/commit/f840dbc58f972492ed4afa9b6b222c4f7d89ade1))
- **theme:** keep display copied hint when click multiple times ([#1262](https://github.com/vuejs/vitepress/issues/1262)) ([bb11d0f](https://github.com/vuejs/vitepress/commit/bb11d0f17852a3f2a35339f765acffca526a9ee8))
- **theme:** show progress bar after delay ([#1278](https://github.com/vuejs/vitepress/issues/1278)) ([496bd34](https://github.com/vuejs/vitepress/commit/496bd34ff4143dcef9532f4298ca670bfa34e399))
- **theme:** use pointer cursor only on enabled buttons ([#1300](https://github.com/vuejs/vitepress/issues/1300)) ([d7eac98](https://github.com/vuejs/vitepress/commit/d7eac980e15510de18dbf1fd675a6c1def5f6697))
- **theme:** use pointer-events auto instead of all ([#1290](https://github.com/vuejs/vitepress/issues/1290)) ([6fac5b2](https://github.com/vuejs/vitepress/commit/6fac5b2964e77462edc963811ee1714e337fa53e))
- **types:** allow non async `transformHtml` and `buildEnd` ([#1270](https://github.com/vuejs/vitepress/issues/1270)) ([ee37eaa](https://github.com/vuejs/vitepress/commit/ee37eaa27191faad03c04d60fb3ca8ffbb887fbe))

### Features

- add `transformHead` hook ([#1323](https://github.com/vuejs/vitepress/issues/1323)) ([6b16dad](https://github.com/vuejs/vitepress/commit/6b16dad22f944cb173dbf67ef04be5cb0d09279f))
- add `vp-raw` container ([#1104](https://github.com/vuejs/vitepress/issues/1104)) ([9a6e1ea](https://github.com/vuejs/vitepress/commit/9a6e1ea401c4a44205f96c4786c44061582f675c))
- bundle type definitions of dev-deps ([#1257](https://github.com/vuejs/vitepress/issues/1257)) ([12591a9](https://github.com/vuejs/vitepress/commit/12591a9487ff7647162051f4b28956f0c1403efb))
- **theme:** add page load progress bar ([#1264](https://github.com/vuejs/vitepress/issues/1264)) ([ecf5515](https://github.com/vuejs/vitepress/commit/ecf5515bd453eca20946339a56be9180f6dca2c1))
- **theme:** allow disabling whole layout ([#1268](https://github.com/vuejs/vitepress/issues/1268)) ([8f63033](https://github.com/vuejs/vitepress/commit/8f630339ba95cbaded97f0fcff9323755dd16bcc))
- **theme:** support dynamic headers and nesting in outline ([#1281](https://github.com/vuejs/vitepress/issues/1281)) ([288aa48](https://github.com/vuejs/vitepress/commit/288aa48b92bc1d4dd74d064148a3b03373cdf1c3))

### Performance Improvements

- **a11y:** add aria-checked attribute to switch ([#644](https://github.com/vuejs/vitepress/issues/644)) ([eb9026d](https://github.com/vuejs/vitepress/commit/eb9026d83ca17c59893e7063e0c64b0bf1b99765))
- render pages asynchronously ([#1320](https://github.com/vuejs/vitepress/issues/1320)) ([8e4ff4d](https://github.com/vuejs/vitepress/commit/8e4ff4de901d846ac99d37ebf212b12e9687ed5e))

### Reverts

- **#1264:** add page load progress bar ([#1311](https://github.com/vuejs/vitepress/issues/1311)) ([5378a49](https://github.com/vuejs/vitepress/commit/5378a49613ceef591d2cacecbc175921658b22b1)), closes [#1264](https://github.com/vuejs/vitepress/issues/1264)

# [1.0.0-alpha.13](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.12...v1.0.0-alpha.13) (2022-08-30)

### Features

- use global delegation for copy code interaction ([b5bd73f](https://github.com/vuejs/vitepress/commit/b5bd73f6300e458d419d3a7816272d3c7244a4d3))

# [1.0.0-alpha.12](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.11...v1.0.0-alpha.12) (2022-08-26)

# [1.0.0-alpha.11](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.10...v1.0.0-alpha.11) (2022-08-26)

### Features

- support markdown sfc options ([#1238](https://github.com/vuejs/vitepress/issues/1238)) ([d700a66](https://github.com/vuejs/vitepress/commit/d700a66e65c9c457e44c9272362be36a2002eaf7))

# [1.0.0-alpha.10](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.9...v1.0.0-alpha.10) (2022-08-22)

### Bug Fixes

- avoid circular deps when extending default theme + importing feature components ([5fb7948](https://github.com/vuejs/vitepress/commit/5fb794864b20c59729686aa7e19f0e5659c6534f)), closes [#1210](https://github.com/vuejs/vitepress/issues/1210)

### Features

- **build:** support markdown frontmatter options ([#1218](https://github.com/vuejs/vitepress/issues/1218)) ([bfb0220](https://github.com/vuejs/vitepress/commit/bfb02209896075483b7c9a8c1ca3d36de0a0b731))

# [1.0.0-alpha.9](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.8...v1.0.0-alpha.9) (2022-08-20)

### Bug Fixes

- **theme:** fix typo in carbon ads components ([#1192](https://github.com/vuejs/vitepress/issues/1192)) ([e0932ce](https://github.com/vuejs/vitepress/commit/e0932ce5f49535fb28c6b6e4d17b888dd09187dc))
- **theme:** show footer message/copyright only if present ([#1191](https://github.com/vuejs/vitepress/issues/1191)) ([da2f8d2](https://github.com/vuejs/vitepress/commit/da2f8d28a6993b099a97b01ab2ff94104e84190c))
- **theme:** show outline even without sidebar ([#1189](https://github.com/vuejs/vitepress/issues/1189)) ([3714ea3](https://github.com/vuejs/vitepress/commit/3714ea34635e69aa96de3da5f3cbc5b6198fdbc2))
- **types:** explicitly re-export to resolve ambiguities ([#1193](https://github.com/vuejs/vitepress/issues/1193)) ([eacc18c](https://github.com/vuejs/vitepress/commit/eacc18c993cefa2922c13826c1d0498a9eafc4d1))
- use junctions in Windows ([#1217](https://github.com/vuejs/vitepress/issues/1217)) ([0e14211](https://github.com/vuejs/vitepress/commit/0e14211b609c4694c7654ce381998ce751230480))

### Features

- **theme:** extend titleTemplate by replacing the title ([#1200](https://github.com/vuejs/vitepress/issues/1200)) ([c7def73](https://github.com/vuejs/vitepress/commit/c7def730c3d9266e7573b91e16e00dd2f3f3350b))

# [1.0.0-alpha.8](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.7...v1.0.0-alpha.8) (2022-08-17)

### Bug Fixes

- fix client build entry ([04c4d0f](https://github.com/vuejs/vitepress/commit/04c4d0f01b6cb67fe842d9a88f8810f6959eb3ca))

# [1.0.0-alpha.7](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.6...v1.0.0-alpha.7) (2022-08-17)

### Bug Fixes

- fix static data file support in vite 3 ([19ec22c](https://github.com/vuejs/vitepress/commit/19ec22cb4055e903b28ee70d606163b49009ef59))

# [1.0.0-alpha.6](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.5...v1.0.0-alpha.6) (2022-08-17)

### Breaking Changes

- `/@theme` import alias has been removed. Use `@theme` instead.

### Bug Fixes

- **theme:** remove extra padding in code blocks with line numbers ([f6d6c62](https://github.com/vuejs/vitepress/commit/f6d6c6211708d54fb60b89583fe1665aedd9c22f))
- **theme:** restore styles for code blocks ([#1170](https://github.com/vuejs/vitepress/issues/1170)) ([2c89afb](https://github.com/vuejs/vitepress/commit/2c89afb7ddfeb04f947f95f9ecf636a384492ba8))
- **theme:** set pointer events all on VPNavScreen ([#1182](https://github.com/vuejs/vitepress/issues/1182)) ([b36656a](https://github.com/vuejs/vitepress/commit/b36656a925b30ce5c85a78d6ae3b686917895822))

### Features

- **build:** switch to vite 3, support clean urls and esm mode ([#856](https://github.com/vuejs/vitepress/issues/856)) ([0048e2b](https://github.com/vuejs/vitepress/commit/0048e2bf1e7ef0bf0a4b66bcdd49f9dc84074b2d))

# [1.0.0-alpha.5](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.4...v1.0.0-alpha.5) (2022-08-16)

### Bug Fixes

- **build:** cache key should consider file path ([#948](https://github.com/vuejs/vitepress/issues/948)) ([1daeaa1](https://github.com/vuejs/vitepress/commit/1daeaa16a038cfa927a24bb970ad62c524aed6cf))
- **build:** handle vite constants replacement ([#419](https://github.com/vuejs/vitepress/issues/419)) ([#888](https://github.com/vuejs/vitepress/issues/888)) ([9d9db62](https://github.com/vuejs/vitepress/commit/9d9db6227dff40734bf7129abb69f26412424486))
- **build:** recreate server on config change ([#1132](https://github.com/vuejs/vitepress/issues/1132)) ([93fe820](https://github.com/vuejs/vitepress/commit/93fe8207e7993d62a167af752a8da3c30388f642))
- **build:** show workaround on encountering dead links ([#822](https://github.com/vuejs/vitepress/issues/822)) ([#868](https://github.com/vuejs/vitepress/issues/868)) ([29d44e7](https://github.com/vuejs/vitepress/commit/29d44e7a2201d43227758745e1e3a14858224736))
- **build:** strip custom anchor with capital letters in outline ([#1005](https://github.com/vuejs/vitepress/issues/1005)) ([f6d5697](https://github.com/vuejs/vitepress/commit/f6d5697ed7f247e8673614f4e0ff7232e808ef1e))
- **build:** update language regex for line number class ([#1108](https://github.com/vuejs/vitepress/issues/1108)) ([708c361](https://github.com/vuejs/vitepress/commit/708c36183a925e06c13b9b04ed03af073c315978))
- can't detect that the page has scrolled to the bottom ([#956](https://github.com/vuejs/vitepress/issues/956)) ([#970](https://github.com/vuejs/vitepress/issues/970)) ([98e45af](https://github.com/vuejs/vitepress/commit/98e45af127a11bfff3577fe5675788e5479f9d79))
- de-duplicate head tags while merging ([#975](https://github.com/vuejs/vitepress/issues/975)) ([#976](https://github.com/vuejs/vitepress/issues/976)) ([f7e9cfe](https://github.com/vuejs/vitepress/commit/f7e9cfeb3a06ec93726870dd17116a019959d980))
- decode href before using as query selector ([#951](https://github.com/vuejs/vitepress/issues/951)) ([22006e8](https://github.com/vuejs/vitepress/commit/22006e8d6e3ed45841979d684eb6a4ef999bd707))
- decode image src so that rollup can process it ([#933](https://github.com/vuejs/vitepress/issues/933)) ([bb41a9f](https://github.com/vuejs/vitepress/commit/bb41a9fed771a5bdfc73b1bbe5200d11c3630367))
- don't add base to external urls while preloading ([#1045](https://github.com/vuejs/vitepress/issues/1045)) ([7295033](https://github.com/vuejs/vitepress/commit/72950337bc31fd2f8879d6a2f219018a18b29727))
- don't change url hash while scrolling ([#991](https://github.com/vuejs/vitepress/issues/991)) ([0826944](https://github.com/vuejs/vitepress/commit/082694470a15e50c5d000936572856a574409ea5))
- layout inconsistencies and remove sidebar from 404 page ([#964](https://github.com/vuejs/vitepress/issues/964)) ([0257ea8](https://github.com/vuejs/vitepress/commit/0257ea88dca09ced9c1dc6e53ba5f133c468df19))
- line highlighting in custom code block ([#959](https://github.com/vuejs/vitepress/issues/959)) ([#969](https://github.com/vuejs/vitepress/issues/969)) ([7a9e4d9](https://github.com/vuejs/vitepress/commit/7a9e4d9ee02cc677f1b84cc5f2c1f8f385c3a65c))
- normalize link in VPButton ([#919](https://github.com/vuejs/vitepress/issues/919)) ([bed68f1](https://github.com/vuejs/vitepress/commit/bed68f134186e4fd3c0bca4c6a5871a79e4cd224))
- only check for duplicate meta tags ([#977](https://github.com/vuejs/vitepress/issues/977)) ([1ef7a18](https://github.com/vuejs/vitepress/commit/1ef7a1857c2a8e2abc7c1859cd54504c144eab3b)), closes [/github.com/vuejs/vitepress/issues/975#issuecomment-1183507200](https://github.com//github.com/vuejs/vitepress/issues/975/issues/issuecomment-1183507200)
- regression caused by [#887](https://github.com/vuejs/vitepress/issues/887) ([30249dc](https://github.com/vuejs/vitepress/commit/30249dc2c3d933dadf6e22e64728a6ffd3647f8e))
- remove duplicate router logic ([#1087](https://github.com/vuejs/vitepress/issues/1087)) ([63584c2](https://github.com/vuejs/vitepress/commit/63584c2812d2c5172356ef2615ac608684d52681))
- remove explicit noopener from external links ([#871](https://github.com/vuejs/vitepress/issues/871)) ([e4c60ab](https://github.com/vuejs/vitepress/commit/e4c60ab3c834fe7f730cd7b0d64dd23c6d04dbed))
- support urls with query during dev ([35b7361](https://github.com/vuejs/vitepress/commit/35b7361ca2c689f0fb464ab9cbab8bb02e4884d5))
- **theme:** change sponsor link class name to bypass adblock ([#866](https://github.com/vuejs/vitepress/issues/866)) ([#867](https://github.com/vuejs/vitepress/issues/867)) ([e33955e](https://github.com/vuejs/vitepress/commit/e33955e7696af2de2d9ed53d53a06aa5de17f3ce))
- **theme:** close menu on route change ([#887](https://github.com/vuejs/vitepress/issues/887)) ([fcd7642](https://github.com/vuejs/vitepress/commit/fcd7642924331e81e85ee75a1224a04d1882531c))
- **theme:** don't let navbar obstruct clicks to top part of scrollbar ([#1168](https://github.com/vuejs/vitepress/issues/1168)) ([44953dc](https://github.com/vuejs/vitepress/commit/44953dcd1e0224bae95666c87e368b9d3fdf17ae))
- **theme:** fix custom NotFound component rendering ([#1163](https://github.com/vuejs/vitepress/issues/1163)) ([4a6eda4](https://github.com/vuejs/vitepress/commit/4a6eda48704ad34e003d144594bbc56c1b448c6d))
- **theme:** hide doc footer if empty ([#1126](https://github.com/vuejs/vitepress/issues/1126)) ([70da5f2](https://github.com/vuejs/vitepress/commit/70da5f275bc44ce4e6ed97af40cf30d6971ee378))
- **theme:** make last updated time reactive ([#879](https://github.com/vuejs/vitepress/issues/879)) ([25a835f](https://github.com/vuejs/vitepress/commit/25a835f0f437a2181f67dbcefa17546dbcb833de))
- **theme:** navbar menu may exceed the screen ([#988](https://github.com/vuejs/vitepress/issues/988)) ([#989](https://github.com/vuejs/vitepress/issues/989)) ([8a46413](https://github.com/vuejs/vitepress/commit/8a46413d6fa6ff671f780b60c7bc6380d84dc25d))
- **theme:** prevent docsearch button key from changing ([#986](https://github.com/vuejs/vitepress/issues/986)) ([d65667b](https://github.com/vuejs/vitepress/commit/d65667b8d49a11fccee6bc0cd06a75333a65f22c))
- **theme:** tweak styles of nav title ([#962](https://github.com/vuejs/vitepress/issues/962)) ([#968](https://github.com/vuejs/vitepress/issues/968)) ([d91f3b1](https://github.com/vuejs/vitepress/commit/d91f3b1b7d46db8009bb459079794b0626488033))
- **theme:** typo in color name ([#1020](https://github.com/vuejs/vitepress/issues/1020)) ([4b38736](https://github.com/vuejs/vitepress/commit/4b38736adf2853276f573a1980a213a17cf2c740))
- treat all URI schemes as external ([#945](https://github.com/vuejs/vitepress/issues/945)) ([#946](https://github.com/vuejs/vitepress/issues/946)) ([1e9a7ac](https://github.com/vuejs/vitepress/commit/1e9a7ac6c478c57d7336e2d7b0392f23659080d3))
- **types:** add client and theme to `exports` field ([#914](https://github.com/vuejs/vitepress/issues/914)) ([1cc087d](https://github.com/vuejs/vitepress/commit/1cc087deeee5f6c8289259bb7a2695ed75f287c3))
- **types:** fix broken syntax in `theme.d.ts` ([#1101](https://github.com/vuejs/vitepress/issues/1101)) ([70b3060](https://github.com/vuejs/vitepress/commit/70b3060be963ed7a0d2041446d67ac970d6f35e3))
- use `router.go` if search string is not same ([#1109](https://github.com/vuejs/vitepress/issues/1109)) ([5597165](https://github.com/vuejs/vitepress/commit/55971659a5c4b25cb07968ca4e162abc11fe2e80))

### Features

- allow adding custom social icons as inline svg ([#738](https://github.com/vuejs/vitepress/issues/738)) ([#953](https://github.com/vuejs/vitepress/issues/953)) ([74e4950](https://github.com/vuejs/vitepress/commit/74e4950c1b83f2e0c8659477c7b2763fa150b349))
- allow html in footer ([#1034](https://github.com/vuejs/vitepress/issues/1034)) ([ad9af83](https://github.com/vuejs/vitepress/commit/ad9af83278d702a76f674f847b383370b3921256))
- allow using custom syntax highlighting themes ([#992](https://github.com/vuejs/vitepress/issues/992)) ([d5ed66c](https://github.com/vuejs/vitepress/commit/d5ed66c6d21ec3b5e17469771057132c53220bea))
- **build:** allow ignoring dead links ([#586](https://github.com/vuejs/vitepress/issues/586)) ([#793](https://github.com/vuejs/vitepress/issues/793)) ([19b0758](https://github.com/vuejs/vitepress/commit/19b0758a04e9fb7863b3a961024dfe1137fbe928))
- **build:** allow using custom highlighter ([#754](https://github.com/vuejs/vitepress/issues/754)) ([#857](https://github.com/vuejs/vitepress/issues/857)) ([ddf876d](https://github.com/vuejs/vitepress/commit/ddf876d8e90e812a198bb417a5dc60cd443a8273))
- **build:** handle change of config file dependencies ([#1009](https://github.com/vuejs/vitepress/issues/1009)) ([8e6665b](https://github.com/vuejs/vitepress/commit/8e6665bd8de66a8249fca92fbb1b9a4f6d76a041))
- **build:** improve code blocks and snippets ([#875](https://github.com/vuejs/vitepress/issues/875)) ([f789932](https://github.com/vuejs/vitepress/commit/f789932ffc79723a90b3b19a59d6f277d9edaaa9)), closes [#861](https://github.com/vuejs/vitepress/issues/861) [#471](https://github.com/vuejs/vitepress/issues/471) [#884](https://github.com/vuejs/vitepress/issues/884)
- **build:** support code highlight in uppercase ([#1082](https://github.com/vuejs/vitepress/issues/1082)) ([867f305](https://github.com/vuejs/vitepress/commit/867f30588687c4f9228c1511bee672074e54c802)), closes [#772](https://github.com/vuejs/vitepress/issues/772)
- provide `transformHtml` hook ([#1022](https://github.com/vuejs/vitepress/issues/1022)) ([2b4b800](https://github.com/vuejs/vitepress/commit/2b4b80061818f1c471aafb23c0572172ef842138))
- provide build end hook ([#709](https://github.com/vuejs/vitepress/issues/709)) ([e0b730a](https://github.com/vuejs/vitepress/commit/e0b730aa8ee9bec1fe16245c4c1a1a91f62bed42))
- **theme:** add `doc-footer-before` slot ([#1050](https://github.com/vuejs/vitepress/issues/1050)) ([#1052](https://github.com/vuejs/vitepress/issues/1052)) ([60c515c](https://github.com/vuejs/vitepress/commit/60c515c1255085d73845d2b2cc315823ee18e7b8))
- **theme:** add navigation slots ([#739](https://github.com/vuejs/vitepress/issues/739)) ([#741](https://github.com/vuejs/vitepress/issues/741)) ([0f0453c](https://github.com/vuejs/vitepress/commit/0f0453c6750c5af9c1ae65abb994813eecf9af27))
- **theme:** add option to customize search button text ([#713](https://github.com/vuejs/vitepress/issues/713)) ([#747](https://github.com/vuejs/vitepress/issues/747)) ([00fe809](https://github.com/vuejs/vitepress/commit/00fe8092d9e097d2dd24c06787fcb740310bdda7))
- **theme:** auto open collapsed sidebar on entering ([#1094](https://github.com/vuejs/vitepress/issues/1094)) ([f4f1a6c](https://github.com/vuejs/vitepress/commit/f4f1a6ccd62ea52c03b2c342c649f0f06f466126))
- **theme:** custom prev/next labels and text ([#897](https://github.com/vuejs/vitepress/issues/897)) ([836a246](https://github.com/vuejs/vitepress/commit/836a24683a19eefbc98d6c448c26e3696a679e7c))
- **theme:** support hiding aside component from frontmatter ([#980](https://github.com/vuejs/vitepress/issues/980)) ([69ef299](https://github.com/vuejs/vitepress/commit/69ef2998c37453ab9c0147e87dd9a6efb41a24a3))
- **theme:** support multi-level sidebar ([#851](https://github.com/vuejs/vitepress/issues/851)) ([d1a2c76](https://github.com/vuejs/vitepress/commit/d1a2c76f33ab55ad8d43357b57c9ae3de55e9d0c))

### Performance Improvements

- **a11y:** change copy code span to button ([#1056](https://github.com/vuejs/vitepress/issues/1056)) ([fb9cee9](https://github.com/vuejs/vitepress/commit/fb9cee95b95bf5989599deb1c4fbb1a448d67952))

### Reverts

- vuejs/vitepress[#889](https://github.com/vuejs/vitepress/issues/889) ([#896](https://github.com/vuejs/vitepress/issues/896)) ([e1339fd](https://github.com/vuejs/vitepress/commit/e1339fdc4fc9736fc31d69393ca4289a1f245013))

## [1.0.0-alpha.4](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.3...v1.0.0-alpha.4) (2022-06-22)

### Bug Fixes

- **theme:** home image style is broken in big view port ([2bd960d](https://github.com/vuejs/vitepress/commit/2bd960d5f5a84df614035a4fb941331fdf9d84f2))

## [1.0.0-alpha.3](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.2...v1.0.0-alpha.3) (2022-06-22)

### Bug Fixes

- **theme:** italic fonts are missing ([#759](https://github.com/vuejs/vitepress/issues/759)) ([#777](https://github.com/vuejs/vitepress/issues/777)) ([fa00c83](https://github.com/vuejs/vitepress/commit/fa00c83af4aa5fa619cf2e3da8d5aab77984ba7c))
- **theme:** copy code in non-secure contexts ([#792](https://github.com/vuejs/vitepress/issues/792)) ([2935ed2](https://github.com/vuejs/vitepress/commit/2935ed22954010fa0d48d0625e5f2b0136991e0b))
- **theme:** copy code button has wrong tag closing syntax ([#816](https://github.com/vuejs/vitepress/issues/816)) ([75ca9e4](https://github.com/vuejs/vitepress/commit/75ca9e4302c65e3bcc9518f7df928318380f6cf6))
- **theme:** edit link gets hidden when a page don't have siblings ([#751](https://github.com/vuejs/vitepress/issues/751)) ([9bc4330](https://github.com/vuejs/vitepress/commit/9bc43306a1fe7bfd54b738642fd1737917a3af41))
- **theme:** nav close icon not working correctly ([#744](https://github.com/vuejs/vitepress/issues/744)) ([75c9d80](https://github.com/vuejs/vitepress/commit/75c9d809d21c0484c0ae8ce691d598cf229c9525))
- **theme:** sidebar is shown on home layout ([#825](https://github.com/vuejs/vitepress/issues/825)) ([#829](https://github.com/vuejs/vitepress/issues/829)) ([42cbd31](https://github.com/vuejs/vitepress/commit/42cbd31327b789ff9525919afb39b3092f1d445b))
- **theme:** sidebar collapsed option not working on layout change ([#809](https://github.com/vuejs/vitepress/issues/809)) ([#811](https://github.com/vuejs/vitepress/issues/811)) ([7737699](https://github.com/vuejs/vitepress/commit/773769926b74cabfbb3577d6c6e654fe976c0b76))
- **theme:** `DefaultTheme` type causes error in some cases ([#804](https://github.com/vuejs/vitepress/issues/804)) ([107724a](https://github.com/vuejs/vitepress/commit/107724ac6f24e5272964d3bdbff54169fa4d91ae))

### Features

- **build:** allow setting `base` from command line ([2952638](https://github.com/vuejs/vitepress/commit/295263807df5a0cdff3b04d5131a3cebc76ec491))
- **theme:** add active status to nav menu group ([#820](https://github.com/vuejs/vitepress/issues/820)) ([fdb5720](https://github.com/vuejs/vitepress/commit/fdb5720acda9f8f2dd1e4f33d0810a6e9ca9e7de))
- **theme:** add global layout slots ([#760](https://github.com/vuejs/vitepress/issues/760)) ([#812](https://github.com/vuejs/vitepress/issues/812)) ([1f1e298](https://github.com/vuejs/vitepress/commit/1f1e298864f7b8af9672b55251958ba766678e0b))
- **theme:** support themeable images for logo and hero ([#745](https://github.com/vuejs/vitepress/issues/745)) ([42813ce](https://github.com/vuejs/vitepress/commit/42813ce936d9fb141241969651cb0e3a02345442))
- **theme:** add team page feature ([#828](https://github.com/vuejs/vitepress/issues/828)) ([7cfe0f0](https://github.com/vuejs/vitepress/commit/7cfe0f05ab013904c66c48d8529d2ba4747869cb))

## [1.0.0-alpha.2](https://github.com/vuejs/vitepress/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2022-06-14)

### Bug Fixes

- use h1 for title in hero instead of p ([#776](https://github.com/vuejs/vitepress/issues/776)) ([919d230](https://github.com/vuejs/vitepress/commit/919d23079b636c188ea2049039461b88e0c02fc2))
- add background color in navbar to avoid contrast issues ([#695](https://github.com/vuejs/vitepress/issues/695)) ([305bcc0](https://github.com/vuejs/vitepress/commit/305bcc02e68f8f9aea0000e6950e78455cf572f5))
- add default value for base in `createMarkdownRenderer` ([#555](https://github.com/vuejs/vitepress/issues/555)) ([#556](https://github.com/vuejs/vitepress/issues/556)) ([78a2e84](https://github.com/vuejs/vitepress/commit/78a2e84e7bb7acfda50e686bbd404961babb91e8))
- allow lang='ts' on scripts in markdown ([#693](https://github.com/vuejs/vitepress/issues/693)) ([#701](https://github.com/vuejs/vitepress/issues/701)) ([59df105](https://github.com/vuejs/vitepress/commit/59df10590b958bbc39cc2e8c81a2209eda9d431b))
- better nav item types ([#714](https://github.com/vuejs/vitepress/issues/714)) ([263607b](https://github.com/vuejs/vitepress/commit/263607b279cbfd3db80bbe0ea66000560d24993a))
- double base in sidebar links ([#756](https://github.com/vuejs/vitepress/issues/756)) ([aa65cb5](https://github.com/vuejs/vitepress/commit/aa65cb58f508bb8e79c20b6370bdfe1b7e470abf))
- use `pre-wrap` for text and tagline ([#746](https://github.com/vuejs/vitepress/issues/746)) ([94704c9](https://github.com/vuejs/vitepress/commit/94704c95637f1cc844d526d4743818d38d1cbae0))
- nav nested items type error ([#710](https://github.com/vuejs/vitepress/issues/710)) ([#711](https://github.com/vuejs/vitepress/issues/711)) ([e5bf15a](https://github.com/vuejs/vitepress/commit/e5bf15a21ee777b4e56ad86ec5ebb5b0e161b721))
- page layout breaks when page name matches the css class name ([#696](https://github.com/vuejs/vitepress/issues/696)) ([#699](https://github.com/vuejs/vitepress/issues/699)) ([9c0ed93](https://github.com/vuejs/vitepress/commit/9c0ed9397f35827a261d45c789d23ce7faa7ecee))
- remove title bg transition to avoid flush on sidebar on/off ([1942418](https://github.com/vuejs/vitepress/commit/1942418f9570feb81d8066a2413d70b0f36fb8ce))
- sidebar right blur notch ([#712](https://github.com/vuejs/vitepress/issues/712)) ([64c3654](https://github.com/vuejs/vitepress/commit/64c3654b4ba82c16fefdf396106f3077d066c67b))
- typo ([#708](https://github.com/vuejs/vitepress/issues/708)) ([#716](https://github.com/vuejs/vitepress/issues/716)) ([1fe5153](https://github.com/vuejs/vitepress/commit/1fe5153f47465efed05e087119c93d50da6e92a3))
- title in containers not working with markdown content ([#765](https://github.com/vuejs/vitepress/issues/765)) ([#768](https://github.com/vuejs/vitepress/issues/768)) ([c5c3c64](https://github.com/vuejs/vitepress/commit/c5c3c64851b240279a304198fd97e3dc8b5f2fd0))
- use base in links ([#717](https://github.com/vuejs/vitepress/issues/717)) ([#718](https://github.com/vuejs/vitepress/issues/718)) ([8e50154](https://github.com/vuejs/vitepress/commit/8e5015462c8f42c5404525ac8de33af8862c204d))
- use h2 for feature headers ([#774](https://github.com/vuejs/vitepress/issues/774)) ([b1ff725](https://github.com/vuejs/vitepress/commit/b1ff72561182c91b4912ebef44204a53ee3aca5e))

### Features

- add `lastUpdated` option to frontmatter ([b31fbf3](https://github.com/vuejs/vitepress/commit/b31fbf3621bbd7f627a1b80c581b7a8444bc6b0d))
- add doc before and after slot ([#762](https://github.com/vuejs/vitepress/issues/762)) ([#786](https://github.com/vuejs/vitepress/issues/786)) ([9c2a36f](https://github.com/vuejs/vitepress/commit/9c2a36f5428bd98eafb6e2e9bc63f5e532b596b7))
- allow custom edit links ([#698](https://github.com/vuejs/vitepress/issues/698)) ([535e176](https://github.com/vuejs/vitepress/commit/535e176b9a230f692f58a79813a12d2ffbe90be3)), closes [#694](https://github.com/vuejs/vitepress/issues/694) [#697](https://github.com/vuejs/vitepress/issues/697)
- allow custom outline title ([#689](https://github.com/vuejs/vitepress/issues/689)) ([#690](https://github.com/vuejs/vitepress/issues/690)) ([a8a1623](https://github.com/vuejs/vitepress/commit/a8a16237cd8e3e4bb180fbd523a4668a4555b732))
- allow external links in sidebar ([#205](https://github.com/vuejs/vitepress/issues/205)) ([#686](https://github.com/vuejs/vitepress/issues/686)) ([ce17f50](https://github.com/vuejs/vitepress/commit/ce17f5035cbbd1e07373ce0f44913f25269bd80b))
- support custom content in home layout ([#702](https://github.com/vuejs/vitepress/issues/702)) ([92659a2](https://github.com/vuejs/vitepress/commit/92659a2e9dde13e35fadf2d2dca157d648bc9013))
- emit 404.html on build ([#729](https://github.com/vuejs/vitepress/issues/729)) ([#740](https://github.com/vuejs/vitepress/issues/740)) ([23276ba](https://github.com/vuejs/vitepress/commit/23276bae050190b6c1d57347424360fe2c3a57be))
- setup devtools and remove debug component ([#721](https://github.com/vuejs/vitepress/issues/721)) ([421f641](https://github.com/vuejs/vitepress/commit/421f641a76ddc0e8b0f23ab7ad711833fc98c245))

## [1.0.0-alpha.1](https://github.com/vuejs/vitepress/compare/v0.22.4...v1.0.0-alpha.1) (2022-06-01)

Complete rewrite on default theme, with bunch of features added. Please refer to the docs for the new feature and changes.

## [0.22.4](https://github.com/vuejs/vitepress/compare/v0.22.3...v0.22.4) (2022-05-06)

### Bug Fixes

- **plugin:** set content-type header for serving index.html ([#616](https://github.com/vuejs/vitepress/issues/616)) ([1656f03](https://github.com/vuejs/vitepress/commit/1656f0365ae7aa07b008d4e367e5b1b382118897))
- remove 404 from title on initial route ([#590](https://github.com/vuejs/vitepress/issues/590)) ([216e129](https://github.com/vuejs/vitepress/commit/216e12950b312f9f5b8af74cac0ce243693e37ee)), closes [#589](https://github.com/vuejs/vitepress/issues/589)

## [0.22.3](https://github.com/vuejs/vitepress/compare/v0.22.2...v0.22.3) (2022-02-22)

### Bug Fixes

- append base to links ([#502](https://github.com/vuejs/vitepress/issues/502)) ([804954c](https://github.com/vuejs/vitepress/commit/804954cf4d5417b1abcba9854ed5f064348292c5)), closes [#252](https://github.com/vuejs/vitepress/issues/252)
- avoid minimizing non-javascript inline scripts ([#517](https://github.com/vuejs/vitepress/issues/517)) ([779b789](https://github.com/vuejs/vitepress/commit/779b78902fc7b1f9e7806751c0ca1e229a2161ce)), closes [#538](https://github.com/vuejs/vitepress/issues/538) [#540](https://github.com/vuejs/vitepress/issues/540)
- **client router:** tolerant invalid hash selector typo ([#506](https://github.com/vuejs/vitepress/issues/506)) ([ffe0c40](https://github.com/vuejs/vitepress/commit/ffe0c40ebc42d7769b5378775cdffcab52d3cf11))
- don't add .html to urls of non-html files ([#515](https://github.com/vuejs/vitepress/issues/515)) ([34d1542](https://github.com/vuejs/vitepress/commit/34d1542f466e2eed28b1be7153d1c3461d84528f)), closes [#265](https://github.com/vuejs/vitepress/issues/265)
- normalize relative img src ([#514](https://github.com/vuejs/vitepress/issues/514)) ([9270477](https://github.com/vuejs/vitepress/commit/9270477fa59545978dc2732ac0a8091bed39625f)), closes [#450](https://github.com/vuejs/vitepress/issues/450)
- require at least node v14 ([#546](https://github.com/vuejs/vitepress/issues/546)) ([7cf7011](https://github.com/vuejs/vitepress/commit/7cf70111a5a00579d46453b682ef33169c7846c5))
- reset page data on 404 ([#497](https://github.com/vuejs/vitepress/issues/497)) ([28eaa3b](https://github.com/vuejs/vitepress/commit/28eaa3b04ab71674330151d2a9b79d52c382e71e))

## [0.22.2](https://github.com/vuejs/vitepress/compare/v0.22.1...v0.22.2) (2022-02-14)

### Features

- improve default chunk strategy + page hash stability ([1ef69e2](https://github.com/vuejs/vitepress/commit/1ef69e212f91e43431b4fe4bdba17ca4f29a7b49))

## [0.22.1](https://github.com/vuejs/vitepress/compare/v0.22.0...v0.22.1) (2022-02-14)

### Features

- automatically update hash map + retry on failed page fetch ([2324948](https://github.com/vuejs/vitepress/commit/23249483d60da1952c64a1f764873652b587c2dc))
- use git-based lastUpdated data ([d32d8d4](https://github.com/vuejs/vitepress/commit/d32d8d441917dcb480a6735da78c2d6fc3e589c0))

  Note: lastUpdated data is now disabled by default due to the performance overhead of retrieving the git information. This also means each page's metadata object no longer contains the `lastUpdated` property by default - it will only be present if the new `lastUpdated: true` config option is enabled.

# [0.22.0](https://github.com/vuejs/vitepress/compare/v0.21.6...v0.22.0) (2022-02-11)

- Upgrade to Vite 2.8

## [0.21.6](https://github.com/vuejs/vitepress/compare/v0.21.5...v0.21.6) (2022-01-19)

### Perf

- Avoid wrapping siteData as readonly proxy in production builds

## [0.21.5](https://github.com/vuejs/vitepress/compare/v0.21.4...v0.21.5) (2022-01-16)

### Bug Fixes

- allow overriding title if home is true ([#493](https://github.com/vuejs/vitepress/issues/493)) ([88d57a9](https://github.com/vuejs/vitepress/commit/88d57a93ef2689a8f5344b7f38b26db5ea86759b))
- **types:** fix vitepress/theme type ([eabf6d2](https://github.com/vuejs/vitepress/commit/eabf6d2aa69d2a5452042bbb59edbbbc95aece87)), closes [#489](https://github.com/vuejs/vitepress/issues/489) [#438](https://github.com/vuejs/vitepress/issues/438) [#494](https://github.com/vuejs/vitepress/issues/494) [#442](https://github.com/vuejs/vitepress/issues/442)

### Features

- scrollOffset option ([b66785d](https://github.com/vuejs/vitepress/commit/b66785d68a86c118a7a036f3de8b3e504390f1da))

## [0.21.4](https://github.com/vuejs/vitepress/compare/v0.21.3...v0.21.4) (2022-01-07)

### Bug Fixes

- set \_\_data in md.render ([dfbc932](https://github.com/vuejs/vitepress/commit/dfbc932fac50d39b047b211cedca0dcce05aebc8))

## [0.21.3](https://github.com/vuejs/vitepress/compare/v0.21.2...v0.21.3) (2022-01-06)

### Bug Fixes

- prioritize vue installed in user project root ([9b3243b](https://github.com/vuejs/vitepress/commit/9b3243b75752209943af5b247f5d38e641d4ff6d))

## [0.21.2](https://github.com/vuejs/vitepress/compare/v0.21.1...v0.21.2) (2022-01-06)

## [0.21.1](https://github.com/vuejs/vitepress/compare/v0.21.0...v0.21.1) (2022-01-06)

### Performance Improvements

- do not include head config in client bundle for production ([6f3a96f](https://github.com/vuejs/vitepress/commit/6f3a96f06daec4baad4420b54137a7afb1512e7f))

# [0.21.0](https://github.com/vuejs/vitepress/compare/v0.20.10...v0.21.0) (2022-01-06)

### Bug Fixes

- Chinese file link build failed ([#425](https://github.com/vuejs/vitepress/issues/425)) ([ae029ae](https://github.com/vuejs/vitepress/commit/ae029ae9e17fa6df1d2f89043f1891271e9c5b9b)), closes [#424](https://github.com/vuejs/vitepress/issues/424)
- initial render of 404 pages ([#418](https://github.com/vuejs/vitepress/issues/418)) ([a3bf52f](https://github.com/vuejs/vitepress/commit/a3bf52fed53e82b9756c844f6bdd576662d2e726))
- remove `.` for mjs in `supportedConfigExtensions` ([#447](https://github.com/vuejs/vitepress/issues/447)) ([fb6a4ad](https://github.com/vuejs/vitepress/commit/fb6a4ad3e008af9ce4393fb3ca37645f4efba951))
- **serve:** respect base config in serve mode ([#470](https://github.com/vuejs/vitepress/issues/470)) ([08a0b12](https://github.com/vuejs/vitepress/commit/08a0b129928cef44e613ff410d769a7ac7bf5fa3)), closes [#416](https://github.com/vuejs/vitepress/issues/416)
- set tempDir outside package root ([#439](https://github.com/vuejs/vitepress/issues/439)) ([bd35451](https://github.com/vuejs/vitepress/commit/bd35451ed42d7b5c47e2b49a7e659807cd7d7a0c)), closes [#435](https://github.com/vuejs/vitepress/issues/435)
- use algolia search lang ([#459](https://github.com/vuejs/vitepress/issues/459)) ([444562c](https://github.com/vuejs/vitepress/commit/444562c3a763bab7a9c0ebfca5eec635e142a61f))

### Features

- add details custom container ([#455](https://github.com/vuejs/vitepress/issues/455)) ([a8f147f](https://github.com/vuejs/vitepress/commit/a8f147f153efdd17989a02eb620c3ae9ab0d13dd))
- catch localhost links as dead links ([7387649](https://github.com/vuejs/vitepress/commit/7387649ff7c621402e49e26493b4eed25006fb4b))
- expose `__path` and `__relativePath` on md instance for md plugins ([4cec660](https://github.com/vuejs/vitepress/commit/4cec660401d8d01830e5a11b9c66bc0ac5a935db))
- improve typescript support for config file, add `defineConfigWithTheme` ([#465](https://github.com/vuejs/vitepress/issues/465)) ([ba41bb9](https://github.com/vuejs/vitepress/commit/ba41bb90551c01b9f84de2d2d3bc1920ce2ebe93))
- properly remove `{#custom-anchor}` syntax in headers ([6120da2](https://github.com/vuejs/vitepress/commit/6120da25a87f6bec3918be804e95f2b3c8afb6c8))
- user configurable `outDir` ([#448](https://github.com/vuejs/vitepress/issues/448)) ([5b04bb9](https://github.com/vuejs/vitepress/commit/5b04bb9eb5ced720414f4b0d729fde36432dd451))

## [0.20.10](https://github.com/vuejs/vitepress/compare/v0.20.9...v0.20.10) (2021-12-25)

### Features

- minify head inline scripts ([e61db62](https://github.com/vuejs/vitepress/commit/e61db62a1c49cb5f368a152221bfa60737dbbc6a))

## [0.20.9](https://github.com/vuejs/vitepress/compare/v0.20.8...v0.20.9) (2021-12-15)

### Features

- shouldPreload hook ([e721d60](https://github.com/vuejs/vitepress/commit/e721d605851be4e27f4948d96d5c3bab6d23ead2))
- support array of patterns in data loaders ([f5308d7](https://github.com/vuejs/vitepress/commit/f5308d746f3089ef6818b0139fe249827a47628b))

## [0.20.8](https://github.com/vuejs/vitepress/compare/v0.20.7...v0.20.8) (2021-12-14)

## [0.20.7](https://github.com/vuejs/vitepress/compare/v0.20.6...v0.20.7) (2021-12-14)

### Features

- **types:** re-export vite client type ([4caa7b2](https://github.com/vuejs/vitepress/commit/4caa7b231753ddedb83365a37b8c259ae461bd37))

## [0.20.6](https://github.com/vuejs/vitepress/compare/v0.20.4...v0.20.6) (2021-12-14)

### Features

- support static data loaders ([26fe81c](https://github.com/vuejs/vitepress/commit/26fe81c88618d7df5d623d041ac3df96e7d7ee7b))

## [0.20.5](https://github.com/vuejs/vitepress/compare/v0.20.4...v0.20.5) (2021-12-12)

- Bump vue & vite versions

## [0.20.4](https://github.com/vuejs/vitepress/compare/v0.20.3...v0.20.4) (2021-12-07)

### Bug Fixes

- **build:** fix typing files ([ae11dc0](https://github.com/vuejs/vitepress/commit/ae11dc0b59ac90375079f1ebf0efacf1b1e58e8d))

## [0.20.3](https://github.com/vuejs/vitepress/compare/v0.20.2...v0.20.3) (2021-12-07)

### Features

- expose createMarkdownRenderer ([d54c7d8](https://github.com/vuejs/vitepress/commit/d54c7d8c56973dac138bfe96ff16dfab162ef64b))

## [0.20.2](https://github.com/vuejs/vitepress/compare/v0.20.1...v0.20.2) (2021-12-06)

### Bug Fixes

- handle potential string quote mismatch in generated code ([dfa7c05](https://github.com/vuejs/vitepress/commit/dfa7c0525f010994437acb060867d9ca1572867d))
- improve createStaticVNode match for rollup codegen compat ([abb1b57](https://github.com/vuejs/vitepress/commit/abb1b578cdedf184ae386ce455e60a23672adfcb))
- lazy require @vitejs/plugin-vue to respect NODE_ENV ([a051e66](https://github.com/vuejs/vitepress/commit/a051e66f1ae211174cf470d4430427dc0189194b))
- static string strip regex for mulitiline static strings ([bc486aa](https://github.com/vuejs/vitepress/commit/bc486aae563fd77f38da44d9ae3ea28c021f6df0))

### Features

- upgrade docsearch version ([#441](https://github.com/vuejs/vitepress/issues/441)) ([1b245e2](https://github.com/vuejs/vitepress/commit/1b245e22d8a00ea7c01c052ac1ea3d8d94aaeefb))

## [0.20.1](https://github.com/vuejs/vitepress/compare/v0.20.0...v0.20.1) (2021-11-05)

### Bug Fixes

- **hmr:** avoid relying on revertd vite hmr behavior ([4114674](https://github.com/vuejs/vitepress/commit/4114674c69f917ff2e611ec30eb72d224f175f62))

# [0.20.0](https://github.com/vuejs/vitepress/compare/v0.19.2...v0.20.0) (2021-10-07)

### Bug Fixes

- fix code line hightlighting ([4c042b6](https://github.com/vuejs/vitepress/commit/4c042b61e7beb70d0a0b77cc9a00d725c7863089)), closes [#408](https://github.com/vuejs/vitepress/issues/408)
- invalid active props when `base` option is added ([#342](https://github.com/vuejs/vitepress/issues/342)) ([383d8ff](https://github.com/vuejs/vitepress/commit/383d8ffbba5283774e0f1e39302a29efc0db7e79))
- make config hmr work in window ([#364](https://github.com/vuejs/vitepress/issues/364)) ([58663bb](https://github.com/vuejs/vitepress/commit/58663bbd02aa3da0efd939bd27de2ee5c0ab14d8))
- print urls again ([df69b76](https://github.com/vuejs/vitepress/commit/df69b76427ab2c770010cd79e1076a1c414fb3bc))
- support vite plugins provided via `config.vite` ([#394](https://github.com/vuejs/vitepress/issues/394)) ([4b76617](https://github.com/vuejs/vitepress/commit/4b7661762143b033e82fad526e256f7bc54df9af))
- **theme-default/algolia:** avoid creating multiple algolia searches ([#292](https://github.com/vuejs/vitepress/issues/292)) ([389e863](https://github.com/vuejs/vitepress/commit/389e863b4d5e69c856d1e647d4d4c1807bd94c5d))
- **theme:** fix algolia search filter ([5fd7db2](https://github.com/vuejs/vitepress/commit/5fd7db2b7fcd947d77c97b1e9bdaf83845c1321d))
- tolerant invalid hash ([#399](https://github.com/vuejs/vitepress/issues/399)) ([efc5e1b](https://github.com/vuejs/vitepress/commit/efc5e1b2566eedc47a9420accae3dfba1a594ba4))

### Features

- support ts/esm config file + defineConfig() helper ([d3b1521](https://github.com/vuejs/vitepress/commit/d3b1521ebef831e0d0307b3b12e4fc1f6ce4721a)), closes [#339](https://github.com/vuejs/vitepress/issues/339) [#376](https://github.com/vuejs/vitepress/issues/376)
- **theme-default:** home slot for customizing the entire homepage easily ([#314](https://github.com/vuejs/vitepress/issues/314)) ([07bf145](https://github.com/vuejs/vitepress/commit/07bf1451909ad615565e01d719e8a350ea07e69e))

## [0.19.2](https://github.com/vuejs/vitepress/compare/v0.19.1...v0.19.2) (2021-09-28)

### Bug Fixes

- encode urls that conflict w/ vite built-in replacements ([3940625](https://github.com/vuejs/vitepress/commit/3940625121455b7ad6e5ea8ebb3e1cf2faf9c7fc))

## [0.19.1](https://github.com/vuejs/vitepress/compare/v0.19.0...v0.19.1) (2021-09-21)

- Fix build

# [0.19.0](https://github.com/vuejs/vitepress/compare/v0.18.1...v0.19.0) (2021-09-21)

### Features

- upgrade vue, simplify deps ([9030486](https://github.com/vuejs/vitepress/commit/9030486409f10a59115d874b9365f71348ed76c2))
- use `markdown-it-attrs` for markdown-it plugins ([#393](https://github.com/vuejs/vitepress/issues/393)) ([610e9b7](https://github.com/vuejs/vitepress/commit/610e9b7111462d3aace878017fa4d359cd2ae7ea))

## [0.18.1](https://github.com/vuejs/vitepress/compare/v0.18.0...v0.18.1) (2021-09-16)

### Bug Fixes

- ensure stable pages entry order across builds ([929bcf5](https://github.com/vuejs/vitepress/commit/929bcf50ee634d9fe73adbe2aae5f7038b048e5a))

# [0.18.0](https://github.com/vuejs/vitepress/compare/v0.17.3...v0.18.0) (2021-09-14)

### Features

- map mode + remove deprecated options ([b94b163](https://github.com/vuejs/vitepress/commit/b94b163a3a931fe03e69547391d6ac22eb41b789))
- support `<script client>` in mpa mode ([e0b6997](https://github.com/vuejs/vitepress/commit/e0b69973f840bfa281fae209da1f1c674c1301a8))

## [0.17.3](https://github.com/vuejs/vitepress/compare/v0.17.2...v0.17.3) (2021-09-09)

### Bug Fixes

- emit prevented hashchange event ([4fb387d](https://github.com/vuejs/vitepress/commit/4fb387d94ea9d7ae28a871929cbbc57e931b8d7a))

## [0.17.2](https://github.com/vuejs/vitepress/compare/v0.17.1...v0.17.2) (2021-09-08)

### Bug Fixes

- improve fs allow ([2e9264f](https://github.com/vuejs/vitepress/commit/2e9264f03259354e7739e2a56a7c1306fb167843))

### Features

- support config.extends ([f749b27](https://github.com/vuejs/vitepress/commit/f749b272d4603a3b8eaf251b0feebe2d33da3983))

## [0.17.1](https://github.com/vuejs/vitepress/compare/v0.17.0...v0.17.1) (2021-09-08)

### Bug Fixes

- avoid using spread for client code ([03abee7](https://github.com/vuejs/vitepress/commit/03abee7f7c0fac95806f31ff5761b9e912a1f232))
- **default-theme:** use description as tagline by default ([b94c827](https://github.com/vuejs/vitepress/commit/b94c82710a7b230a918790ac0b6aa1d2f5afc1c3))
- handle case when there is no themeConfig ([034c737](https://github.com/vuejs/vitepress/commit/034c7375ad2de4b42c0ac861c2dd18183511771d))

### Performance Improvements

- minor optimizations ([96bcdda](https://github.com/vuejs/vitepress/commit/96bcddabedac9af4e1c817ed651bb4ce692c75e7))

# [0.17.0](https://github.com/vuejs/vitepress/compare/v0.16.1...v0.17.0) (2021-08-31)

### Bug Fixes

- allow vite server access to theme and local files ([9b9fdc7](https://github.com/vuejs/vitepress/commit/9b9fdc710a6cedb3e278805eb07bed669ca2075e))
- **code:** code block highlight bug in ul ([#352](https://github.com/vuejs/vitepress/issues/352)) ([9245226](https://github.com/vuejs/vitepress/commit/9245226b16f6113c722e5e8c7b876bea1cf1c255))
- **css:** remove 720px breakpoint in home layout ([#347](https://github.com/vuejs/vitepress/issues/347)) ([0c1a1f2](https://github.com/vuejs/vitepress/commit/0c1a1f2ef43cd7d995f3e9d43f19be8b3f961cb1))
- **i18n:** fix locales reading, add site.langs ([#353](https://github.com/vuejs/vitepress/issues/353)) ([bc78adb](https://github.com/vuejs/vitepress/commit/bc78adb468bce8ce2d4e2543423adacc9351cf51)), closes [/vuepress.vuejs.org/guide/i18n.html#site-level-i18](https://github.com//vuepress.vuejs.org/guide/i18n.html/issues/site-level-i18) [/v2.vuepress.vuejs.org/guide/i18n.html#site-i18](https://github.com//v2.vuepress.vuejs.org/guide/i18n.html/issues/site-i18)
- include emoji text in nav link to match toc ([#284](https://github.com/vuejs/vitepress/issues/284)) ([80ff360](https://github.com/vuejs/vitepress/commit/80ff36066ef6a4ed4a18548993bc5d8d9a6dab58))
- use useData() instead of $site ([#365](https://github.com/vuejs/vitepress/issues/365)) ([1e64773](https://github.com/vuejs/vitepress/commit/1e6477393308a5d8bd03a614cecf9573466f6e6c))

### Features

- support function config ([e74c5f0](https://github.com/vuejs/vitepress/commit/e74c5f06d1d5890fad6dd728df9bf85dcfda87d1))
- support partial include directive ([7b3a9e5](https://github.com/vuejs/vitepress/commit/7b3a9e59b44e9e354692eed6c1ca453be9cb7a86))
- upgrade markdown-it-anchor ([#350](https://github.com/vuejs/vitepress/issues/350)) ([26b5aa9](https://github.com/vuejs/vitepress/commit/26b5aa931f1935bd67dcd1d511461ff5fa8a00ec))

### BREAKING CHANGES

- the `markdown.anchor` option is updated. Refer to
  valeriangalliat/markdown-it-anchor#permalinks for
  instructions to upgrade your existing `markdown.anchor.permalink`
  option. **This doesn't affect you if you weren't changing the header
  permalinks behavior**.

## [0.16.1](https://github.com/vuejs/vitepress/compare/v0.16.0...v0.16.1) (2021-08-11)

### Features

- info custom container ([4925fb5](https://github.com/vuejs/vitepress/commit/4925fb5c29c59b7e17d050ab4346f71afc0463cd))

# [0.16.0](https://github.com/vuejs/vitepress/compare/v0.15.6...v0.16.0) (2021-08-10)

This version uses Vue 3.2.0.

### Bug Fixes

- override target and rel links attribute in config ([#332](https://github.com/vuejs/vitepress/issues/332)) ([9d98dbb](https://github.com/vuejs/vitepress/commit/9d98dbbe60d477a78d6dc0e80d16fdddedcd4ed5))
- **edit-link:** let frontmatter overwrite global editLink ([#340](https://github.com/vuejs/vitepress/issues/340)) ([cfbba80](https://github.com/vuejs/vitepress/commit/cfbba80a0a6e33bcb2ca3d4450fb9624dcd6d140))

## [0.15.6](https://github.com/vuejs/vitepress/compare/v0.15.5...v0.15.6) (2021-07-02)

### Bug Fixes

- automatically escape vite user defined variables in markdown ([3cec536](https://github.com/vuejs/vitepress/commit/3cec536c1f3d5d027ee16cd0629f84461e565096))
- skip external URLs in `withBase` ([#328](https://github.com/vuejs/vitepress/issues/328)) ([53bb961](https://github.com/vuejs/vitepress/commit/53bb961a925cbafe53730450c5b069e255b54e03))

## [0.15.5](https://github.com/vuejs/vitepress/compare/v0.15.4...v0.15.5) (2021-06-23)

### Bug Fixes

- **nav:** display nav if locales are present ([#321](https://github.com/vuejs/vitepress/issues/321)) ([e76e6ec](https://github.com/vuejs/vitepress/commit/e76e6ecd54f8a202a9d5051afd72553080f898c9))
- **search:** correctly detect multilang ([c046905](https://github.com/vuejs/vitepress/commit/c046905b032a765352ff6bb9944f72db76c5cf45)), closes [#316](https://github.com/vuejs/vitepress/issues/316)

### Performance Improvements

- only update necessary head tags in prod ([e6bb5a4](https://github.com/vuejs/vitepress/commit/e6bb5a4806bb16f1ace26f27f43b5ed83885bf1a))

## [0.15.4](https://github.com/vuejs/vitepress/compare/v0.15.3...v0.15.4) (2021-06-19)

### Bug Fixes

- avoid scroll behavior reliance on .nav-bar class ([9b35dfc](https://github.com/vuejs/vitepress/commit/9b35dfcde4c00e6f10b2631103f95e97cbf4af9e))

## [0.15.3](https://github.com/vuejs/vitepress/compare/v0.15.2...v0.15.3) (2021-06-15)

### Bug Fixes

- avoid error when theme does not have .nav-bar class ([a9d5800](https://github.com/vuejs/vitepress/commit/a9d580069fff90298b197808379cd0c4b756d463))
- avoid resetting head tags on hmr/page switch ([f52f20e](https://github.com/vuejs/vitepress/commit/f52f20e02f6908411ad9cddb341583456a3c2a8c))
- watch config file when using srcDir ([348f19a](https://github.com/vuejs/vitepress/commit/348f19a537930b1d4c7272e05e91edcb72219f34))

## [0.15.2](https://github.com/vuejs/vitepress/compare/v0.15.1...v0.15.2) (2021-06-15)

### Bug Fixes

- force optimize vue to avoid duplication when linked ([eefba39](https://github.com/vuejs/vitepress/commit/eefba398b0e5a4b5afb47ce6e06b0c39a6be55d2))

## [0.15.1](https://github.com/vuejs/vitepress/compare/v0.15.0...v0.15.1) (2021-06-14)

### Features

- support passing vite config in vitepress config file via `vite` option ([3737b10](https://github.com/vuejs/vitepress/commit/3737b1055dc1145dc70b10994564c6d83affd15d))
- support srcDir config option ([aaf4910](https://github.com/vuejs/vitepress/commit/aaf4910d938f4449fdab576ffd0ae853b5aace24))

### Performance Improvements

- avoid double resolve user config on startup ([5733fc6](https://github.com/vuejs/vitepress/commit/5733fc625ea33ab1b07ddfd4f8412e15473d8cca))

### BREAKING CHANGES

- Some config options have changed.

  - `vueOptions` renamed to `vue`
  - `alias` option has been removed. Use `vite.resovle.alias` instead.

# [0.15.0](https://github.com/vuejs/vitepress/compare/v0.14.1...v0.15.0) (2021-06-14)

### Bug Fixes

- fix frontmatter sidebarDepth for headers ([424a4ca](https://github.com/vuejs/vitepress/commit/424a4ca379f028e3542e2e9598cb5beacaf50067))
- fix vue code block type indication ([76fa173](https://github.com/vuejs/vitepress/commit/76fa1733fff4e3aa4356df08272e4811db996dab))

### Features

- more efficient `useData()` method that exposes all data ([0661063](https://github.com/vuejs/vitepress/commit/0661063d29c0e1dce108cac608be0ff754d2d4c1))

### BREAKING CHANGES

- The following methods are removed.

  - `useSiteData`
  - `useSiteDataByRoute`
  - `usePageData`
  - `useFrontmatter`

  Instead, use the new `useData()` method:

  ```js
  // before
  import { useSiteDataByRoute, usePageData } from 'vitepress'
  const site = useSiteDataByRoute()
  const page = usePageData()
  const theme = computed(() => site.value.themeConfig)

  // after
  import { useData } from 'vitepress'
  const { site, page, theme } = useData()
  ```

  All destructured values are computed refs injected from app root
  so they are created only once globally.

- All global mixin properties (e.g. `$site`) except `$frontmatter` are removed. Always use `useData()` to retrieve VitePress data in Vue components.

## [0.14.1](https://github.com/vuejs/vitepress/compare/v0.14.0...v0.14.1) (2021-06-08)

### Bug Fixes

- functional templates with vue v3.1 ([#312](https://github.com/vuejs/vitepress/issues/312)) ([8988aad](https://github.com/vuejs/vitepress/commit/8988aadbcbd781a81df0a8d1a4a6964d324c58a3))

# [0.14.0](https://github.com/vuejs/vitepress/compare/v0.13.2...v0.14.0) (2021-05-27)

### Bug Fixes

- chinese filenames can't build ([#217](https://github.com/vuejs/vitepress/issues/217)) ([#262](https://github.com/vuejs/vitepress/issues/262)) ([b940397](https://github.com/vuejs/vitepress/commit/b940397cd0e5135e7433bac6fc99da8553915053))
- **theme:** set search box min-width for >=751px ([#286](https://github.com/vuejs/vitepress/issues/286)) ([9589a5d](https://github.com/vuejs/vitepress/commit/9589a5d0e6458da07054a84d2df6ef99a5ad1dbd))
- detect public folder for dead link ([#290](https://github.com/vuejs/vitepress/issues/290)) ([3aa185f](https://github.com/vuejs/vitepress/commit/3aa185fa9f9dd49e32cfd60f96a30da8616e419e))
- remove unnecessary 'vite/dynamic-import-polyfill' ([6b4a4aa](https://github.com/vuejs/vitepress/commit/6b4a4aa7a6cd2f2e044a5cc54c5bf72a50f9df67))

### Features

- Vite version bumped to `^2.3.4`
- exclude option ([#281](https://github.com/vuejs/vitepress/issues/281)) ([71a5e1c](https://github.com/vuejs/vitepress/commit/71a5e1c2a2b552ced8a994dc60201c4be89b4ac9))
- Render titles for social sharing and improve home page sharing ([#263](https://github.com/vuejs/vitepress/issues/263)) ([e651f97](https://github.com/vuejs/vitepress/commit/e651f977d6b9f50fef25f6d736f8d4880c997305))

## [0.13.2](https://github.com/vuejs/vitepress/compare/v0.13.1...v0.13.2) (2021-04-26)

### Bug Fixes

- **search:** silence warning for prop ([0716ffa](https://github.com/vuejs/vitepress/commit/0716ffade743c65c240d616329c1a6bc3e83c4bd))

## [0.13.1](https://github.com/vuejs/vitepress/compare/v0.13.0...v0.13.1) (2021-04-26)

### Bug Fixes

- **locales:** use correct lang ([#283](https://github.com/vuejs/vitepress/issues/283)) ([de89c1e](https://github.com/vuejs/vitepress/commit/de89c1e5ebf09557532eec93269b7143f454f9d1))

# [0.13.0](https://github.com/vuejs/vitepress/compare/v0.12.2...v0.13.0) (2021-04-08)

### Bug Fixes

- build fails without css chunks ([#209](https://github.com/vuejs/vitepress/issues/209)) ([#239](https://github.com/vuejs/vitepress/issues/239)) ([fa469fd](https://github.com/vuejs/vitepress/commit/fa469fd2750ac74417238de7547cd8e7cd939cb0))
- **css:** reuse css vars ([#256](https://github.com/vuejs/vitepress/issues/256)) ([8d91524](https://github.com/vuejs/vitepress/commit/8d915245c6740874abad0e11f374703aa07afec3))
- **docs:** global-component link ([#271](https://github.com/vuejs/vitepress/issues/271)) ([a43933c](https://github.com/vuejs/vitepress/commit/a43933c8ab4474c905005a337da3620621878a1c))
- **locales:** use correct lang ([#276](https://github.com/vuejs/vitepress/issues/276)) ([f505db9](https://github.com/vuejs/vitepress/commit/f505db945af3ca4e4ce0a06b5aa2a4d32d47bac7))
- **navbar:** use css var for background-color ([#264](https://github.com/vuejs/vitepress/issues/264)) ([f385bc4](https://github.com/vuejs/vitepress/commit/f385bc467306c075871485e6a9bfe773fc9054a1))
- badge for language-javascript ([#245](https://github.com/vuejs/vitepress/issues/245)) ([f8b4aa5](https://github.com/vuejs/vitepress/commit/f8b4aa5baa7f2fba843427f2f4f3985222c3c78d))

### Features

- detect dead links ([74f5ada](https://github.com/vuejs/vitepress/commit/74f5adafcde8a597939fbb37422aa68187b6dad4))
- import code snippet with region ([#237](https://github.com/vuejs/vitepress/issues/237)) ([#238](https://github.com/vuejs/vitepress/issues/238)) ([d1a62e1](https://github.com/vuejs/vitepress/commit/d1a62e1c6630b289777b78eea359acd49174148d))

## [0.12.2](https://github.com/vuejs/vitepress/compare/v0.12.1...v0.12.2) (2021-02-15)

### Bug Fixes

- **theme-default:** avoid ad image distortion on mobile ([4a40e1f](https://github.com/vuejs/vitepress/commit/4a40e1faf477c4e779b78f55ac1604eeb52b2499))

## [0.12.1](https://github.com/vuejs/vitepress/compare/v0.12.0...v0.12.1) (2021-02-15)

### Bug Fixes

- `@` alias for import code snippet being always `undefined` ([#204](https://github.com/vuejs/vitepress/issues/204)) ([2aa8ab2](https://github.com/vuejs/vitepress/commit/2aa8ab26e2fcf87ced27999c0be67798d5b4bb88))
- `base` option not generating correct multi sidebar ([#231](https://github.com/vuejs/vitepress/issues/231)) ([#234](https://github.com/vuejs/vitepress/issues/234)) ([a613df4](https://github.com/vuejs/vitepress/commit/a613df46e8cd7709dd2ad0f411ff52aa431850b6))
- ads display causing layout break in mobile view ([#230](https://github.com/vuejs/vitepress/issues/230)) ([7ceaf34](https://github.com/vuejs/vitepress/commit/7ceaf344d20f8a51c0452eed264e07b47d104043))
- home action link not being reactive ([#195](https://github.com/vuejs/vitepress/issues/195)) ([#212](https://github.com/vuejs/vitepress/issues/212)) ([5678dc3](https://github.com/vuejs/vitepress/commit/5678dc3a255c90309d5d7d9b609f3dc7ec7f9d00))
- nav home title not having locale based link ([#195](https://github.com/vuejs/vitepress/issues/195)) ([#233](https://github.com/vuejs/vitepress/issues/233)) ([6538c8e](https://github.com/vuejs/vitepress/commit/6538c8e70aac60823fd2374e36cb502420184b44))

# [0.12.0](https://github.com/vuejs/vitepress/compare/v0.11.5...v0.12.0) (2021-02-09)

### Bug Fixes

- `base` option not working on dev mode ([#223](https://github.com/vuejs/vitepress/issues/223)) ([0b5b306](https://github.com/vuejs/vitepress/commit/0b5b306f85ada7e670345d31cb52931d0e46f784))
- frontmatter description duplication ([#194](https://github.com/vuejs/vitepress/issues/194)) ([#170](https://github.com/vuejs/vitepress/issues/170)) ([338e845](https://github.com/vuejs/vitepress/commit/338e8453d8c5f3955923d98bafcbb92261a8f045))
- sidebar 'auto' not working ([#178](https://github.com/vuejs/vitepress/issues/178)) ([#224](https://github.com/vuejs/vitepress/issues/224)) ([5deaf6a](https://github.com/vuejs/vitepress/commit/5deaf6a2cdeb1622ae5afc1c8e522d57ff39e4e1))
- render document with standards mode in dev ([#207](https://github.com/vuejs/vitepress/issues/207)) ([8a0db65](https://github.com/vuejs/vitepress/commit/8a0db65a8a8939e4505b004b884e9395e25e983b))
- utf-8 character not working on safari in dev mode ([#228](https://github.com/vuejs/vitepress/issues/228)) ([b82d8f2](https://github.com/vuejs/vitepress/commit/b82d8f2ecee31d6ffdc6f74b0bad4fe2c74d40de))
- use brand color in algolia search box ([2330023](https://github.com/vuejs/vitepress/commit/2330023d99741ea18fd606a7601ab19815333f7c))

### Features

- add vue options config (expose @vitejs/plugin-vue) ([#215](https://github.com/vuejs/vitepress/issues/215)) ([5b34c6a](https://github.com/vuejs/vitepress/commit/5b34c6a94ad7d2eecf667844c60504e776f15afc))

### BREAKING CHANGES

- If sidebar option is `undefined` it will be treated as `auto`, where previsouly it looked like it was treated as `false`. It was always treated as `auto`, but due to [this bug](https://github.com/vuejs/vitepress/issues/178), the sidebar was hidden, therefore it looked like it was treated as `false`.

## [0.11.5](https://github.com/vuejs/vitepress/compare/v0.11.4...v0.11.5) (2021-01-29)

### Bug Fixes

- avoid layout shift due to ads ([#176](https://github.com/vuejs/vitepress/issues/176)) ([78b026c](https://github.com/vuejs/vitepress/commit/78b026cb7aa5b40a7dd98a1337646b38b1fc5367))
- support symbolic links in building docs dist ([#184](https://github.com/vuejs/vitepress/issues/184)) ([#185](https://github.com/vuejs/vitepress/issues/185)) ([5190604](https://github.com/vuejs/vitepress/commit/51906043d318b2485ea8fc3aff4b4644c95dd3f4))
- update base option usage ([8cfdd19](https://github.com/vuejs/vitepress/commit/8cfdd1912dda9153daa7cb4db8e5c9f0cab4d654))

### Features

- $lang and $localePath globals ([#166](https://github.com/vuejs/vitepress/issues/166)) ([#167](https://github.com/vuejs/vitepress/issues/167)) ([481c451](https://github.com/vuejs/vitepress/commit/481c4513d78450951add6177824b7996b89ae034))

## [0.11.4](https://github.com/vuejs/vitepress/compare/v0.11.3...v0.11.4) (2021-01-19)

- Latest Vite beta.32 compat (internal changes).

## [0.11.3](https://github.com/vuejs/vitepress/compare/v0.11.2...v0.11.3) (2021-01-13)

### Bug Fixes

- ignore non-html links in router and prefetch ([3e6e61b](https://github.com/vuejs/vitepress/commit/3e6e61bcea8d4a34079428fcce3ecd25af1ae4f7))

## [0.11.2](https://github.com/vuejs/vitepress/compare/v0.11.1...v0.11.2) (2021-01-12)

### Bug Fixes

- aria label id ([a0f463a](https://github.com/vuejs/vitepress/commit/a0f463af8fd828d24d9a01c3d808d85af8a71c9f))

### Performance Improvements

- generate preload directives for dynamicImport chunks too ([b9fc0cb](https://github.com/vuejs/vitepress/commit/b9fc0cb78d43949b417376498939daa892a33334))

## [0.11.1](https://github.com/vuejs/vitepress/compare/v0.11.0...v0.11.1) (2021-01-12)

### Features

- render content on home page ([ca631c7](https://github.com/vuejs/vitepress/commit/ca631c7f516ad6c643d252dd81e03e29fb3b9e05))

# [0.11.0](https://github.com/vuejs/vitepress/compare/v0.10.8...v0.11.0) (2021-01-12)

### Code Refactoring

- move default theme to 'vitepress/theme' ([a79e1e1](https://github.com/vuejs/vitepress/commit/a79e1e1916a71271728e6fe7c2b734fc2f209518))

### Features

- support customData in config ([4072dc5](https://github.com/vuejs/vitepress/commit/4072dc5f7ede381709fce49e9a29d6af4f7ab81a))

### BREAKING CHANGES

- the default theme is now exposed via 'vitepress/theme',
  instead of a named export from 'vitepress'. This change fixes the case where
  when a completely custom theme is used, importing anything from 'vitepress'
  also imports the entire default theme.

## [0.10.8](https://github.com/vuejs/vitepress/compare/v0.10.7...v0.10.8) (2021-01-11)

### Bug Fixes

- resolve page hash case-insenstively, close [#202](https://github.com/vuejs/vitepress/issues/202) ([#203](https://github.com/vuejs/vitepress/issues/203)) ([bac1ce2](https://github.com/vuejs/vitepress/commit/bac1ce2d01469ff7586437f43b0d665b1c5eb278))

## [0.10.7](https://github.com/vuejs/vitepress/compare/v0.10.6...v0.10.7) (2021-01-05)

### Features

Bump to Vite 2.0.0-beta.8

### Bug Fixes

- scrollbar when using line highlight ([#200](https://github.com/vuejs/vitepress/issues/200)) ([b6ba8a9](https://github.com/vuejs/vitepress/commit/b6ba8a943cc0488410a438c6c2f277c1c33a90bf))

## [0.10.6](https://github.com/vuejs/vitepress/compare/v0.10.5...v0.10.6) (2021-01-04)

### Bug Fixes

- bump vite and fix win32 path resolving ([#198](https://github.com/vuejs/vitepress/issues/198)) ([da2c4f6](https://github.com/vuejs/vitepress/commit/da2c4f694e6dd2d11ff061b8eb7cae2354ae930d))

## [0.10.5](https://github.com/vuejs/vitepress/compare/v0.10.4...v0.10.5) (2021-01-02)

### Bug Fixes

- vite 2.0.0-beta.2 compat ([991a443](https://github.com/vuejs/vitepress/commit/991a443c70c6173aa0100fcccf57f3565e9e38d9))

## [0.10.4](https://github.com/vuejs/vitepress/compare/v0.10.3...v0.10.4) (2021-01-01)

### Bug Fixes

- ensure the same vue dep in all cases ([d6b8568](https://github.com/vuejs/vitepress/commit/d6b8568c52d51d66423a32293879f8bb57756954))
- respect root during build ([055e3fd](https://github.com/vuejs/vitepress/commit/055e3fd043b6ec425f1b0a0cf529bc1ff66acda5))

## [0.10.3](https://github.com/vuejs/vitepress/compare/v0.10.2...v0.10.3) (2021-01-01)

### Bug Fixes

- always define theme globals ([8769b4b](https://github.com/vuejs/vitepress/commit/8769b4b49f398c5244354fbb93fcbecdb9b9c638))
- avoid unexpected vite define replacements in markdown content ([a41928e](https://github.com/vuejs/vitepress/commit/a41928ef83eaf9dcb68be26b1e1f8a3edadfb74a))
- loosen navLink active matching ([8a2ff33](https://github.com/vuejs/vitepress/commit/8a2ff33bf8043b5b0ec21826d7962d7e6337e394))

### Features

- **theme-default:** nav.item.activeMatch ([e262ef6](https://github.com/vuejs/vitepress/commit/e262ef63d89b2bc90c7e42bfc302ba6c602fab16))
- add altAction for home ([9a17ddf](https://github.com/vuejs/vitepress/commit/9a17ddfdfb3cf7afd70d28d697245a298de090e1))

## [0.10.2](https://github.com/vuejs/vitepress/compare/v0.10.1...v0.10.2) (2020-12-31)

### Bug Fixes

- adjust multi sidebar matching logic ([7e4b16e](https://github.com/vuejs/vitepress/commit/7e4b16ee524efc87c150a3d57a3215aac76b3669))

## [0.10.1](https://github.com/vuejs/vitepress/compare/v0.10.0...v0.10.1) (2020-12-30)

### Bug Fixes

- disable css code split ([04dc058](https://github.com/vuejs/vitepress/commit/04dc058cd9977b47eb29c6d2d043e33d92802af8))
- minify ([e3d7fc0](https://github.com/vuejs/vitepress/commit/e3d7fc035376d6d73e350be661925058c84828a8))

### Features

- production ready serve ([2d77eaf](https://github.com/vuejs/vitepress/commit/2d77eafe3b05e9fe76031af9a6c5386c4c6586ac))

### Performance Improvements

- avoid including optional features in build when not used ([c878e6d](https://github.com/vuejs/vitepress/commit/c878e6d3b56ecbd71bd75ff4360446d6dacbd70b))

# [0.10.0](https://github.com/vuejs/vitepress/compare/v0.9.2...v0.10.0) (2020-12-30)

- Upgrade to Vite 2.0

### Bug Fixes

- port fixes to parseHeader utils from vuepress ([#172](https://github.com/vuejs/vitepress/issues/172)) ([dd312ce](https://github.com/vuejs/vitepress/commit/dd312ce86bf9daf4b169e025d4215c05e2ad63c5))
- revert datetime handling ([a1daf2b](https://github.com/vuejs/vitepress/commit/a1daf2b8a012a8a248b3a832d80d6933778087d0))
- style pollution on custom theme ([#190](https://github.com/vuejs/vitepress/issues/190)) ([46e99ba](https://github.com/vuejs/vitepress/commit/46e99babc2d1a0e456d47081c2e7beb961bcd1d5))
- temporarily disable slot usage causing hydration mismatch ([0239159](https://github.com/vuejs/vitepress/commit/02391593bcdd21b621a60aaa0ea2c8cf2ef450d8))
- **md:** avoid normalising markdown "mailto:" links ([#173](https://github.com/vuejs/vitepress/issues/173)) ([18d18d2](https://github.com/vuejs/vitepress/commit/18d18d2eb15a569113ca68ccbb9ba52dfd46c80a))

## [0.9.2](https://github.com/vuejs/vitepress/compare/v0.9.1...v0.9.2) (2020-12-10)

Fix build files

## [0.9.1](https://github.com/vuejs/vitepress/compare/v0.9.0...v0.9.1) (2020-12-05)

### Bug Fixes

- **theme:** the actionLink miss withBase ([#168](https://github.com/vuejs/vitepress/issues/168)) ([#169](https://github.com/vuejs/vitepress/issues/169)) ([ffaca73](https://github.com/vuejs/vitepress/commit/ffaca73992675cef789fe8e13dd8132ae14bbd53))
- align $title with vuepress ([#158](https://github.com/vuejs/vitepress/issues/158)) ([#163](https://github.com/vuejs/vitepress/issues/163)) ([30740d3](https://github.com/vuejs/vitepress/commit/30740d3516e3f7cce0e083faa90a732d9916f9af))
- fix h2 anchor hover ([9bd79e8](https://github.com/vuejs/vitepress/commit/9bd79e8de1827251796d1647b5d258818a94f3b3)), closes [#174](https://github.com/vuejs/vitepress/issues/174)
- fix inline code not inheriting the parent font size ([f5a570f](https://github.com/vuejs/vitepress/commit/f5a570f640c539d96cfa2104613521a70cf2f199))
- fix link prefetch ([ade6ddd](https://github.com/vuejs/vitepress/commit/ade6dddbb5ea72cc7569fcfc46f5e6a362af58ce))
- hydration mismatch when home page having action link ([a7686b7](https://github.com/vuejs/vitepress/commit/a7686b7691a3e3d7d10226fd4f7971929701965a))
- make home page look better ([#154](https://github.com/vuejs/vitepress/issues/154)) ([a084cd3](https://github.com/vuejs/vitepress/commit/a084cd3f782f2aaf78a6542b0c86f67676580a73))
- prevLinks and nextLinks config type ([#165](https://github.com/vuejs/vitepress/issues/165)) ([1b6981a](https://github.com/vuejs/vitepress/commit/1b6981a9157588bc4e29e591ba8a0d9ca5c9c9e8))
- siteData passed to enhanceApp being siteDataByRoute ([#159](https://github.com/vuejs/vitepress/issues/159)) ([01d2837](https://github.com/vuejs/vitepress/commit/01d2837474caef19daaf0be4b3c283dbe85a09da))

### Features

- built-in ClientOnly component ([8809d2d](https://github.com/vuejs/vitepress/commit/8809d2dbfc6818ba1618fa43368a45130d940890))
- **default-theme:** support customLayout: true in frontmatter ([f32771f](https://github.com/vuejs/vitepress/commit/f32771fe8646701410ba4b231a2b0ce38230ab64))
- add `$withBase` global app function ([15e18df](https://github.com/vuejs/vitepress/commit/15e18df01e6e5ca8af605365896fee0024244b37))
- add Algolia DocSearch ([#40](https://github.com/vuejs/vitepress/issues/40)) ([#153](https://github.com/vuejs/vitepress/issues/153)) ([5bb4730](https://github.com/vuejs/vitepress/commit/5bb4730f7f48153ae006d7878431d0b58b0fffee))
- add native support for carbon ads ([#86](https://github.com/vuejs/vitepress/issues/86)) ([9d6b8ca](https://github.com/vuejs/vitepress/commit/9d6b8cadcc6cd59bde6b9b20037f9038190672ce))
- support customizing default theme via slots ([b8e892e](https://github.com/vuejs/vitepress/commit/b8e892e94a2fd2cedf7b25651548a08a758ccbdb))
- add more global and computed properties (#152) ([c6bdcfb](https://github.com/vuejs/vitepress/commit/c6bdcfbf4f14916f20a7192b44941d33d4bee51e)), closes [#152](https://github.com/vuejs/vitepress/issues/152)

# [0.9.0](https://github.com/vuejs/vitepress/compare/v0.8.1...v0.9.0) (2020-11-24)

### Bug Fixes

- avoid 300ms click delay on touch devices ([621ca3e](https://github.com/vuejs/vitepress/commit/621ca3e26f65e13e504724aef76aba3f3361ce81))
- fix nested list having too much margin ([b0cf2be](https://github.com/vuejs/vitepress/commit/b0cf2be5614505731a3b6dcebeab949c3639c2b2))
- fix sidebar active status not working as expected ([#140](https://github.com/vuejs/vitepress/issues/140)) ([#149](https://github.com/vuejs/vitepress/issues/149)) ([0b181e7](https://github.com/vuejs/vitepress/commit/0b181e7582ea4be7dca51ec399c697e32b7116f3))
- make code block look prettier ([#146](https://github.com/vuejs/vitepress/issues/146)) ([242fcc1](https://github.com/vuejs/vitepress/commit/242fcc1098f606f13e7d8e123c081e73a3d89366))
- some color in code block not working as expected ([#143](https://github.com/vuejs/vitepress/issues/143)) ([da09266](https://github.com/vuejs/vitepress/commit/da09266f5eede3796bb150ccd9d6a173e90354a4))

### Features

- add "last updated" feature ([40d204b](https://github.com/vuejs/vitepress/commit/40d204b2f68b90bd2c5e9940cd128c4c16cd5274))

## [0.8.1](https://github.com/vuejs/vitepress/compare/v0.8.0...v0.8.1) (2020-11-20)

### Bug Fixes

- fix "next and prev link" not working when `link` has extention ([6dcf6b3](https://github.com/vuejs/vitepress/commit/6dcf6b3796bb3d6e703fddd79c6b0c0a7adfd567))
- fix "next and prev links" not working when the `base` option is set ([#139](https://github.com/vuejs/vitepress/issues/139)) ([018a9b4](https://github.com/vuejs/vitepress/commit/018a9b46d924d0d08f7ff67f18a813348c84ab0a))

# [0.8.0](https://github.com/vuejs/vitepress/compare/v0.7.4...v0.8.0) (2020-11-20)

### Bug Fixes

- exit process with non-zero code on error ([fb09f8e](https://github.com/vuejs/vitepress/commit/fb09f8e638c06aec32494f731554fb1b989daaf0))
- fix edit link and prev and next links display ([#97](https://github.com/vuejs/vitepress/issues/97)) ([c3b7172](https://github.com/vuejs/vitepress/commit/c3b71729513592112e233165782e60c9c5b425c4))
- fix next and prev links not working ([#130](https://github.com/vuejs/vitepress/issues/130)) ([fdd498b](https://github.com/vuejs/vitepress/commit/fdd498be70cc09a4331dadd17c4a5339318f21bf))
- display header-anchor links when using keyboard navigation ([ddc3640](https://github.com/vuejs/vitepress/commit/ddc3640ce66f606894b31e1b7ebeacaaf7b0f1b5))
- show top part of scrollbar in sidebar ([#129](https://github.com/vuejs/vitepress/issues/129)) ([1ba209a](https://github.com/vuejs/vitepress/commit/1ba209a4d2b606bee1abb7ec1d383467d98cf198))

### Features

- add ability to configure markdown options ([#127](https://github.com/vuejs/vitepress/issues/127)) ([#128](https://github.com/vuejs/vitepress/issues/128)) ([463a03a](https://github.com/vuejs/vitepress/commit/463a03a9815ce8fc9f55293dda07bc211ef4f62b))
- add serve command ([#136](https://github.com/vuejs/vitepress/issues/136)) ([67868bd](https://github.com/vuejs/vitepress/commit/67868bd9281077a4ce708e666bf61a7824afb8b2))
- better build command output ([e435eec](https://github.com/vuejs/vitepress/commit/e435eec94a841ab0e1c14d59bb13608d5ad6a011))

## [0.7.4](https://github.com/vuejs/vitepress/compare/v0.7.3...v0.7.4) (2020-11-11)

### Bug Fixes

- **css:** fix padding on mobile ([9c7293b](https://github.com/vuejs/vitepress/commit/9c7293b6cbdbcabb4257793e1b1f3fea2388c31e)), closes [#121](https://github.com/vuejs/vitepress/issues/121)

## [0.7.3](https://github.com/vuejs/vitepress/compare/v0.7.2...v0.7.3) (2020-11-06)

### Bug Fixes

- Fix sidebar page switch layout shifting
- Fix production hydration mismatch

## [0.7.2](https://github.com/vuejs/vitepress/compare/v0.7.1...v0.7.2) (2020-11-02)

### Bug Fixes

- adapt to vite fix of ssr build asset paths ([6b3fbe3](https://github.com/vuejs/vitepress/commit/6b3fbe31a31adad2a836c45905bde86332e4f1f6))

### Features

- add home page feature ([#108](https://github.com/vuejs/vitepress/issues/108)) ([3a0af0b](https://github.com/vuejs/vitepress/commit/3a0af0b6141ed739aa4a2d72f43d0fa63739c695))

## [0.7.1](https://github.com/vuejs/vitepress/compare/v0.7.0...v0.7.1) (2020-10-30)

### Bug Fixes

- compat with latest vite + handle no export default script tags in md ([b10da2f](https://github.com/vuejs/vitepress/commit/b10da2f47b456a10e62f16e2cd08d6983da041c0))
- fix switch language error ([#103](https://github.com/vuejs/vitepress/issues/103), [#106](https://github.com/vuejs/vitepress/issues/106)) ([#104](https://github.com/vuejs/vitepress/issues/104)) ([d354d1e](https://github.com/vuejs/vitepress/commit/d354d1ef2211cc8734a7228d56f27b014af7a4f9))

# [0.7.0](https://github.com/vuejs/vitepress/compare/v0.6.0...v0.7.0) (2020-10-19)

### Bug Fixes

- **css:** theme specific ([6891092](https://github.com/vuejs/vitepress/commit/6891092b90d5a405a718b08b30c7be5260adef47))
- **router:** remove fakeHost when fixing url extenions ([2eb3135](https://github.com/vuejs/vitepress/commit/2eb31358bf4790a08f43c102691df75023382ce5))

### Features

- **client:** add slot for a searchbar ([68d9b18](https://github.com/vuejs/vitepress/commit/68d9b18f391b9ad1dd8d800296a6117119e397b5))
- **i18n:** add nav dropdown language selector feature ([#91](https://github.com/vuejs/vitepress/issues/91)) ([294836c](https://github.com/vuejs/vitepress/commit/294836ce40afcb9e3af8146575d06bf386bfe1a1))
- **sidebar:** close when navigating ([2094d53](https://github.com/vuejs/vitepress/commit/2094d534dbe9f84d308fbf130dabbf6155a33005))
- add doctype html ([02f2e10](https://github.com/vuejs/vitepress/commit/02f2e10f89881d99bf3c016477da788c25ef207f))
- add some space between 2 code blocks ([5daa8d2](https://github.com/vuejs/vitepress/commit/5daa8d2c38d3c8352b340ad1f5fd4a67d1fdb09b))

# [0.6.0](https://github.com/vuejs/vitepress/compare/v0.5.0...v0.6.0) (2020-09-17)

### Bug Fixes

- **client:** use relative import ([725a04c](https://github.com/vuejs/vitepress/commit/725a04cdf02f208c85de01e4f1e74168511b95aa))
- **links:** keep relative hash links as is ([a90d971](https://github.com/vuejs/vitepress/commit/a90d971b40d775e2bac19bcfd17cbeafbc878d34))
- **router:** allow open new tab with ctrl + click ([#69](https://github.com/vuejs/vitepress/issues/69)) ([092ee77](https://github.com/vuejs/vitepress/commit/092ee772dafa78a66c2e35524bd921eb0aa31b16))
- **sidebar:** no margin on mobile ([#89](https://github.com/vuejs/vitepress/issues/89)) ([218c729](https://github.com/vuejs/vitepress/commit/218c72915489e25e1d6ca7b09979c45abf64a3a3))
- sidebar not working correctly when path starts with slash ([610cc17](https://github.com/vuejs/vitepress/commit/610cc17af0624d82d0eb3ed652f0b5fa1c2402f0))
- **sidebar:** fix sidebar when you open a nested link ([#73](https://github.com/vuejs/vitepress/issues/73)) ([d2b6d39](https://github.com/vuejs/vitepress/commit/d2b6d39228a03ad122ab09420dab2cba2c2b4167))

### Features

- add blockquote styling ([8c1aada](https://github.com/vuejs/vitepress/commit/8c1aada6288609c2f01c14f353359a14d1264244))
- add charset and viewport meta tags ([#77](https://github.com/vuejs/vitepress/issues/77)) ([2e8e1f5](https://github.com/vuejs/vitepress/commit/2e8e1f57cc7618c4cbc198153dde3927b076b08c))
- add git repo link and edit links ([#55](https://github.com/vuejs/vitepress/issues/55)) ([0ea34cb](https://github.com/vuejs/vitepress/commit/0ea34cbb1de0db8a2ff34bb858c2904c89369ccd))
- add prev/next links ([#56](https://github.com/vuejs/vitepress/issues/56)) ([f52b1d5](https://github.com/vuejs/vitepress/commit/f52b1d576b024443f737604d2220a0edb1571355))
- add responsive sidebar support ([#75](https://github.com/vuejs/vitepress/issues/75)) ([39dbd78](https://github.com/vuejs/vitepress/commit/39dbd7806e96e18e60de87311ae7b162ebb61c3c))
- add table css from vuepress ([#88](https://github.com/vuejs/vitepress/issues/88)) ([8435e36](https://github.com/vuejs/vitepress/commit/8435e36374e2d5c96bbab781f378602e2372f5d4))
- close the sidebar when clicking outside of the sidebar ([#78](https://github.com/vuejs/vitepress/issues/78)) ([e93ee09](https://github.com/vuejs/vitepress/commit/e93ee094ea5696d692323546738d0643ed82f154))
- navlinks in sidebar ([#80](https://github.com/vuejs/vitepress/issues/80)) ([a20bcf3](https://github.com/vuejs/vitepress/commit/a20bcf3cd7c4d8e243d6547f099b9fdc702ee350))
- overwrite prev/next link ([#61](https://github.com/vuejs/vitepress/issues/61)) ([1b96f63](https://github.com/vuejs/vitepress/commit/1b96f631b83585591a1436b8a7dadf52fad61c25))
- support config alias ([#59](https://github.com/vuejs/vitepress/issues/59)) ([63a3691](https://github.com/vuejs/vitepress/commit/63a36919601df678a0f8225627d66dff67c81c3a))
- top and bottom slots for sidebar and page ([#90](https://github.com/vuejs/vitepress/issues/90)) ([1106013](https://github.com/vuejs/vitepress/commit/11060136c4bf2ec1d39e0d0d6951b9093e3edc06))
- **sidebar:** use base when creating link ([#74](https://github.com/vuejs/vitepress/issues/74)) ([79bc9fb](https://github.com/vuejs/vitepress/commit/79bc9fb15a9560932228f22e7bd152272d577da6))

# [0.5.0](https://github.com/vuejs/vitepress/compare/v0.4.1...v0.5.0) (2020-07-21)

### Bug Fixes

- decode hash before selecting ([e782c4c](https://github.com/vuejs/vitepress/commit/e782c4cb86dbb8ff294d0670e171692651618a0e))
- fix navbar withBase ([e9ab56b](https://github.com/vuejs/vitepress/commit/e9ab56b0dbe859c0a147e2a2755bfcf2c0b92904))
- typings field in package.json ([#48](https://github.com/vuejs/vitepress/issues/48)) ([692a490](https://github.com/vuejs/vitepress/commit/692a490986ab81eb5be5bc7fdce0434ce84aa620))

### Features

- add external link support for nav items ([#46](https://github.com/vuejs/vitepress/issues/46)) ([44e91bb](https://github.com/vuejs/vitepress/commit/44e91bb98631c843f9accad1cffd24fbc6337fe0))
- add multi sidebar support ([#38](https://github.com/vuejs/vitepress/issues/38)) ([#49](https://github.com/vuejs/vitepress/issues/49)) ([050fa4c](https://github.com/vuejs/vitepress/commit/050fa4cf245f9f33d25684f8bcf218a6b5d6dedb))
- i18n support ([#50](https://github.com/vuejs/vitepress/issues/50)) ([7802cb5](https://github.com/vuejs/vitepress/commit/7802cb55c2a82cc1878fc1ebc4dc2fcf1f2f1ff0))
- nav dropdown ([#51](https://github.com/vuejs/vitepress/issues/51)) ([5780461](https://github.com/vuejs/vitepress/commit/578046145ff4ef445f7a7704016ab791a4ef330f))

## [0.4.1](https://github.com/vuejs/vitepress/compare/v0.4.0...v0.4.1) (2020-07-02)

### Bug Fixes

- avoid error when requesting non-existing md file ([e77ea63](https://github.com/vuejs/vitepress/commit/e77ea6323720f19d7401cb1a9fa94d1963f29e15))
- resolve relative path on windows ([#27](https://github.com/vuejs/vitepress/issues/27)) ([9116c9c](https://github.com/vuejs/vitepress/commit/9116c9c3e06071f34b523cb488d9e5d963808a3c))
- use resolve instead of join ([#33](https://github.com/vuejs/vitepress/issues/33)) ([6f10ed6](https://github.com/vuejs/vitepress/commit/6f10ed6c63b7486f678fdd7eedc888925feb473c))

### Features

- add array sidebar support ([#35](https://github.com/vuejs/vitepress/issues/35)) ([4a8388e](https://github.com/vuejs/vitepress/commit/4a8388e113f978f6afc6936a86b06effc42a8304))

# [0.4.0](https://github.com/vuejs/vitepress/compare/v0.3.1...v0.4.0) (2020-06-19)

## [0.3.1](https://github.com/vuejs/vitepress/compare/v0.3.0...v0.3.1) (2020-06-05)

### Bug Fixes

- avoid using **DEV** + throttle active header link ([a63b0cf](https://github.com/vuejs/vitepress/commit/a63b0cf69a4d1f8b1b7e44f76c6283f28d437b59))

# [0.3.0](https://github.com/vuejs/vitepress/compare/v0.2.0...v0.3.0) (2020-06-02)

### Bug Fixes

- lazy load @vue/server-render for production build ([382e1b6](https://github.com/vuejs/vitepress/commit/382e1b6514035f69dc9e505fad38a781cd35166e))

### Features

- active sidebar links ([d2ea963](https://github.com/vuejs/vitepress/commit/d2ea9637eeafc1c1510d038f1f749e650a086a32))

# [0.2.0](https://github.com/vuejs/vitepress/compare/v0.1.1...v0.2.0) (2020-05-22)

### Bug Fixes

- avoid unnecessary prefetches ([0a81525](https://github.com/vuejs/vitepress/commit/0a815255b9f226ec5ac032d6db5b151caa9c58fb))
- handle links that embed other elements ([#2](https://github.com/vuejs/vitepress/issues/2)) ([4cbfc60](https://github.com/vuejs/vitepress/commit/4cbfc60a58f7b7ef0d82c6a2b1a48b67ace3d924))

### Features

- copy public dir ([ddc9d51](https://github.com/vuejs/vitepress/commit/ddc9d519c60423e2432c1f3c0ab5b2ccbabd34a6))
- lean builds ([b61e239](https://github.com/vuejs/vitepress/commit/b61e2398fc40be98cd8372834fa3b1e5277c8e1f))
- prefetch in viewport inbound page chunks ([da4852a](https://github.com/vuejs/vitepress/commit/da4852a61bd73a8b46c4971c330f95761237c733))
- use hashed page file names ([a873564](https://github.com/vuejs/vitepress/commit/a8735646e8aae04d7091decc8c4fd54025ceb181))
- use modulepreload links ([0025af1](https://github.com/vuejs/vitepress/commit/0025af12f4ec8e021ea1b7b9d48b0b4025924d83))

### Performance Improvements

- inject script tags for page common chunk imports ([57d900d](https://github.com/vuejs/vitepress/commit/57d900d4b357f15f3dec28e822bd5fd8d100d589))

## 0.1.1 (2020-04-30)

- fix dependency versions

# 0.1.0 (2020-04-30)

### Features

- add markdown processing ([5c47bbb](https://github.com/vuejs/vitepress/commit/5c47bbb4638d7f78ae38fe02732f5b639654c134))
- spa navigation ([21d3cd8](https://github.com/vuejs/vitepress/commit/21d3cd8cbe4102293d2903c3d060764d86a8f785))
- update head tags during dev ([bdbbdd5](https://github.com/vuejs/vitepress/commit/bdbbdd556fe7e3906a5997291ff692cf2b78d632))
- update title & description during dev ([0b9bf27](https://github.com/vuejs/vitepress/commit/0b9bf273ef4f31bf448f7813c50e474b4035b7dc))
