# 主页

VitePress 默认主题提供主页布局，你也可以在 [本站主页](../) 上看到使用的主页布局。 你可以通过在任何页面通过 [frontmatter](./frontmatter) 指定 `layout: home` 使用它。

```yaml
---
layout: home
---
```

但是，仅此选项不会有太大作用。 你可以通过设置额外的其他选项 (例如 `hero` 和 `features`) 将几个不同的预模板“部分”添加到主页。

## Hero 部分

Hero 部分位于主页的顶部。 以下是配置 Hero 部分的方法。

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
  // `text' 的字符串所示。带有品牌颜色，通常会很短，例如项目名称。
  name?: string

  // hero 部分的文本。这将被定义成`h1`标签
  text: string

  // Tagline 会展示在 `text` 下面。
  tagline?: string

  // action 按钮显示在 hero 区域。
  actions?: HeroAction[]
}

interface HeroAction {
  // 按钮的的主题颜色，默认为 `brand`。
  theme?: 'brand' | 'alt'

  // 按钮的内容。
  text: string

  // 按钮链接。
  link: string
}
```

### 自定义名字颜色 {#customizing-the-name-color}

VitePress 使用品牌颜色 (`--vp-c-brand`) 作为 `name`。 但是，你可以通过覆盖 `--vp-home-hero-name-color` 变量来自定义此颜色。

```css
:root {
  --vp-home-hero-name-color: blue;
}
```

你也可以通过组合 `--vp-home-hero-name-background` 来进一步自定义它，以赋予 `name` 渐变颜色。

```css
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe, #41d1ff);
}
```

## Features 部分 {#features-section}

在 Features 部分，你可以在 hero 部分之后列出你想要显示的任意数量的功能。 要配置它，请在 `formatter` 中配置 `features`。

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
  // 在 feature 框里展示 icon，目前只支持 emoji
  icon?: string

  // feature 标题
  title: string

  // feature 详情
  details: string
}
```
