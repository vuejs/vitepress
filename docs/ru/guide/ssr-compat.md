---
outline: deep
---

# Совместимость с SSR {#ssr-compatibility}

VitePress предварительно рендерит приложение в Node.js во время производственной сборки, используя возможности Vue по рендерингу на стороне сервера (SSR). Это означает, что весь пользовательский код в компонентах темы подлежит проверке на совместимость с SSR.

Глава [Рендеринг на стороне сервера](https://ru.vuejs.org/guide/scaling-up/ssr.html) в документации Vue содержит более подробную информацию о том, что такое SSR, взаимосвязь между SSR и SSG, а также общие указания по написанию кода, дружественного к SSR. Правило заключается в том, чтобы обращаться к API браузера / DOM только в хуках `beforeMount` или `mounted` компонентов Vue.

## `<ClientOnly>` {#clientonly}

Если вы используете или демонстрируете компоненты, которые не являются SSR-дружественными (например, содержат пользовательские директивы), вы можете обернуть их внутри встроенного компонента `<ClientOnly>`:

```md
<ClientOnly>
  <NonSSRFriendlyComponent />
</ClientOnly>
```

## Библиотеки, обращающиеся к API браузера при импорте {#libraries-that-access-browser-api-on-import}

Некоторые компоненты или библиотеки получают доступ к API браузера **при импорте**. Чтобы использовать код, предполагающий наличие среды браузера при импорте, необходимо динамически импортировать их.

### Импорт в хуке `onMounted` {#importing-in-mounted-hook}

```vue
<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  import('./lib-that-access-window-on-import').then((module) => {
    // используем код
  })
})
</script>
```

### Условный импорт {#conditional-import}

Вы также можете условно импортировать зависимость с помощью флага `import.meta.env.SSR` (часть [env-переменных Vite](https://vitejs.dev/guide/env-and-mode.html#env-variables)):

```js
if (!import.meta.env.SSR) {
  import('./lib-that-access-window-on-import').then((module) => {
    // используем код
  })
}
```

Поскольку [`Theme.enhanceApp`](./custom-theme#theme-interface) может быть асинхронным, вы можете условно импортировать и регистрировать плагины Vue, которые получают доступ к API браузера при импорте:

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

Если вы используете TypeScript:

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

### `defineClientComponent` {#defineclientcomponent}

VitePress предоставляет удобный помощник для импорта компонентов Vue, которые получают доступ к API браузера при импорте.

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

Вы также можете передавать параметры/дочерние элементы/слоты целевому компоненту:

```vue
<script setup>
import { ref } from 'vue'
import { defineClientComponent } from 'vitepress'

const clientCompRef = ref(null)
const ClientComp = defineClientComponent(
  () => import('component-that-access-window-on-import'),

  // args передаются в функцию h() - https://ru.vuejs.org/api/render-function.html#h
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

  // обратный вызов после загрузки компонента, может быть асинхронным
  () => {
    console.log(clientCompRef.value)
  }
)
</script>

<template>
  <ClientComp />
</template>
```

Целевой компонент будет импортирован только в смонтированный хук компонента-обёртки.
