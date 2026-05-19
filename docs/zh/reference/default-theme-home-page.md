---
description: 配置 VitePress 默认主题的主页布局，包括 hero 区域、功能特性和自定义内容。
---

# 主页 {#home-page}

VitePress 默认主题提供了一个首页布局，也可以在[此站点首页](../)看到。可以通过 [frontmatter](./frontmatter-config) 指定 `layout: home` 在任何页面上使用它

```yaml
---
layout: home
---
```

但是，仅做这个配置不会有太大作用。可以通过设置其他选项 (例如 `hero` 和 `features`) 向主页添加几个不同的预设。

## Hero 部分 {#hero-section}

Hero 部分位于主页顶部。以下是配置 Hero 的方法。

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
  // `text` 上方的字符，带有品牌颜色
  // 预计简短，例如产品名称
  name?: string

  // hero 部分的主要文字，
  // 被定义为 `h1` 标签
  text: string

  // `text` 下方的标语
  tagline?: string

  // text 和 tagline 区域旁的图片
  image?: ThemeableImage

  // 主页 hero 部分的操作按钮
  actions?: HeroAction[]
}

type ThemeableImage =
  | string
  | { src: string; alt?: string }
  | { light: string; dark: string; alt?: string }

interface HeroAction {
  // 按钮的颜色主题，默认为 `brand`
  theme?: 'brand' | 'alt'

  // 按钮的标签
  text: string

  // 按钮的目标链接
  link: string

  // 链接的 target 属性
  target?: string

  // 链接的 rel 属性
  rel?: string
}
```

### 自定义 name 的颜色 {#customizing-the-name-color}

VitePress 通过 (`--vp-c-brand-1`) 设置 `name` 的颜色。但是，可以通过覆盖 `--vp-home-hero-name-color` 变量来自定义此颜色。

```css
:root {
  --vp-home-hero-name-color: blue;
}
```

也可以通过组合 `--vp-home-hero-name-background` 来进一步自定义 `name` 为渐变色。

```css
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe, #41d1ff);
}
```

## Features 部分 {#features-section}

在 Features 部分，可以在 Hero 部分之后列出任意数量的 Feature。可以在 frontmatter 中配置  `features`。

可以为每个 feature 提供一个图标，可以是表情符号或任何类型的图像。当配置的图标是图片（svg, png, jpeg...）时，必须提供合适的宽度和高度的图标；还可以在需要时配置其描述、固有大小以及深色和浅色主题下的不同表现。

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
  // 在每个 feature 框中显示图标
  icon?: FeatureIcon

  // feature 的标题
  title: string

  // feature 的详情
  details: string

  // 点击 feature 组件时的链接，可以是内部链接，也可以是外部链接。
  //
  //
  // 例如 `guide/reference/default-theme-home-page` 或 `https://example.com`
  link?: string

  // feature 组件内显示的链接文本，最好与 `link` 选项一起使用
  //
  //
  // 例如 `Learn more`, `Visit page` 等
  linkText?: string

  // `link` 选项的链接 rel 属性
  //
  // 例如 `external`
  rel?: string

  // `link` 选项的链接 target 属性
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

## Markdown 内容 {#markdown-content}

可以在 frontmatter 的分隔符 `---` 下方为站点主页添加额外的 Markdown 内容。

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
VitePress 并不总是为 `layout: home` 页面里额外的内容自动添加样式。要回到以前的行为，可以在 frontmatter 中添加 `markdownStyles: false`。
:::
