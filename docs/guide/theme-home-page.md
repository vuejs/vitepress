# Home Page

VitePress default theme provides a homepage layout, which you can also see used on [the homepage of this site](../). You may use it on any of your pages by specifying `layout: home` in the [frontmatter](./frontmatter).

```yaml
---
layout: home
---
```

However, this option alone wouldn't do much. You can add several different pre templated "sections" to the homepage by setting additional other options such as `hero` and `features`.

## Hero Section

The Hero section comes at the top of the homepage. Here's how you can configure the Hero section.

```yaml
---
layout: home

hero:
  name: VuePress
  text: Vite & Vue powered static site generator.
  tagline: Lorem ipsum...
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
  // The string shown top of `text`. Comes with brand color
  // and expected to be short, such as product name.
  name?: string

  // The main text for the hero section. This will be defined
  // as `h1` tag.
  text: string

  // Tagline displayed below `text`.
  tagline?: string

  // Action buttons to display in home hero section.
  actions?: HeroAction[]
}

interface HeroAction {
  // Color theme of the button. Defaults to `brand`.
  theme?: 'brand' | 'alt'

  // Label of the button.
  text: string

  // Destination link of the button.
  link: string
}
```

### Customizing the name color

VitePress uses the brand color (`--vp-c-brand`) for the `name`. However, you may customize this color by overriding `--vp-home-hero-name-color` variable.

```css
:root {
  --vp-home-hero-name-color: blue;
}
```

Also you may customize it further by combining `--vp-home-hero-name-background` to give the `name` gradient color.

```css
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe, #41d1ff);
}
```

## Features Section

In Features section, you can list any number of features you would like to show right after the Hero section. To configure it, pass `features` option to the frontmatter.

```yaml
---
layout: home

features:
  - icon: ⚡️
    title: Vite, The DX that can't be beat
    details: Lorem ipsum...
  - icon: 🖖
    title: Power of Vue meets Markdown
    details: Lorem ipsum...
  - icon: 🛠️
    title: Simple and minimal, always
    details: Lorem ipsum...
---
```

```ts
interface Feature {
  // Show icon on each feature box. Currently, only emojis
  // are supported.
  icon?: string

  // Title of the feature.
  title: string

  // Details of the feature.
  details: string
}
```
