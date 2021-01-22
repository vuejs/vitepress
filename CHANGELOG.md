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
