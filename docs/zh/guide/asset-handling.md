# 资源处理 {#asset-handling}

## 引用静态资源 {#referencing-static-assets}

所有的 Markdown 文件都会被编译成 Vue 组件，并由 [Vite](https://cn.vitejs.dev/guide/assets.html) 处理。可以**并且应该**使用相对路径来引用资源：

```md
![An image](./image.png)
```

可以在 Markdown 文件、主题中的 `*.vue` 组件、样式和普通的 `.css` 文件中引用静态资源，可以使用绝对路径 (基于项目根目录) 或者相对路径 (基于文件系统)。后者类似于 Vite、Vue CLI 或者 webpack 的 `file-loader` 的行为。

常见的图像，媒体和字体文件会被自动检测并视作资源。

::: tip 通过链接引用的文件不会视作资源
在 Markdown 内，通过链接引用的 PDF 或者其他文档不会被自动视作资源。要使这些文件可用，你必须手动将其放在项目的 [`public`](#the-public-directory) 目录内。
:::

所有引用的资源，包括那些使用绝对路径的，都会在生产构建过程中被复制到输出目录，并使用哈希文件名。从未使用过的资源将不会被复制。小于 4kb 的图像资源将会采用 base64 内联——这可以通过 [`vite`](../reference/site-config#vite) 配置选项进行配置。

所有**静态**路径引用，包括绝对路径，都应基于你的工作目录的结构。

## public 目录 {#the-public-directory}

有时可能需要一些静态资源，但这些资源没有直接被 Markdown 或主题组件直接引用，或者你可能想以原始文件名提供某些文件，像 `robots.txt`，favicons 和 PWA 图标这样的文件。

可以将这些文件放置在[源目录](./routing#source-directory)的 `public` 目录中。例如，如果项目根目录是 `./docs`，并且使用默认源目录位置，那么 public 目录将是 `./docs/public`。

放置在 `public` 中的资源将按原样复制到输出目录的根目录中。

请注意，应使用根绝对路径来引用放置在 `public` 中的文件——例如，`public/icon.png` 应始终在源代码中使用 `/icon.png` 引用。

## 根 URL {#base-url}

如果站点没有部署在根 URL 上，则需要在 `.vitepress/config.js` 中设置 `base` 选项。例如，如果计划将站点部署到 `https://foo.github.io/bar/`，则 `base` 应设置为 `'/bar/'`(它应始终以斜杠开头和结尾)。

所有静态资源路径都会被自动处理，来适应不同的 `base` 配置值。例如，如果 markdown 中有一个对 `public` 中的资源的绝对引用：

```md
![An image](/image-inside-public.png)
```

在这种情况下，更改 `base` 配置值时，**无需**更新该引用。

但是如果你正在编写一个主题组件，它动态地链接到资源，例如一个图片，它的 `src` 基于主题配置：

```vue
<img :src="theme.logoPath" />
```

在这种情况下，建议使用 VitePress 提供的 [`withBase` helper](../reference/runtime-api#withbase) 来包括路径：

```vue
<script setup>
import { withBase, useData } from 'vitepress'

const { theme } = useData()
</script>

<template>
  <img :src="withBase(theme.logoPath)" />
</template>
```
