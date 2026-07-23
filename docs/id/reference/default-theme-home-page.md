---
description: Konfigurasikan layout halaman beranda tema default VitePress dengan bagian hero, fitur, dan konten kustom.
---

# Halaman Beranda

Tema default VitePress menyediakan layout homepage, yang juga dapat Anda lihat digunakan di [beranda situs ini](../). Anda dapat menggunakannya di halaman mana pun dengan menentukan `layout: home` di [frontmatter](./frontmatter-config).

```yaml
---
layout: home
---
```

Namun, opsi ini saja tidak akan banyak berpengaruh. Anda dapat menambahkan beberapa "bagian" pra-template yang berbeda ke beranda dengan mengatur opsi tambahan lainnya seperti `hero` dan `features`.

## Bagian Hero

Bagian Hero muncul di bagian atas beranda. Berikut cara Anda mengonfigurasi bagian Hero.

```yaml
---
layout: home

hero:
  name: VitePress
  text: Vite & Vue powered static site generator.
  tagline: Lorem ipsum...
  image:
    src: /logo.png
    alt: VitePress
  actions:
    - theme: brand
      text: Get Started
      link: /guide/what-is-vitepress
    - theme: alt
      text: View on GitHub
      link: https://github.com/vuejs/vitepress
---
```

```ts
interface Hero {
  // String yang ditampilkan di atas `text`. Menggunakan warna brand
  // dan diharapkan pendek, seperti nama produk.
  name?: string

  // Teks utama untuk bagian hero. Ini akan didefinisikan
  // sebagai tag `h1`.
  text: string

  // Tagline yang ditampilkan di bawah `text`.
  tagline?: string

  // Gambar ditampilkan di samping area teks dan tagline.
  image?: ThemeableImage

  // Tombol aksi untuk ditampilkan di bagian hero beranda.
  actions?: HeroAction[]
}

type ThemeableImage =
  | string
  | { src: string; alt?: string }
  | { light: string; dark: string; alt?: string }

interface HeroAction {
  // Tema warna tombol. Default ke `brand`.
  theme?: 'brand' | 'alt'

  // Label tombol.
  text: string

  // Tautan tujuan tombol.
  link: string

  // Atribut target tautan.
  target?: string

  // Atribut rel tautan.
  rel?: string
}
```

### Menyesuaikan warna name

VitePress menggunakan warna brand (`--vp-c-brand-1`) untuk `name`. Namun, Anda dapat menyesuaikan warna ini dengan menimpa variabel `--vp-home-hero-name-color`.

```css
:root {
  --vp-home-hero-name-color: blue;
}
```

Anda juga dapat menyesuaikannya lebih lanjut dengan menggabungkan `--vp-home-hero-name-background` untuk memberikan warna gradien pada `name`.

```css
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe, #41d1ff);
}
```

## Bagian Features

Di bagian Features, Anda dapat mencantumkan sejumlah fitur yang ingin ditampilkan tepat setelah bagian Hero. Untuk mengonfigurasinya, berikan opsi `features` ke frontmatter.

Anda dapat memberikan ikon untuk setiap fitur, yang dapat berupa emoji atau jenis gambar apa pun. Ketika ikon yang dikonfigurasi adalah gambar (svg, png, jpeg...), Anda harus memberikan ikon dengan lebar dan tinggi yang tepat; Anda juga dapat memberikan deskripsi, ukuran intrinsiknya serta varian untuk tema gelap dan terang jika diperlukan.

```yaml
---
layout: home

features:
  - icon: 🛠️
    title: Simple and minimal, always
    details: Lorem ipsum...
  - icon:
      src: /cool-feature-icon.svg
    title: Another cool feature
    details: Lorem ipsum...
  - icon:
      dark: /dark-feature-icon.svg
      light: /light-feature-icon.svg
    title: Another cool feature
    details: Lorem ipsum...
---
```

```ts
interface Feature {
  // Tampilkan ikon pada setiap kotak fitur.
  icon?: FeatureIcon

  // Judul fitur.
  title: string

  // Detail fitur.
  details: string

  // Tautan ketika diklik pada komponen fitur. Tautan dapat
  // berupa internal atau eksternal.
  //
  // mis. `guide/reference/default-theme-home-page` atau `https://example.com`
  link?: string

  // Teks tautan yang akan ditampilkan di dalam komponen fitur. Paling baik
  // digunakan dengan opsi `link`.
  //
  // mis. `Learn more`, `Visit page`, dll.
  linkText?: string

  // Atribut rel tautan untuk opsi `link`.
  //
  // mis. `external`
  rel?: string

  // Atribut target tautan untuk opsi `link`.
  target?: string
}

type FeatureIcon =
  | string
  | { src: string; alt?: string; width?: string; height: string }
  | {
      light: string
      dark: string
      alt?: string
      width?: string
      height: string
    }
```

## Konten Markdown

Anda dapat menambahkan konten tambahan ke beranda situs Anda hanya dengan menambahkan Markdown di bawah pembatas frontmatter `---`.

````md
---
layout: home

hero:
  name: VitePress
  text: Vite & Vue powered static site generator.
---

## Memulai

Anda dapat mulai menggunakan VitePress langsung menggunakan `npx`!

```sh
npm init
npx vitepress init
```
````

::: info
VitePress tidak selalu menata konten tambahan dari halaman `layout: home` secara otomatis. Untuk kembali ke perilaku lama, Anda dapat menambahkan `markdownStyles: false` ke frontmatter.
:::
