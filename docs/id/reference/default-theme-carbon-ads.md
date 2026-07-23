---
description: Integrasikan Carbon Ads ke situs VitePress Anda menggunakan dukungan bawaan tema default.
---

# Carbon Ads

VitePress memiliki dukungan bawaan untuk [Carbon Ads](https://www.carbonads.net/). Dengan mendefinisikan kredensial Carbon Ads di config, VitePress akan menampilkan iklan pada halaman.

```js
export default {
  themeConfig: {
    carbonAds: {
      code: 'your-carbon-code',
      placement: 'your-carbon-placement',
      format: 'classic'
    }
  }
}
```

Nilai-nilai ini digunakan untuk memanggil script CDN carbon seperti yang ditunjukkan di bawah.

Opsi `format` mendukung `classic`, `responsive`, dan `cover`.

```js
`//cdn.carbonads.com/carbon.js?serve=${code}&placement=${placement}&format=${format}`
```

Untuk mempelajari lebih lanjut tentang konfigurasi Carbon Ads, kunjungi [situs Carbon Ads](https://www.carbonads.net/).
