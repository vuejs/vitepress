# [0.5.0](https://github.com/vuejs/vitepress/compare/v0.4.1...v0.5.0) (2020-07-21)


### Bug Fixes

* decode hash before selecting ([e782c4c](https://github.com/vuejs/vitepress/commit/e782c4cb86dbb8ff294d0670e171692651618a0e))
* fix navbar withBase ([e9ab56b](https://github.com/vuejs/vitepress/commit/e9ab56b0dbe859c0a147e2a2755bfcf2c0b92904))
* typings field in package.json ([#48](https://github.com/vuejs/vitepress/issues/48)) ([692a490](https://github.com/vuejs/vitepress/commit/692a490986ab81eb5be5bc7fdce0434ce84aa620))


### Features

* add external link support for nav items ([#46](https://github.com/vuejs/vitepress/issues/46)) ([44e91bb](https://github.com/vuejs/vitepress/commit/44e91bb98631c843f9accad1cffd24fbc6337fe0))
* add multi sidebar support ([#38](https://github.com/vuejs/vitepress/issues/38)) ([#49](https://github.com/vuejs/vitepress/issues/49)) ([050fa4c](https://github.com/vuejs/vitepress/commit/050fa4cf245f9f33d25684f8bcf218a6b5d6dedb))
* i18n support ([#50](https://github.com/vuejs/vitepress/issues/50)) ([7802cb5](https://github.com/vuejs/vitepress/commit/7802cb55c2a82cc1878fc1ebc4dc2fcf1f2f1ff0))
* nav dropdown ([#51](https://github.com/vuejs/vitepress/issues/51)) ([5780461](https://github.com/vuejs/vitepress/commit/578046145ff4ef445f7a7704016ab791a4ef330f))



## [0.4.1](https://github.com/vuejs/vitepress/compare/v0.4.0...v0.4.1) (2020-07-02)


### Bug Fixes

* avoid error when requesting non-existing md file ([e77ea63](https://github.com/vuejs/vitepress/commit/e77ea6323720f19d7401cb1a9fa94d1963f29e15))
* resolve relative path on windows ([#27](https://github.com/vuejs/vitepress/issues/27)) ([9116c9c](https://github.com/vuejs/vitepress/commit/9116c9c3e06071f34b523cb488d9e5d963808a3c))
* use resolve instead of join ([#33](https://github.com/vuejs/vitepress/issues/33)) ([6f10ed6](https://github.com/vuejs/vitepress/commit/6f10ed6c63b7486f678fdd7eedc888925feb473c))


### Features

* add array sidebar support ([#35](https://github.com/vuejs/vitepress/issues/35)) ([4a8388e](https://github.com/vuejs/vitepress/commit/4a8388e113f978f6afc6936a86b06effc42a8304))



# [0.4.0](https://github.com/vuejs/vitepress/compare/v0.3.1...v0.4.0) (2020-06-19)



## [0.3.1](https://github.com/vuejs/vitepress/compare/v0.3.0...v0.3.1) (2020-06-05)


### Bug Fixes

* avoid using __DEV__ + throttle active header link ([a63b0cf](https://github.com/vuejs/vitepress/commit/a63b0cf69a4d1f8b1b7e44f76c6283f28d437b59))



# [0.3.0](https://github.com/vuejs/vitepress/compare/v0.2.0...v0.3.0) (2020-06-02)


### Bug Fixes

* lazy load @vue/server-render for production build ([382e1b6](https://github.com/vuejs/vitepress/commit/382e1b6514035f69dc9e505fad38a781cd35166e))


### Features

* active sidebar links ([d2ea963](https://github.com/vuejs/vitepress/commit/d2ea9637eeafc1c1510d038f1f749e650a086a32))



# [0.2.0](https://github.com/vuejs/vitepress/compare/v0.1.1...v0.2.0) (2020-05-22)


### Bug Fixes

* avoid unnecessary prefetches ([0a81525](https://github.com/vuejs/vitepress/commit/0a815255b9f226ec5ac032d6db5b151caa9c58fb))
* handle links that embed other elements ([#2](https://github.com/vuejs/vitepress/issues/2)) ([4cbfc60](https://github.com/vuejs/vitepress/commit/4cbfc60a58f7b7ef0d82c6a2b1a48b67ace3d924))


### Features

* copy public dir ([ddc9d51](https://github.com/vuejs/vitepress/commit/ddc9d519c60423e2432c1f3c0ab5b2ccbabd34a6))
* lean builds ([b61e239](https://github.com/vuejs/vitepress/commit/b61e2398fc40be98cd8372834fa3b1e5277c8e1f))
* prefetch in viewport inbound page chunks ([da4852a](https://github.com/vuejs/vitepress/commit/da4852a61bd73a8b46c4971c330f95761237c733))
* use hashed page file names ([a873564](https://github.com/vuejs/vitepress/commit/a8735646e8aae04d7091decc8c4fd54025ceb181))
* use modulepreload links ([0025af1](https://github.com/vuejs/vitepress/commit/0025af12f4ec8e021ea1b7b9d48b0b4025924d83))


### Performance Improvements

* inject script tags for page common chunk imports ([57d900d](https://github.com/vuejs/vitepress/commit/57d900d4b357f15f3dec28e822bd5fd8d100d589))



## 0.1.1 (2020-04-30)

- fix dependency versions

# 0.1.0 (2020-04-30)


### Features

* add markdown processing ([5c47bbb](https://github.com/vuejs/vitepress/commit/5c47bbb4638d7f78ae38fe02732f5b639654c134))
* spa navigation ([21d3cd8](https://github.com/vuejs/vitepress/commit/21d3cd8cbe4102293d2903c3d060764d86a8f785))
* update head tags during dev ([bdbbdd5](https://github.com/vuejs/vitepress/commit/bdbbdd556fe7e3906a5997291ff692cf2b78d632))
* update title & description during dev ([0b9bf27](https://github.com/vuejs/vitepress/commit/0b9bf273ef4f31bf448f7813c50e474b4035b7dc))



