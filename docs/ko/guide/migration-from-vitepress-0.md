# Migration from VitePress 0.x {#migration-from-vitepress-0-x}

If you're coming from VitePress 0.x version, there're several breaking changes due to new features and enhancement. Please follow this guide to see how to migrate your app over to the latest VitePress.

## App Config {#app-config}

- The internationalization feature is not yet implemented.

## Theme Config {#theme-config}

- `sidebar` option has changed its structure.
  - `children` key is now named `items`.
  - Top level item may not contain `link` at the moment. We're planning to bring it back.
- `repo`, `repoLabel`, `docsDir`, `docsBranch`, `editLinks`, `editLinkText` are removed in favor of more flexible api.
  - For adding GitHub link with icon to the nav, use [Social Links](../reference/default-theme-nav#navigation-links) feature.
  - For adding "Edit this page" feature, use [Edit Link](../reference/default-theme-edit-link) feature.
- `lastUpdated` option is now split into `config.lastUpdated` and `themeConfig.lastUpdatedText`.
- `carbonAds.carbon` is changed to `carbonAds.code`.

## Frontmatter Config {#frontmatter-config}

- `home: true` option has changed to `layout: home`. Also, many Homepage related settings have been modified to provide additional features. See [Home Page guide](../reference/default-theme-home-page) for details.
- `footer` option is moved to [`themeConfig.footer`](../reference/default-theme-config#footer).
