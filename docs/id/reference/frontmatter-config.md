---
outline: deep
description: Referensi semua opsi konfigurasi frontmatter yang tersedia untuk halaman Markdown VitePress.
---

# Konfigurasi Frontmatter

Frontmatter mengaktifkan konfigurasi berbasis halaman. Di setiap file markdown, Anda dapat menggunakan konfigurasi frontmatter untuk menimpa opsi konfigurasi tingkat situs atau tingkat tema. Selain itu, ada opsi konfigurasi yang hanya dapat Anda definisikan di frontmatter.

Contoh penggunaan:

```md
---
title: Docs with VitePress
editLink: true
---
```

Anda dapat mengakses data frontmatter melalui global `$frontmatter` dalam ekspresi Vue:

```md
{{ $frontmatter.title }}
```

## title

- Tipe: `string`

Judul untuk halaman. Sama dengan [config.title](./site-config#title), dan ini menimpa konfigurasi tingkat situs.

```yaml
---
title: VitePress
---
```

## titleTemplate

- Tipe: `string | boolean`

Sufiks untuk judul. Sama dengan [config.titleTemplate](./site-config#titletemplate), dan ini menimpa konfigurasi tingkat situs.

```yaml
---
title: VitePress
titleTemplate: Vite & Vue powered static site generator
---
```

## description

- Tipe: `string`

Deskripsi untuk halaman. Sama dengan [config.description](./site-config#description), dan ini menimpa konfigurasi tingkat situs.

```yaml
---
description: VitePress
---
```

## head

- Tipe: `HeadConfig[]`

Menentukan tag head tambahan untuk disuntikkan untuk halaman saat ini. Akan ditambahkan setelah tag head yang disuntikkan oleh konfigurasi tingkat situs.

```yaml
---
head:
  - - meta
    - name: description
      content: hello
  - - meta
    - name: keywords
      content: super duper SEO
---
```

```ts
type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string]
```

## Hanya Tema Default

Opsi frontmatter berikut hanya berlaku ketika menggunakan tema default.

### layout

- Tipe: `doc | home | page`
- Default: `doc`

Menentukan layout halaman.

- `doc` - Menerapkan gaya dokumentasi default ke konten markdown.
- `home` - Layout khusus untuk "Home Page". Anda dapat menambahkan opsi tambahan seperti `hero` dan `features` untuk membuat landing page yang indah dengan cepat.
- `page` - Berperilaku mirip dengan `doc` tetapi tidak menerapkan gaya apa pun ke konten. Berguna ketika Anda ingin membuat halaman yang sepenuhnya kustom.

```yaml
---
layout: doc
---
```

### hero <Badge type="info" text="hanya halaman beranda" />

Mendefinisikan konten bagian hero beranda ketika `layout` diatur ke `home`. Detail lebih lanjut di [Default Theme: Home Page](./default-theme-home-page).

### features <Badge type="info" text="hanya halaman beranda" />

Mendefinisikan item untuk ditampilkan di bagian features ketika `layout` diatur ke `home`. Detail lebih lanjut di [Default Theme: Home Page](./default-theme-home-page).

### navbar

- Tipe: `boolean`
- Default: `true`

Apakah akan menampilkan [navbar](./default-theme-nav).

```yaml
---
navbar: false
---
```

### sidebar

- Tipe: `boolean`
- Default: `true`

Apakah akan menampilkan [sidebar](./default-theme-sidebar).

```yaml
---
sidebar: false
---
```

### aside

- Tipe: `boolean | 'left'`
- Default: `true`

Mendefinisikan lokasi komponen aside di layout `doc`.

Mengatur nilai ini ke `false` mencegah rendering kontainer aside.\
Mengatur nilai ini ke `true` merender aside di sebelah kanan.\
Mengatur nilai ini ke `'left'` merender aside di sebelah kiri.

```yaml
---
aside: false
---
```

### outline

- Tipe: `number | [number, number] | 'deep' | false`
- Default: `2`

Level heading di outline yang akan ditampilkan untuk halaman. Sama dengan [config.themeConfig.outline.level](./default-theme-config#outline), dan ini menimpa nilai yang diatur di konfigurasi tingkat situs.

```yaml
---
outline: [2, 4]
---
```

### lastUpdated

- Tipe: `boolean | Date`
- Default: `true`

Apakah akan menampilkan teks [last updated](./default-theme-last-updated) di footer halaman saat ini. Jika datetime ditentukan, itu akan ditampilkan alih-alih timestamp git yang terakhir dimodifikasi.

```yaml
---
lastUpdated: false
---
```

### editLink

- Tipe: `boolean`
- Default: `true`

Apakah akan menampilkan [edit link](./default-theme-edit-link) di footer halaman saat ini.

```yaml
---
editLink: false
---
```

### footer

- Tipe: `boolean`
- Default: `true`

Apakah akan menampilkan [footer](./default-theme-footer).

```yaml
---
footer: false
---
```

### pageClass

- Tipe: `string`

Menambahkan nama kelas tambahan ke halaman tertentu.

```yaml
---
pageClass: custom-page-class
---
```

Kemudian Anda dapat menyesuaikan gaya halaman tertentu ini di file `.vitepress/theme/custom.css`:

```css
.custom-page-class {
  /* gaya khusus halaman */
}
```

### isHome

- Tipe: `boolean`

Tema default mengandalkan pemeriksaan seperti `frontmatter.layout === 'home'` untuk menentukan apakah halaman saat ini adalah halaman beranda.\
Ini berguna ketika Anda ingin memaksa menampilkan elemen halaman beranda di layout kustom.

```yaml
---
isHome: true
---
```
