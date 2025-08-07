# Home Page

VitePress's default theme provides a homepage layout, which looks like [this site's homepage](../). You can use it on any of your pages by specifying `layout: home` in the [frontmatter](./frontmatter-config).

```yaml
---
layout: home
---
```

On its own, the option doesn't change much—you instead need to specify slots using the frontmatter that then get applied to the page.

## Hero Section

The hero section is rendered at the top of the homepage:

```yaml
---
layout: home

hero:
  name: VitePress
  text: Vite & Vue powered static site generator.
  tagline: Lorem ipsum...
  image:
    src: /logo.png
    alt: VitePress
  actions:
    - theme: brand
      text: Get Started
      link: /guide/what-is-vitepress
    - theme: alt
      text: View on GitHub
      link: https://github.com/vuejs/vitepress
---
```

```ts
interface Hero {
  // The string shown on top of `text`. Rendered with brand color
  // and expected to be short, such as the product name.
  name?: string

  // The main text for the hero section. This will be defined
  // as an `h1` tag.
  text: string

  // Tagline displayed below `text`.
  tagline?: string

  // Image displayed next to the text and tagline.
  image?: ThemeableImage

  // Action buttons to display below text and image.
  actions?: HeroAction[]
}

type ThemeableImage =
  | string
  | { src: string; alt?: string }
  | { light: string; dark: string; alt?: string }

interface HeroAction {
  // Color theme of the button. Defaults to `brand`.
  theme?: 'brand' | 'alt'

  // Button label.
  text: string

  // Destination link for the button.
  link: string

  // Link target attribute.
  target?: string

  // Link rel attribute.
  rel?: string
}
```

### Customizing the name color

By default, VitePress uses the brand color (`--vp-c-brand-1`) for the `name`. This can be customized by overriding `--vp-home-hero-name-color`.

```css
:root {
  --vp-home-hero-name-color: blue;
}
```

You can also customize the name further by combining it with `--vp-home-hero-name-background` for a gradient.

```css
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe, #41d1ff);
}
```

## Features Section

In the features section, you can list any number of feature cards you want shown under the hero section. To enable it, pass the `features` option to the frontmatter.

You can provide an emoji or image icon for each feature. When the configured icon is an image (svg, png, jpeg, etc), you must provide the icon with a proper width and height. You can also provide a description, its intrinsic size, as well as variants for dark and light mode.

```yaml
---
layout: home

features:
  - icon: 🛠️
    title: Simple and minimal, always
    details: Lorem ipsum...
  - icon:
      src: /cool-feature-icon.svg
    title: Another cool feature
    details: Lorem ipsum...
  - icon:
      dark: /dark-feature-icon.svg
      light: /light-feature-icon.svg
    title: Another cool feature
    details: Lorem ipsum...
---
```

```ts
interface Feature {
  // Show icon on each feature box.
  icon?: FeatureIcon

  // Title of the feature.
  title: string

  // Details of the feature.
  details: string

  // Link when clicked on feature component. The link can
  // be both internal or external.
  //
  // e.g. `guide/reference/default-theme-home-page` or `https://example.com`
  link?: string

  // Link text to be shown inside feature component. Best
  // used with `link` option.
  //
  // e.g. `Learn more`, `Visit page`, etc.
  linkText?: string

  // Link rel attribute for the `link` option.
  //
  // e.g. `external`
  rel?: string

  // Link target attribute for the `link` option.
  target?: string
}

type FeatureIcon =
  | string
  | { src: string; alt?: string; width?: string; height: string }
  | {
      light: string
      dark: string
      alt?: string
      width?: string
      height: string
    }
```

## Markdown Content

You can add additional content to your site's homepage by adding Markdown below the `---` frontmatter divider.

````md
---
layout: home

hero:
  name: VitePress
  text: Vite & Vue powered static site generator.
---

## Getting Started

You can get started using VitePress right away using `npx`!

```sh
npm init
npx vitepress init
```
````

::: info
VitePress didn't always automatically style additional homepage content. To revert to the previously-used behavior, add `markdownStyles: false` to the frontmatter.
:::
