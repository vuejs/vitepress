# 资源处理 {#asset-handling}

所有的 Markdown 文件都编译成 Vue 组件并由 [Vite](https://github.com/vitejs/vite) 处理。你可以**并且应该**使用相对路径引用资源：

```md
![一张图片](./image.png)
```

你可以在 markdown 文件、主题中的 `*.vue` 组件、styles 里和纯 `.css` 文件中通过使用绝对路径 (基于项目根目录) 或相对路径 (基于你的文件系统) 引用静态资源。相对路径的方式类似于使用 `vue-cli` 或 webpack 的 `file-loader` 时所习惯的写法。

常规的图片、媒体和字体文件类型会被自动检测为静态资源。

所有引用的资源，包括使用绝对路径的资源，都将被复制到 dist 文件夹中，并在生产打包后生成哈希文件名。但不会复制未引用的资源。与 `vue-cli` 一样，小于 4kb 的图片资源将编译成 base64 的内联样式。

所有资源路径的引用，包括绝对路径，都应基于你的工作目录结构。

## Public 文件 {#public-files}

有时你可能需要提供一些 Markdown 或主题组件中未直接引用的静态资源 (例如，站点图标和 PWA 图标)。 项目根目录下的 `public` 目录 (如果你正在运行的是 `vitepress build docs`，则为 `docs` 文件夹) 将会保留，用以提供源代码中从未引用的静态资源 (例如 `robots.txt`) 和需要保留完全相同的文件名 (不生成哈希) 的资源。

放在 `public` 中的资源将会直接复制到 dist 的根目录。

注意，你应该使用从根目录开始以绝对路径引用放在 `public` 中的文件——例如，`public/icon.png` 在源代码中应始终引用为 `/icon.png`。

## Base URL

如果你的站点没有部署到根 URL，则需要在 `.vitepress/config.js` 中设置 `base` 选项。 例如，如果你要将站点部署到 `https://foo.github.io/bar/`，那么 `base` 应该设置为 `'/bar/'` (以斜线开头和结尾)。

所有静态资源路径都会自动处理以适配不同的 `base` 配置值。例如，在 markdown 中对 `public` 下的资源使用绝对路径引用：

```md
![一张照片](/image-inside-public.png)
```

使用这种引用方式，当你更改 `base` 配置值时无需再做修改。

但是，如果你正在创作一个动态链接到资源的主题组件，例如图片的 `src` 是基于主题设置的：

```vue
<img :src="theme.logoPath" />
```

在这种情况下，建议使用 VitePress 提供的 [`withBase` 辅助函数](/api/#withbase) 来引用静态资源：

```vue
<script setup>
import { withBase, useData } from 'vitepress'

const { theme } = useData()
</script>

<template>
  <img :src="withBase(theme.logoPath)" />
</template>
```
