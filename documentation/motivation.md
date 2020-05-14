## Motivation

I love VuePress, but being built on top of webpack, the time it takes to spin up the dev server for a simple doc site with a few pages is just becoming unbearable. Even HMR updates can take up to seconds to reflect in the browser!

As a reference, the [Composition API RFC repo](https://github.com/vuejs/composition-api-rfc) is just two pages, but it takes 4 seconds to spin up the server, and almost 2 seconds for any edit to reflect in the browser.

Fundamentally, this is because VuePress is a webpack app under the hood. Even with just two pages, it's a full on webpack project (including all the theme source files) being compiled. It gets even worse when the project has many pages - every page must first be fully compiled before the server can even display anything!

Incidentally, [vite](https://github.com/vuejs/vite) solves these problems really well: nearly instant server start, on-demand compilation that only compiles the page being served, and lightning fast HMR. Plus, there are a few additional design issues I have noted in VuePress over time, but never had the time to fix due to the amount of refactoring it would require.

Now, with `vite` and Vue 3, it is time to rethink what a "Vue-powered static site generator" can really be.

## Improvements over VuePress

- Uses Vue 3.
  - Leverages Vue 3's improved template static analysis to stringify static content as much as possible. Static content is sent as string literals instead of JavaScript render function code - the JS payload is therefore *much* cheaper to parse, and hydration also becomes faster.

    Note the optimization is applied while still allowing the user to freely mix Vue components inside markdown content - the compiler does the static/dynamic separation for you automatically and you never need to think about it.

- Uses `vite` under the hood:
  - Faster dev server start
  - Faster hot updates
  - Faster build (uses Rollup internally)

- Lighter page weight.
  - Vue 3 tree-shaking + Rollup code splitting
  - Does not ship metadata for every page on every request. This decouples page weight from total number of pages. Only the current page's metadata is sent. Client side navigation fetches the new page's component and metadata together.
  - Does not use `vue-router` because the need of VitePress is very simple and specific - a simple custom router (under 200 LOC) is used instead.
  - (WIP) i18n locale data should also be fetched on demand.
