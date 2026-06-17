---
description: Kustomisasi dan perluas tema default VitePress dengan CSS kustom, komponen, layout, dan slot.
outline: deep
---

# Memperluas Tema Default

Tema default VitePress dioptimalkan untuk dokumentasi, dan dapat dikustomisasi. Lihat [Ikhtisar Konfigurasi Tema Default](../reference/default-theme-config) untuk daftar opsi yang komprehensif.

Namun, ada beberapa kasus di mana konfigurasi saja tidak cukup. Misalnya:

1. Anda perlu mengubah styling CSS;
2. Anda perlu memodifikasi instance aplikasi Vue, misalnya untuk mendaftarkan komponen global;
3. Anda perlu menyuntikkan konten kustom ke dalam tema melalui layout slot.

Kustomisasi lanjutan ini akan memerlukan penggunaan tema kustom yang "memperluas" tema default.

::: tip
Sebelum melanjutkan, pastikan untuk membaca [Menggunakan Tema Kustom](./custom-theme) terlebih dahulu untuk memahami cara kerja tema kustom.
:::

## Menyesuaikan CSS

CSS tema default dapat dikustomisasi dengan menimpa CSS variable tingkat root:

```js [.vitepress/theme/index.js]
import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default DefaultTheme
```

```css
/* .vitepress/theme/custom.css */
:root {
  --vp-c-brand-1: #646cff;
  --vp-c-brand-2: #747bff;
}
```

Lihat [CSS variable tema default](https://github.com/vuejs/vitepress/blob/main/src/client/theme-default/styles/vars.css) yang dapat ditimpa.

## Menggunakan Font yang Berbeda

VitePress menggunakan [Inter](https://rsms.me/inter/) sebagai font default, dan akan menyertakan font tersebut dalam output build. Font juga otomatis di-preload di produksi. Namun, ini mungkin tidak diinginkan jika Anda ingin menggunakan font utama yang berbeda.

Untuk menghindari menyertakan Inter dalam output build, impor tema dari `vitepress/theme-without-fonts` sebagai gantinya:

```js [.vitepress/theme/index.js]
import DefaultTheme from 'vitepress/theme-without-fonts'
import './my-fonts.css'

export default DefaultTheme
```

```css
/* .vitepress/theme/my-fonts.css */
:root {
  --vp-font-family-base: /* font teks normal */
  --vp-font-family-mono: /* font kode */
}
```

::: warning
Jika Anda menggunakan komponen opsional seperti komponen [Team Page](../reference/default-theme-team-page), pastikan untuk juga mengimpornya dari `vitepress/theme-without-fonts`!
:::

Jika font Anda adalah file lokal yang direferensikan melalui `@font-face`, itu akan diproses sebagai aset dan disertakan di bawah `.vitepress/dist/assets` dengan nama file hash. Untuk mem-preload file ini, gunakan build hook [transformHead](../reference/site-config#transformhead):

```js [.vitepress/config.js]
export default {
  transformHead({ assets }) {
    // sesuaikan regex untuk mencocokkan font Anda
    const myFontFile = assets.find(file => /font-name\.[\w-]+\.woff2/.test(file))
    if (myFontFile) {
      return [
        [
          'link',
          {
            rel: 'preload',
            href: myFontFile,
            as: 'font',
            type: 'font/woff2',
            crossorigin: ''
          }
        ]
      ]
    }
  }
}
```

## Mendaftarkan Komponen Global

```js [.vitepress/theme/index.js]
import DefaultTheme from 'vitepress/theme'

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // daftarkan komponen global kustom Anda
    app.component('MyGlobalComponent' /* ... */)
  }
}
```

Jika Anda menggunakan TypeScript:
```ts [.vitepress/theme/index.ts]
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // daftarkan komponen global kustom Anda
    app.component('MyGlobalComponent' /* ... */)
  }
} satisfies Theme
```

Karena kita menggunakan Vite, Anda juga dapat memanfaatkan [fitur glob import Vite](https://vitejs.dev/guide/features.html#glob-import) untuk mendaftarkan direktori komponen secara otomatis.

## Layout Slots

Komponen `<Layout/>` tema default memiliki beberapa slot yang dapat digunakan untuk menyuntikkan konten di lokasi tertentu halaman. Berikut contoh menyuntikkan komponen ke before outline:

```js [.vitepress/theme/index.js]
import DefaultTheme from 'vitepress/theme'
import MyLayout from './MyLayout.vue'

export default {
  extends: DefaultTheme,
  // timpa Layout dengan komponen wrapper yang
  // menyuntikkan slot
  Layout: MyLayout
}
```

```vue [.vitepress/theme/MyLayout.vue]
<script setup>
import DefaultTheme from 'vitepress/theme'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #aside-outline-before>
      Konten atas sidebar kustom saya
    </template>
  </Layout>
</template>
```

Atau Anda dapat menggunakan render function juga.

```js [.vitepress/theme/index.js]
import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import MyComponent from './MyComponent.vue'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'aside-outline-before': () => h(MyComponent)
    })
  }
}
```

Daftar lengkap slot yang tersedia di layout tema default:

- Ketika `layout: 'doc'` (default) diaktifkan melalui frontmatter:
  - `doc-top`
  - `doc-bottom`
  - `doc-footer-before`
  - `doc-before`
  - `doc-after`
  - `sidebar-nav-before`
  - `sidebar-nav-after`
  - `aside-top`
  - `aside-bottom`
  - `aside-outline-before`
  - `aside-outline-after`
  - `aside-ads-before`
  - `aside-ads-after`
- Ketika `layout: 'home'` diaktifkan melalui frontmatter:
  - `home-hero-before`
  - `home-hero-info-before`
  - `home-hero-info`
  - `home-hero-info-after`
  - `home-hero-actions-before-actions`
  - `home-hero-actions-after`
  - `home-hero-image`
  - `home-hero-after`
  - `home-features-before`
  - `home-features-after`
- Ketika `layout: 'page'` diaktifkan melalui frontmatter:
  - `page-top`
  - `page-bottom`
- Pada halaman not found (404):
  - `not-found`
- Selalu:
  - `layout-top`
  - `layout-bottom`
  - `nav-bar-title-before`
  - `nav-bar-title-after`
  - `nav-bar-content-before`
  - `nav-bar-content-after`
  - `nav-screen-content-before`
  - `nav-screen-content-after`

## Menggunakan View Transitions API

### Pada Toggle Appearance

Anda dapat memperluas tema default untuk menyediakan transisi kustom saat mode warna di-toggle. Contoh:

```vue [.vitepress/theme/Layout.vue]
<script setup lang="ts">
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { nextTick, provide } from 'vue'

const { isDark } = useData()

const enableTransitions = () =>
  'startViewTransition' in document &&
  window.matchMedia('(prefers-reduced-motion: no-preference)').matches

provide('toggle-appearance', async ({ clientX: x, clientY: y }: MouseEvent) => {
  if (!enableTransitions()) {
    isDark.value = !isDark.value
    return
  }

  const clipPath = [
    `circle(0px at ${x}px ${y}px)`,
    `circle(${Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    )}px at ${x}px ${y}px)`
  ]

  await document.startViewTransition(async () => {
    isDark.value = !isDark.value
    await nextTick()
  }).ready

  document.documentElement.animate(
    { clipPath: isDark.value ? clipPath.reverse() : clipPath },
    {
      duration: 300,
      easing: 'ease-in',
      fill: 'forwards',
      pseudoElement: `::view-transition-${isDark.value ? 'old' : 'new'}(root)`
    }
  )
})
</script>

<template>
  <DefaultTheme.Layout />
</template>

<style>
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-old(root),
.dark::view-transition-new(root) {
  z-index: 1;
}

::view-transition-new(root),
.dark::view-transition-old(root) {
  z-index: 9999;
}

.VPSwitchAppearance {
  width: 22px !important;
}

.VPSwitchAppearance .check {
  transform: none !important;
}
</style>
```

Hasil (**peringatan!**: warna berkedip, gerakan tiba-tiba, cahaya terang):

<details>
<summary>Demo</summary>

![Appearance Toggle Transition Demo](/appearance-toggle-transition.webp)

</details>

Lihat [Chrome Docs](https://developer.chrome.com/docs/web-platform/view-transitions/) untuk detail lebih lanjut tentang view transitions.

### Pada Perubahan Rute

Segera hadir.

## Menimpa Komponen Internal

Anda dapat menggunakan [alias Vite](https://vitejs.dev/config/shared-options.html#resolve-alias) untuk mengganti komponen tema default dengan yang kustom:

```ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitepress'

export default defineConfig({
  vite: {
    resolve: {
      alias: [
        {
          find: /^.*\/VPNavBar\.vue$/,
          replacement: fileURLToPath(
            new URL('./theme/components/CustomNavBar.vue', import.meta.url)
          )
        }
      ]
    }
  }
})
```

Untuk mengetahui nama pasti komponen, lihat [kode sumber kami](https://github.com/vuejs/vitepress/tree/main/src/client/theme-default/components). Karena komponen bersifat internal, ada kemungkinan kecil namanya diperbarui di antara rilis minor.
