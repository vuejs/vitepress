---
description: Tampilkan timestamp terakhir diperbarui pada halaman VitePress berdasarkan riwayat commit Git.
---

# Last Updated

Waktu pembaruan konten terakhir akan ditampilkan di sudut kanan bawah halaman. Untuk mengaktifkannya, tambahkan opsi `lastUpdated` ke config Anda.

::: info
VitePress menampilkan waktu "last updated" menggunakan timestamp dari commit Git terbaru untuk setiap file. Untuk mengaktifkannya, file Markdown harus di-commit ke Git.

Secara internal, VitePress menjalankan `git log -1 --pretty="%ai"` pada setiap file untuk mengambil timestamp-nya. Jika semua halaman menampilkan waktu pembaruan yang sama, kemungkinan besar disebabkan oleh shallow cloning (umum di lingkungan CI), yang membatasi riwayat Git.

Untuk memperbaikinya di **GitHub Actions**, gunakan yang berikut dalam workflow Anda:

```yaml{4}
- name: Checkout
  uses: actions/checkout@v5
  with:
    fetch-depth: 0
```

Platform CI/CD lain memiliki pengaturan serupa.

Jika opsi tersebut tidak tersedia, Anda dapat menambahkan perintah `docs:build` di `package.json` Anda dengan fetch manual:

```json
"docs:build": "git fetch --unshallow && vitepress build docs"
```
:::

## Konfigurasi Tingkat Situs

```js
export default {
  lastUpdated: true
}
```

## Konfigurasi Frontmatter

Ini dapat dinonaktifkan per halaman menggunakan opsi `lastUpdated` di frontmatter:

```yaml
---
lastUpdated: false
---
```

Lihat juga [Default Theme: Last Updated](./default-theme-config#lastupdated) untuk detail lebih lanjut. Nilai truthy apa pun di tingkat tema juga akan mengaktifkan fitur ini kecuali dinonaktifkan secara eksplisit di tingkat situs atau halaman.
