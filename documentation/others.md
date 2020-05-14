## Other Differences

- More opinionated and less configurable: VitePress aims to scale back the complexity in the current VuePress and restart from its minimalist roots.

- Future oriented: VitePress only targets browsers that support native ES module imports. It encourages the use of native JavaScript without transpilation, and CSS variables for theming.

## Will this become the next VuePress in the future?

Maybe! It's currently under a different name so that we don't over commit to the compatibility with the current VuePress ecosystem (mostly themes and plugins). We'll see how close we can get without compromising the design goals listed above. But the overall idea is that VitePress will have a drastically more minimal theming API (preferring JavaScript APIs instead of file layout conventions) and likely no plugins (all customization is done in themes).
