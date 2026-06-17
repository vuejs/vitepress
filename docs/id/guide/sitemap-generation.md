---
description: Hasilkan file sitemap.xml untuk situs VitePress Anda untuk meningkatkan keterlihatan mesin pencari.
---

# Pembuatan Sitemap

VitePress hadir dengan dukungan bawaan untuk menghasilkan file `sitemap.xml` untuk situs Anda. Untuk mengaktifkannya, tambahkan yang berikut ke `.vitepress/config.js` Anda:

```ts
export default {
  sitemap: {
    hostname: 'https://example.com'
  }
}
```

Untuk memiliki tag `<lastmod>` di `sitemap.xml` Anda, Anda dapat mengaktifkan opsi [`lastUpdated`](../reference/default-theme-last-updated).

## Opsi

Dukungan sitemap didukung oleh modul [`sitemap`](https://www.npmjs.com/package/sitemap). Anda dapat meneruskan opsi apa pun yang didukung olehnya ke opsi `sitemap` di file konfigurasi Anda. Ini akan diteruskan langsung ke konstruktor `SitemapStream`. Lihat [dokumentasi `sitemap`](https://www.npmjs.com/package/sitemap#options-you-can-pass) untuk detail lebih lanjut. Contoh:

```ts
export default {
  sitemap: {
    hostname: 'https://example.com',
    lastmodDateOnly: false
  }
}
```

Jika Anda menggunakan `base` di konfigurasi Anda, Anda harus menambahkannya ke opsi `hostname`:

```ts
export default {
  base: '/my-site/',
  sitemap: {
    hostname: 'https://example.com/my-site/'
  }
}
```

## Hook `transformItems`

Anda dapat menggunakan hook `sitemap.transformItems` untuk memodifikasi item sitemap sebelum ditulis ke file `sitemap.xml`. Hook ini dipanggil dengan array item sitemap dan mengharapkan array item sitemap dikembalikan. Contoh:

```ts
export default {
  sitemap: {
    hostname: 'https://example.com',
    transformItems: (items) => {
      // tambahkan item baru atau modifikasi/filter item yang ada
      items.push({
        url: '/extra-page',
        changefreq: 'monthly',
        priority: 0.8
      })
      return items
    }
  }
}
```
