---
description: Konfigurasikan bilah navigasi di tema default VitePress termasuk judul situs, logo, dan tautan menu.
---

# Nav

Nav adalah bilah navigasi yang ditampilkan di bagian atas halaman. Ini berisi judul situs, tautan menu global, dan lain-lain.

## Judul Situs dan Logo

Secara default, nav menampilkan judul situs yang merujuk pada nilai [`config.title`](./site-config#title). Jika Anda ingin mengubah apa yang ditampilkan di nav, Anda dapat mendefinisikan teks kustom di opsi `themeConfig.siteTitle`.

```js
export default {
  themeConfig: {
    siteTitle: 'My Custom Title'
  }
}
```

Jika Anda memiliki logo untuk situs Anda, Anda dapat menampilkannya dengan memberikan path ke gambar. Anda sebaiknya menempatkan logo langsung di dalam `public`, dan mendefinisikan path absolut ke sana.

```js
export default {
  themeConfig: {
    logo: '/my-logo.svg'
  }
}
```

Ketika menambahkan logo, logo akan ditampilkan bersama dengan judul situs. Jika logo saja sudah cukup dan Anda ingin menyembunyikan teks judul situs, atur opsi `siteTitle` ke `false`.

```js
export default {
  themeConfig: {
    logo: '/my-logo.svg',
    siteTitle: false
  }
}
```

Anda juga dapat memberikan objek sebagai logo jika ingin menambahkan atribut `alt` atau menyesuaikannya berdasarkan mode gelap/terang. Lihat [`themeConfig.logo`](./default-theme-config#logo) untuk detailnya.

## Tautan Navigasi

Anda dapat mendefinisikan opsi `themeConfig.nav` untuk menambahkan tautan ke nav Anda.

```js
export default {
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide' },
      { text: 'Config', link: '/config' },
      { text: 'Changelog', link: 'https://github.com/...' }
    ]
  }
}
```

`text` adalah teks aktual yang ditampilkan di nav, dan `link` adalah tautan yang akan dinavigasi ketika teks diklik. Untuk tautan, atur path ke file aktual tanpa awalan `.md`, dan selalu mulai dengan `/`.

`link` juga dapat berupa fungsi yang menerima [`PageData`](./runtime-api#usedata) sebagai argumen dan mengembalikan path.

Tautan nav juga dapat berupa menu dropdown. Untuk melakukan ini, atur kunci `items` pada opsi tautan.

```js
export default {
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide' },
      {
        text: 'Dropdown Menu',
        items: [
          { text: 'Item A', link: '/item-1' },
          { text: 'Item B', link: '/item-2' },
          { text: 'Item C', link: '/item-3' }
        ]
      }
    ]
  }
}
```

Perhatikan bahwa judul menu dropdown (`Dropdown Menu` pada contoh di atas) tidak dapat memiliki properti `link` karena berfungsi sebagai tombol untuk membuka dialog dropdown.

Anda juga dapat menambahkan "bagian" ke item menu dropdown dengan memberikan item bersarang lebih lanjut.

```js
export default {
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide' },
      {
        text: 'Dropdown Menu',
        items: [
          {
            // Judul untuk bagian.
            text: 'Section A Title',
            items: [
              { text: 'Section A Item A', link: '...' },
              { text: 'Section B Item B', link: '...' }
            ]
          }
        ]
      },
      {
        text: 'Dropdown Menu',
        items: [
          {
            // Anda juga dapat menghilangkan judul.
            items: [
              { text: 'Section A Item A', link: '...' },
              { text: 'Section B Item B', link: '...' }
            ]
          }
        ]
      }
    ]
  }
}
```

### Menyesuaikan status "active" tautan

Item menu nav akan disorot ketika halaman saat ini berada di bawah path yang cocok. Jika Anda ingin menyesuaikan path yang akan dicocokkan, definisikan properti `activeMatch` dan regex sebagai nilai string.

```js
export default {
  themeConfig: {
    nav: [
      // Tautan ini mendapatkan status active ketika pengguna
      // berada di path `/config/`.
      {
        text: 'Guide',
        link: '/guide',
        activeMatch: '/config/'
      }
    ]
  }
}
```

::: warning
`activeMatch` diharapkan berupa string regex, tetapi Anda harus mendefinisikannya sebagai string. Kita tidak dapat menggunakan objek RegExp aktual di sini karena tidak dapat diserialisasi selama waktu build.
:::

### Menyesuaikan atribut "target" dan "rel" tautan

Secara default, VitePress secara otomatis menentukan atribut `target` dan `rel` berdasarkan apakah tautan tersebut merupakan tautan eksternal. Tetapi jika Anda mau, Anda juga dapat menyesuaikannya.

```js
export default {
  themeConfig: {
    nav: [
      {
        text: 'Merchandise',
        link: 'https://www.thegithubshop.com/',
        target: '_self',
        rel: 'sponsored'
      }
    ]
  }
}
```

## Tautan Sosial

Lihat [`socialLinks`](./default-theme-config#sociallinks).

## Komponen Kustom

Anda dapat menyertakan komponen kustom di bilah navigasi dengan menggunakan opsi `component`. Kunci `component` harus berupa nama komponen Vue, dan harus didaftarkan secara global menggunakan [Theme.enhanceApp](../guide/custom-theme#theme-interface).

```js [.vitepress/config.js]
export default {
  themeConfig: {
    nav: [
      {
        text: 'My Menu',
        items: [
          {
            component: 'MyCustomComponent',
            // Props opsional untuk diteruskan ke komponen
            props: {
              title: 'My Custom Component'
            }
          }
        ]
      },
      {
        component: 'AnotherCustomComponent'
      }
    ]
  }
}
```

Kemudian, Anda perlu mendaftarkan komponen secara global:

```js [.vitepress/theme/index.js]
import DefaultTheme from 'vitepress/theme'

import MyCustomComponent from './components/MyCustomComponent.vue'
import AnotherCustomComponent from './components/AnotherCustomComponent.vue'

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('MyCustomComponent', MyCustomComponent)
    app.component('AnotherCustomComponent', AnotherCustomComponent)
  }
}
```

Komponen Anda akan dirender di bilah navigasi. VitePress akan memberikan props tambahan berikut ke komponen:

- `screenMenu`: boolean opsional yang menunjukkan apakah komponen berada di dalam menu navigasi mobile

Anda dapat melihat contoh di e2e tests [di sini](https://github.com/vuejs/vitepress/tree/main/__tests__/e2e/.vitepress).
