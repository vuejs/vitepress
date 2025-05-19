---
outline: deep
---

# SSR 兼容性 {#ssr-compatibility}

通过使用 Vue 的服务器端渲染 (SSR) 功能，VitePress 能够在生产构建期间在 Node.js 中预渲染应用程序。这意味着主题组件中的所有自定义代码都需要考虑 SSR 兼容性。

[Vue 官方文档的 SSR 部分](https://cn.vuejs.org/guide/scaling-up/ssr.html)提供了更多有关 SSR 是什么，SSR / SSG 之间的关系以及编写 SSR 友好的代码的常见注意事项等信息。原则上只在 Vue 组件的 `beforeMount` 或 `mounted` 钩子中访问浏览器或 DOM API。

## `<ClientOnly>`

如果正在使用或演示不支持 SSR 的组件 (例如，包含自定义指令)，则可以将它们包装在内置的 `<ClientOnly>` 组件中：

```md
<ClientOnly>
  <NonSSRFriendlyComponent />
</ClientOnly>
```

## 在导入时访问浏览器 API 的库 {#libraries-that-access-browser-api-on-import}

一些组件或库在**导入时**访问浏览器 API。要使用假定在导入时处于浏览器环境的代码，需要动态导入它们。

### 在 mounted 钩子中导入 {#importing-in-mounted-hook}

```vue
<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  import('./lib-that-access-window-on-import').then((module) => {
    // use code
  })
})
</script>
```

### 条件导入 {#conditional-import}

也可以使用 `import.meta.env.SSR` 标志 ([Vite 环境变量](https://cn.vitejs.dev/guide/env-and-mode.html#env-variables)的一部分) 来有条件地导入依赖项：

```js
if (!import.meta.env.SSR) {
  import('./lib-that-access-window-on-import').then((module) => {
    // use code
  })
}
```

因为 [`Theme.enhanceApp`](./custom-theme#theme-interface) 可以是异步的，所以可以有条件地导入并注册访问浏览器 API 的 Vue 插件：

```js [.vitepress/theme/index.js]
/** @type {import('vitepress').Theme} */
export default {
  // ...
  async enhanceApp({ app }) {
    if (!import.meta.env.SSR) {
      const plugin = await import('plugin-that-access-window-on-import')
      app.use(plugin.default)
    }
  }
}
```

如果使用 TypeScript:
```ts [.vitepress/theme/index.ts]
import type { Theme } from 'vitepress'

export default {
  // ...
  async enhanceApp({ app }) {
    if (!import.meta.env.SSR) {
      const plugin = await import('plugin-that-access-window-on-import')
      app.use(plugin.default)
    }
  }
} satisfies Theme
```

### `defineClientComponent`

VitePress 为导入 Vue 组件提供了一个方便的辅助函数，该组件可以在导入时访问浏览器 API。

```vue
<script setup>
import { defineClientComponent } from 'vitepress'

const ClientComp = defineClientComponent(() => {
  return import('component-that-access-window-on-import')
})
</script>

<template>
  <ClientComp />
</template>
```

还可以将 props/children/slots 传递给目标组件：

```vue
<script setup>
import { ref } from 'vue'
import { defineClientComponent } from 'vitepress'

const clientCompRef = ref(null)
const ClientComp = defineClientComponent(
  () => import('component-that-access-window-on-import'),

  // 参数传递给 h() - https://cn.vuejs.org/api/render-function.html#h
  [
    {
      ref: clientCompRef
    },
    {
      default: () => 'default slot',
      foo: () => h('div', 'foo'),
      bar: () => [h('span', 'one'), h('span', 'two')]
    }
  ],

  // 组件加载后的回调，可以是异步的
  () => {
    console.log(clientCompRef.value)
  }
)
</script>

<template>
  <ClientComp />
</template>
```

目标组件将仅在 wrapper 组件的 mounted 钩子中导入。
