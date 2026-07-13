---
description: Generate LLM-friendly markdown output and llms.txt files for your VitePress site.
---

# LLM-Friendly Output <Badge type="warning" text="experimental" />

VitePress can generate [LLM-friendly](https://llmstxt.org/) versions of your documentation at build time. To enable it, add the following to your `.vitepress/config.js`:

```ts
export default {
  llms: true
}
```

This emits the following files into the output directory alongside the regular HTML build:

- `llms.txt` — an index of all pages with links and descriptions, for LLMs to discover your documentation.
- `llms-full.txt` — the entire documentation in a single markdown file.
- A raw markdown version of each page (e.g. `/guide/getting-started.md` next to `/guide/getting-started.html`), with `<!-- @include -->` directives expanded and route rewrites applied.

The table of contents in `llms.txt` follows your sidebar structure and order when a sidebar is configured.

## Options

Pass an object to customize the output:

```ts
export default {
  llms: {
    // used to build absolute links; falls back to sitemap.hostname.
    // links are root-relative when absent
    hostname: 'https://example.com',

    // defaults to the index page's hero name, then the site title
    title: 'My Project',

    // defaults to the index page's hero text, then the site description
    description: 'Documentation for My Project'
  }
}
```

## Limitations

- Only the root locale is emitted — translated locales are skipped.
- Pages generated from [dynamic routes](./routing#dynamic-routes) are skipped.
- `<<<` code snippet imports and image references are left as-is in the markdown output.
