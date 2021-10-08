# Configuration

Without any configuration, the page is pretty minimal, and the user has no way to navigate around the site. To customize your site, let’s first create a `.vitepress` directory inside your docs directory. This is where all VitePress-specific files will be placed. Your project structure is probably like this:

```bash
.
├─ docs
│  ├─ .vitepress
│  │  └─ config.js
│  └─ index.md
└─ package.json
```

The essential file for configuring a VitePress site is `.vitepress/config.js`, which should export a JavaScript object:

```js
/**
 * @type {import('vitepress').UserConfig}
 */
const config = {
  title: 'Hello VitePress',
  description: 'Just playing around.'
}

module.exports = config
```

If you are using TypeScript, you can use `.vitepress/config.ts` instead to get better types hint for VitePress Config.

```ts
import type { UserConfig } from 'vitepress'

const config = {
  title: 'Hello VitePress',
  description: 'Just playing around.'
}

export default config
```

Check out the [Config Reference](/config/basics) for a full list of options.
