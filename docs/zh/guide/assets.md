# 资源管理

所有的 Markdown 文件都会编译成 Vue 组件，并且会被 [Vite](https://github.com/vitejs/vite)。你可以，**并且应该**，使用相对路径来引用资源：
```md
![An image](./image.png)
```

你可以在你的 Markdown 文件中引用静态资源，你的 `*.vue` 组件，样式和纯 CSS 文件，可以使用绝对的公共路径（基于项目根目录）或者相对的路径（基于你的文件系统）。这种方式与 `vue-cli` 或者 webpack 的 `file-loader` 的行为相似。

普通的图片、媒体和字体文件类型会被自动检测并包含为资源。

所有引用的资源，包括使用绝对路径的资源，都会被复制到 dist 文件夹，并且在生产构建中使用哈希文件名。不引用的资源不会被复制。与 `vue-cli` 一样，小于 4kb 的图片资源会被 base64 内联。

所有的 **静态** 路径引用，包括绝对路径，应该基于你的工作目录结构。

## 公共文件

有时候你可能需要提供一些不直接在 Markdown 文件或者主题组件（例如，favicon 和 PWA 图标）中直接引用。项目根目录下的 `public` 目录可以用作脱离式资源，可以提供不在源代码中引用的静态资源（例如，`robots.txt`），或者保持文件名不变（不使用哈希）。

在 `public` 目录中的资源会被复制到 dist 目录的根目录中。

请注意，你应该在 `public` 目录中放置的文件使用根绝对路径引用 - 例如，`public/icon.png` 应该在源代码中总是使用 `/icon.png`。

## Base URL

如果你的站点被部署到一个非根 URL，你需要在 `.vitepress/config.js` 中设置 `base` 选项。例如，如果你计划部署站点到 `https://foo.github.io/bar/`，那么 `base` 应该设置为 `'/bar/'`（它应该总是以斜杠开头和结尾）。

你的所有静态资源路径都会被自动处理，以调整不同的 `base` 配置值。例如，如果你在 Markdown 中有一个绝对路径引用了 `public` 目录下的静态资源：

```md
![An image](/image-inside-public.png)
```

你 **不** 需要在这种情况下更改 `base` 选项。

但是，如果你正在作为主题组件引用静态资源，例如，图片的 `src` 属性基于主题配置值：

```vue
<img :src="theme.logoPath" />
```

在这种情况下，建议使用 VitePress 提供的 [`withBase` 助手](/guide/api.html#withbase)：

```vue
<script setup>
import { withBase, useData } from 'vitepress'

const { theme } = useData()
</script>

<template>
  <img :src="withBase(theme.logoPath)" />
</template>
```
