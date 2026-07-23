---
description: Pastikan komponen tema VitePress dan kode kustom Anda kompatibel dengan server-side rendering.
outline: deep
---

# Kompatibilitas SSR

VitePress melakukan pre-render aplikasi di Node.js selama build produksi, menggunakan kemampuan Server-Side Rendering (SSR) Vue. Ini berarti semua kode kustom di komponen tema tunduk pada Kompatibilitas SSR.

[Bagian SSR di dokumen resmi Vue](https://vuejs.org/guide/scaling-up/ssr.html) menyediakan lebih banyak konteks tentang apa itu SSR, hubungan antara SSR / SSG, dan catatan umum tentang menulis kode yang ramah SSR. Aturan umumnya adalah hanya mengakses browser / DOM API di hook `beforeMount` atau `mounted` komponen Vue.

## `<ClientOnly>`

Jika Anda menggunakan atau mendemokan komponen yang tidak ramah SSR (misalnya, berisi custom directive), Anda dapat membungkusnya di dalam komponen bawaan `<ClientOnly>`:

```md
<ClientOnly>
  <NonSSRFriendlyComponent />
</ClientOnly>
```

## Library yang Mengakses Browser API Saat Import

Beberapa komponen atau library mengakses browser API **saat import**. Untuk menggunakan kode yang mengasumsikan lingkungan browser saat import, Anda perlu mengimpornya secara dinamis.

### Mengimpor di Hook Mounted

```vue
<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  import('./lib-that-access-window-on-import').then((module) => {
    // gunakan kode
  })
})
</script>
```

### Conditional Import

Anda juga dapat mengimpor dependensi secara kondisional menggunakan flag `import.meta.env.SSR` (bagian dari [Vite env variables](https://vitejs.dev/guide/env-and-mode.html#env-variables)):

```js
if (!import.meta.env.SSR) {
  import('./lib-that-access-window-on-import').then((module) => {
    // gunakan kode
  })
}
```

Karena [`Theme.enhanceApp`](./custom-theme#theme-interface) dapat bersifat async, Anda dapat mengimpor dan mendaftarkan plugin Vue yang mengakses browser API saat import secara kondisional:

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

Jika Anda menggunakan TypeScript:
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

VitePress menyediakan helper untuk mengimpor komponen Vue yang mengakses browser API saat import.

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

Anda juga dapat meneruskan props/children/slots ke komponen target:

```vue
<script setup>
import { ref } from 'vue'
import { defineClientComponent } from 'vitepress'

const clientCompRef = ref(null)
const ClientComp = defineClientComponent(
  () => import('component-that-access-window-on-import'),

  // args diteruskan ke h() - https://vuejs.org/api/render-function.html#h
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

  // callback setelah komponen dimuat, dapat async
  () => {
    console.log(clientCompRef.value)
  }
)
</script>

<template>
  <ClientComp />
</template>
```

Komponen target hanya akan diimpor di hook mounted dari komponen wrapper.
