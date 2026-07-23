---
description: Konfigurasikan navigasi sidebar di tema default VitePress dengan grup, bagian yang dapat diciutkan, dan multiple sidebar.
---

# Sidebar

Sidebar adalah blok navigasi utama untuk dokumentasi Anda. Anda dapat mengonfigurasi menu sidebar di [`themeConfig.sidebar`](./default-theme-config#sidebar).

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Introduction', link: '/introduction' },
          { text: 'Getting Started', link: '/getting-started' },
          ...
        ]
      }
    ]
  }
}
```

## Dasar-dasar

Bentuk paling sederhana dari menu sidebar adalah dengan memberikan array tunggal tautan. Item level pertama mendefinisikan "bagian" untuk sidebar. Ini harus berisi `text`, yang merupakan judul bagian, dan `items` yang merupakan tautan navigasi aktual.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Section Title A',
        items: [
          { text: 'Item A', link: '/item-a' },
          { text: 'Item B', link: '/item-b' },
          ...
        ]
      },
      {
        text: 'Section Title B',
        items: [
          { text: 'Item C', link: '/item-c' },
          { text: 'Item D', link: '/item-d' },
          ...
        ]
      }
    ]
  }
}
```

Setiap `link` harus menentukan path ke file aktual dimulai dengan `/`. Jika Anda menambahkan trailing slash di akhir tautan, itu akan menampilkan `index.md` dari direktori terkait.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Guide',
        items: [
          // Ini menampilkan halaman `/guide/index.md`.
          { text: 'Introduction', link: '/guide/' }
        ]
      }
    ]
  }
}
```

Anda dapat menyarangkan item sidebar hingga sedalam 6 level dihitung dari level root. Perhatikan bahwa item bersarang lebih dalam dari 6 level akan diabaikan dan tidak akan ditampilkan di sidebar.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Level 1',
        items: [
          {
            text: 'Level 2',
            items: [
              {
                text: 'Level 3',
                items: [
                  ...
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

## Multiple Sidebar

Anda dapat menampilkan sidebar yang berbeda tergantung pada path halaman. Misalnya, seperti yang ditunjukkan di situs ini, Anda mungkin ingin membuat bagian konten terpisah dalam dokumentasi Anda seperti halaman "Guide" dan halaman "Config".

Untuk melakukannya, pertama atur halaman Anda ke dalam direktori untuk setiap bagian yang diinginkan:

```
.
├─ guide/
│  ├─ index.md
│  ├─ one.md
│  └─ two.md
└─ config/
   ├─ index.md
   ├─ three.md
   └─ four.md
```

Kemudian, perbarui konfigurasi Anda untuk mendefinisikan sidebar untuk setiap bagian. Kali ini, Anda harus memberikan objek, bukan array.

```js
export default {
  themeConfig: {
    sidebar: {
      // Sidebar ini ditampilkan ketika pengguna
      // berada di direktori `guide`.
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Index', link: '/guide/' },
            { text: 'One', link: '/guide/one' },
            { text: 'Two', link: '/guide/two' }
          ]
        }
      ],

      // Sidebar ini ditampilkan ketika pengguna
      // berada di direktori `config`.
      '/config/': [
        {
          text: 'Config',
          items: [
            { text: 'Index', link: '/config/' },
            { text: 'Three', link: '/config/three' },
            { text: 'Four', link: '/config/four' }
          ]
        }
      ]
    }
  }
}
```

## Grup Sidebar yang Dapat Diciutkan

Dengan menambahkan opsi `collapsed` ke grup sidebar, ini menampilkan tombol toggle untuk menyembunyikan/menampilkan setiap bagian.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Section Title A',
        collapsed: false,
        items: [...]
      }
    ]
  }
}
```

Semua bagian "terbuka" secara default. Jika Anda menginginkannya "tertutup" saat halaman pertama dimuat, atur opsi `collapsed` ke `true`.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Section Title A',
        collapsed: true,
        items: [...]
      }
    ]
  }
}
```
