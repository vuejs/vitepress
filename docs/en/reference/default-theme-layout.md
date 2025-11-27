# Layout

You can choose the page layout by setting the `layout` option on the page's [frontmatter](./frontmatter-config). There are three layout options: `doc`, `page`, and `home`. By default, pages use the `doc` layout.

```yaml
---
layout: doc
---
```

## Doc Layout

The `doc` option is the default layout and it styles the Markdown content to look like a documentation page. It wraps the whole content in the `vp-doc` CSS class, which applies styles to elements in it.

Almost all generic elements like `p` or `h2` have special styling, so keep in mind that custom HTML inside Markdown content will also get affected.

It also provides documentation specific features, which are are only enabled when using this layout:

- [Edit Link](./default-theme-edit-link)
- [Previous/Next Links](./default-theme-prev-next-links)
- Outline
- [Carbon Ads](./default-theme-carbon-ads)

## Page Layout

The `page` option is treated as as a blank page. Markdown will still be parsed, and all of the [Markdown Extensions](../guide/markdown) work the same as in the `doc` layout, but there is no default styling.

This layout will let you style everything yourself without VitePress theming affecting the markup. This is useful for creating entirely custom pages.

Note that even in this layout, the sidebar will still show up if the page has a matching sidebar configuration.

## Home Layout

The `home` option will generate a templated home page. With the default layout, you can set extra frontmatter options such as `hero` and `features` to customize the content further. Please read [Default Theme: Home Page](./default-theme-home-page) for more details.

## No Layout

If you don't want any layout, you can pass `layout: false` in the frontmatter. This option is helpful if you want a fully-customizable landing page, without any sidebar, navbar, or footer.

## Custom Layout

You can also use a custom layout:

```md
---
layout: foo
---
```

This will look for a component named `foo` registered in context. You can register your component globally in `.vitepress/theme/index.ts`:

```ts
import DefaultTheme from 'vitepress/theme'
import Foo from './Foo.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('foo', Foo)
  }
}
```
