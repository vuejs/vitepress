# 简介 {#introduction}

将配置文件放在 `.vitepress/config.js` 中。 这是放置所有 VitePress 特定文件的地方。

```
.
├─ docs
│  ├─ .vitepress
│  │  └─ config.js
│  └─ index.md
└─ package.json
```

::: tip 提示
你也可以使用任意的 `.ts`、`.cjs`、`.mjs`、`.cts` 和 `.mts` 作为配置文件的扩展名。
:::

VitePress 带有 2 种类型的配置。一种是[应用全局配置](./app-configs)，它配置站点的基本功能，例如设置站点的标题，或自定义 Markdown 解析器的工作方式。其次是[主题配置](./theme-configs)，用于配置站点的主题，例如添加侧边栏，或者添加“在 GitHub 上编辑此页面”链接等功能。

你还可以在 [Frontmatter](./frontmatter-configs) 中进行另一种配置。Frontmatter 配置可以覆盖在该特定页面的应用全局配置或主题配置上定义的全局配置。但是，有几个选项也仅在 frontmatter 中可用。

请参阅相应的配置页面以了解更多信息。

## 配置智能提示 {#config-intellisense}

由于 VitePress 附带 TypeScript 类型，你可以利用 IDE 的智能提示和 jsdoc 类型提示：

```js
/**
 * @type {import('vitepress').UserConfig}
 */
const config = {
  // ...
}

export default config
```

或者，你可以使用 `defineConfig` 辅助函数，它会提供智能提示，而无需 jsdoc 注释：

```js
import { defineConfig } from 'vitepress'

export default defineConfig({
  // ...
})
```

VitePress 也直接支持 TS 配置文件。 你也可以将 `.vitepress/config.ts` 与 `defineConfig` 辅助函数一起使用。

## 主题配置类型 {#typed-theme-config}

默认情况下，`defineConfig` 辅助函数使用默认主题的主题配置类型：

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    // Type is `DefaultTheme.Config`
  }
})
```

如果你使用自定义主题并希望对主题配置进行类型检查，则需要使用 `defineConfigWithTheme`，并通过通用参数传递自定义主题的配置类型：

```ts
import { defineConfigWithTheme } from 'vitepress'
import { ThemeConfig } from 'your-theme'

export default defineConfigWithTheme<ThemeConfig>({
  themeConfig: {
    // Type is `ThemeConfig`
  }
})
```
