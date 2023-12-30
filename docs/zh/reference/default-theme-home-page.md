# 主页 {#home-page}

VitePress 默认主题提供了一个首页布局，你也可以在[此网站首页](../)看到。你可以通过 [frontmatter](./frontmatter-config) 指定 `layout: home` 在任何页面上使用它

```yaml
---
layout: home
---
```

但是，仅此选项不会有太大作用。你可以通过设置其他选项（例如 `hero` 和 `features`）向主页添加几个不同的预模板化。

## Hero 部分 {#hero-section}

Hero section 位于主页顶部。以下是配置 Hero 的方法。

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
  // The string shown top of `text`. Comes with brand color
  // and expected to be short, such as product name.
  name?: string

  // The main text for the hero section. This will be defined
  // as `h1` tag.
  text: string

  // Tagline displayed below `text`.
  tagline?: string

  // The image is displayed next to the text and tagline area.
  image?: ThemeableImage

  // Action buttons to display in home hero section.
  actions?: HeroAction[]
}

type ThemeableImage =
  | string
  | { src: string; alt?: string }
  | { light: string; dark: string; alt?: string }

interface HeroAction {
  // Color theme of the button. Defaults to `brand`.
  theme?: 'brand' | 'alt'

  // Label of the button.
  text: string

  // Destination link of the button.
  link: string
}
```

### 自定义 name 的颜色 {#customizing-the-name-color}

VitePress 通过 (`--vp-c-brand-1`) 设置 `name` 的颜色 .但是，你可以通过覆写 `--vp-home-hero-name-color` 变量来自定义此颜色。

```css
:root {
  --vp-home-hero-name-color: blue;
}
```

你也可以通过组合 `--vp-home-hero-name-background` 来进一步自定义 `name` 为渐变色。

```css
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe, #41d1ff);
}
```

## Features 部分 {#features-section}

在 Features section，你可以在 Hero section 之后列出任意数量的 Features。可以在 frontmatter 中配置  `features`。

你可以为每个 feature 提供一个图标，可以是表情符号或任何类型的图像。当配置的图标是图片（svg, png, jpeg...）时，必须提供合适的宽度和高度的图标；你还可以在需要时配置其描述、固有大小以及深色和浅色主题下的不同表现。

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
