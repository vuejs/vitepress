---
description: Pelajari cara menggunakan YAML frontmatter di file Markdown VitePress untuk mengontrol metadata dan perilaku tingkat halaman.
---

# Frontmatter

## Penggunaan

VitePress mendukung YAML frontmatter di semua file Markdown, mem-parsing-nya dengan [gray-matter](https://github.com/jonschlinkert/gray-matter). Frontmatter harus berada di bagian atas file Markdown (sebelum elemen apa pun termasuk tag `<script>`), dan harus berupa YAML valid yang ditulis di antara tiga garis hubung. Contoh:

```md
---
title: Docs with VitePress
editLink: true
---
```

Banyak opsi konfigurasi situs atau tema default memiliki opsi terkait di frontmatter. Anda dapat menggunakan frontmatter untuk menimpa perilaku tertentu hanya untuk halaman saat ini. Untuk detailnya, lihat [Referensi Konfigurasi Frontmatter](../reference/frontmatter-config).

Anda juga dapat mendefinisikan data frontmatter kustom Anda sendiri, untuk digunakan dalam ekspresi Vue dinamis di halaman.

## Mengakses Data Frontmatter

Data frontmatter dapat diakses melalui variabel global khusus `$frontmatter`:

Berikut contoh bagaimana Anda dapat menggunakannya di file Markdown Anda:

```md
---
title: Docs with VitePress
editLink: true
---

# {{ $frontmatter.title }}

Konten panduan
```

Anda juga dapat mengakses data frontmatter halaman saat ini di `<script setup>` dengan helper [`useData()`](../reference/runtime-api#usedata).

## Format Frontmatter Alternatif

VitePress juga mendukung sintaks frontmatter JSON, dimulai dan diakhiri dengan kurung kurawal:

```json
---
{
  "title": "Blogging Like a Hacker",
  "editLink": true
}
---
```
