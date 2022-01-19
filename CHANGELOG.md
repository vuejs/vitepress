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
