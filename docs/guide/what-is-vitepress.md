# What is VitePress?

VitePress is [VuePress](https://vuepress.vuejs.org/)' little brother, built on top of [Vite](https://vitejs.dev/).

::: warning
VitePress is currently in `alpha` status. It is already suitable for out-of-the-box documentation use, but the config and theming API may still change between minor releases.
:::

## Motivation

We love VuePress v1, but being built on top of Webpack, the time it takes to spin up the dev server for a simple doc site with a few pages is just becoming unbearable. Even HMR updates can take up to seconds to reflect in the browser!

Fundamentally, this is because VuePress v1 is a Webpack app under the hood. Even with just two pages, it's a full on Webpack project (including all the theme source files) being compiled. It gets even worse when the project has many pages – every page must first be fully compiled before the server can even display anything!

Incidentally, Vite solves these problems really well: nearly instant server start, an on-demand compilation that only compiles the page being served, and lightning-fast HMR. Plus, there are a few additional design issues I have noted in VuePress v1 over time but never had the time to fix due to the amount of refactoring it would require.

Now, with Vite and Vue 3, it is time to rethink what a "Vue-powered static site generator" can really be.

## Improvements over VuePress v1

There're couple of things that are improved from VuePress v1....

### It uses Vue 3

Leverages Vue 3's improved template static analysis to stringify static content as much as possible. Static content is sent as string literals instead of JavaScript render function code – the JS payload is therefore much cheaper to parse, and hydration also becomes faster.

Note the optimization is applied while still allowing the user to freely mix Vue components inside markdown content – the compiler does the static/dynamic separation for you automatically and you never need to think about it.

### It uses Vite under the hood

- Faster dev server start
- Faster hot updates
- Faster build (uses Rollup internally)

### Lighter page weight

Vue 3 tree-shaking + Rollup code splitting
- Does not ship metadata for every page on every request. This decouples page weight from total number of pages. Only the current page's metadata is sent. Client side navigation fetches the new page's component and metadata together.
- Does not use vue-router because the need of VitePress is very simple and specific - a simple custom router (under 200 LOC) is used instead.

### Other differences

VitePress is more opinionated and less configurable: VitePress aims to scale back the complexity in the current VuePress and restart from its minimalist roots.

VitePress is future oriented: VitePress only targets browsers that support native ES module imports. It encourages the use of native JavaScript without transpilation, and CSS variables for theming.

## Will this become the next vuepress in the future?

We already have [vuepress-next](https://github.com/vuepress/vuepress-next), which would be the next major version of VuePress. It also makes lots of improvements over VuePress v1, and also supports Vite now.

VitePress is not compatible with the current VuePress ecosystem (mostly themes and plugins). The overall idea is that VitePress will have a drastically more minimal theming API (preferring JavaScript APIs instead of file layout conventions) and likely no plugins (all customization is done in themes).

There is an [ongoing discussion](https://github.com/vuejs/vitepress/discussions/548) about this topic. If you're curious, please leave your thoughts!
