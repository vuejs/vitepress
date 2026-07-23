---
description: Ekstensi Markdown bawaan VitePress termasuk custom container, blok kode dengan syntax highlighting, line highlighting, code group, dan lainnya.
---

# Ekstensi Markdown

VitePress hadir dengan ekstensi Markdown bawaan.

## Header Anchors

Header secara otomatis mendapatkan tautan anchor. Rendering anchor dapat dikonfigurasi menggunakan opsi `markdown.anchor`.

### Custom anchors

Untuk menentukan tag anchor kustom untuk heading alih-alih menggunakan yang dihasilkan otomatis, tambahkan suffix ke heading:

```
# Menggunakan custom anchors {#my-anchor}
```

Dengan ini, Anda dapat menautkan ke heading sebagai `#my-anchor` alih-alih default `#menggunakan-custom-anchors`.

## Tautan

Tautan internal dan eksternal mendapatkan perlakuan khusus.

### Tautan Internal

Tautan internal dikonversi menjadi router link untuk navigasi SPA. Selain itu, setiap `index.md` yang terdapat di setiap sub-direktori akan secara otomatis dikonversi menjadi `index.html`, dengan URL terkait `/`.

Misalnya, dengan struktur direktori berikut:

```
.
├─ index.md
├─ foo
│  ├─ index.md
│  ├─ one.md
│  └─ two.md
└─ bar
   ├─ index.md
   ├─ three.md
   └─ four.md
```

Dan dengan asumsi Anda berada di `foo/one.md`:

```md
[Home](/) <!-- mengirim pengguna ke root index.md -->
[foo](/foo/) <!-- mengirim pengguna ke index.html direktori foo -->
[foo heading](./#heading) <!-- mengarahkan pengguna ke heading di file indeks foo -->
[bar - three](../bar/three) <!-- Anda dapat menghilangkan ekstensi -->
[bar - three](../bar/three.md) <!-- Anda dapat menambahkan .md -->
[bar - four](../bar/four.html) <!-- atau Anda dapat menambahkan .html -->
```

### Page Suffix

Halaman dan tautan internal dihasilkan dengan suffix `.html` secara default.

### Tautan Eksternal

Tautan keluar secara otomatis mendapatkan `target="_blank" rel="noreferrer"`:

- [vuejs.org](https://vuejs.org)
- [VitePress on GitHub](https://github.com/vuejs/vitepress)

## Frontmatter

[YAML frontmatter](https://jekyllrb.com/docs/front-matter/) didukung secara bawaan:

```yaml
---
title: Blogging Like a Hacker
lang: en-US
---
```

Data ini akan tersedia untuk halaman lainnya, bersama dengan semua komponen kustom dan tema.

Untuk detail lebih lanjut, lihat [Frontmatter](../reference/frontmatter-config).

## Tabel Gaya GitHub

**Input**

```md
| Tables        |      Are      |  Cool |
| ------------- | :-----------: | ----: |
| col 3 is      | right-aligned | $1600 |
| col 2 is      |   centered    |   $12 |
| zebra stripes |   are neat    |    $1 |
```

**Output**

| Tables        |      Are      |   Cool |
| ------------- | :-----------: | -----: |
| col 3 is      | right-aligned | \$1600 |
| col 2 is      |   centered    |   \$12 |
| zebra stripes |   are neat    |    \$1 |

## Emoji :tada:

**Input**

```
:tada: :100:
```

**Output**

:tada: :100:

[Daftar semua emoji](https://github.com/markdown-it/markdown-it-emoji/blob/master/lib/data/full.mjs) tersedia.

## Daftar Isi

**Input**

```
[[toc]]
```

**Output**

[[toc]]

Rendering TOC dapat dikonfigurasi menggunakan opsi `markdown.toc`.

## Custom Container

Custom container dapat didefinisikan berdasarkan tipe, judul, dan kontennya.

### Judul Default

**Input**

```md
::: info
This is an info box.
:::

::: tip
This is a tip.
:::

::: warning
This is a warning.
:::

::: danger
This is a dangerous warning.
:::

::: details
This is a details block.
:::
```

**Output**

::: info
This is an info box.
:::

::: tip
This is a tip.
:::

::: warning
This is a warning.
:::

::: danger
This is a dangerous warning.
:::

::: details
This is a details block.
:::

### Judul Kustom

Anda dapat mengatur judul kustom dengan menambahkan teks tepat setelah "tipe" container.

**Input**

````md
::: danger STOP
Danger zone, do not proceed
:::

::: details Click me to toggle the code
```js
console.log('Hello, VitePress!')
```
:::
````

**Output**

::: danger STOP
Danger zone, do not proceed
:::

::: details Click me to toggle the code
```js
console.log('Hello, VitePress!')
```
:::

Selain itu, Anda dapat mengatur judul kustom secara global dengan menambahkan konten berikut di konfigurasi situs, berguna jika tidak menulis dalam bahasa Inggris:

```ts
// config.ts
export default defineConfig({
  // ...
  markdown: {
    container: {
      tipLabel: '提示',
      warningLabel: '警告',
      dangerLabel: '危险',
      infoLabel: '信息',
      detailsLabel: '详细信息'
    }
  }
  // ...
})
```

### Atribut Tambahan

Anda dapat menambahkan atribut tambahan ke custom container. Kami menggunakan [markdown-it-attrs](https://github.com/arve0/markdown-it-attrs) untuk fitur ini, dan ini didukung di hampir semua elemen markdown. Misalnya, Anda dapat mengatur atribut `open` untuk membuat details block terbuka secara default:

**Input**

````md
::: details Click me to toggle the code {open}
```js
console.log('Hello, VitePress!')
```
:::
````

**Output**

::: details Click me to toggle the code {open}
```js
console.log('Hello, VitePress!')
```
:::

### `raw`

Ini adalah container khusus yang dapat digunakan untuk mencegah konflik style dan router dengan VitePress. Ini sangat berguna ketika Anda mendokumentasikan library komponen. Anda mungkin juga ingin memeriksa [whyframe](https://whyframe.dev/docs/integrations/vitepress) untuk isolasi yang lebih baik.

**Sintaks**

```md
::: raw
Wraps in a `<div class="vp-raw">`
:::
```

Kelas `vp-raw` juga dapat digunakan langsung pada elemen. Isolasi style saat ini bersifat opt-in:

- Instal `postcss` dengan package manager pilihan Anda:

  ```sh
  $ npm add -D postcss
  ```

- Buat file bernama `docs/postcss.config.mjs` dan tambahkan ini ke dalamnya:

  ```js
  import { postcssIsolateStyles } from 'vitepress'

  export default {
    plugins: [postcssIsolateStyles()]
  }
  ```

  Anda dapat meneruskan opsinya seperti ini:

  ```js
  postcssIsolateStyles({
    includeFiles: [/custom\.css/] // default ke [/vp-doc\.css/, /base\.css/]
  })
  ```

## GitHub-flavored Alerts

VitePress juga mendukung [GitHub-flavored alerts](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts) untuk dirender sebagai callout. Mereka akan dirender sama seperti [custom container](#custom-container).

```md
> [!NOTE]
> Menyoroti informasi yang harus diperhatikan pengguna, bahkan saat membaca sekilas.

> [!TIP]
> Informasi opsional untuk membantu pengguna lebih sukses.

> [!IMPORTANT]
> Informasi penting yang diperlukan pengguna untuk berhasil.

> [!WARNING]
> Konten penting yang menuntut perhatian pengguna segera karena potensi risiko.

> [!CAUTION]
> Konsekuensi negatif potensial dari suatu tindakan.
```

> [!NOTE]
> Menyoroti informasi yang harus diperhatikan pengguna, bahkan saat membaca sekilas.

> [!TIP]
> Informasi opsional untuk membantu pengguna lebih sukses.

> [!IMPORTANT]
> Informasi penting yang diperlukan pengguna untuk berhasil.

> [!WARNING]
> Konten penting yang menuntut perhatian pengguna segera karena potensi risiko.

> [!CAUTION]
> Konsekuensi negatif potensial dari suatu tindakan.

## Syntax Highlighting di Blok Kode

VitePress menggunakan [Shiki](https://github.com/shikijs/shiki) untuk menyorot sintaks bahasa di blok kode Markdown, menggunakan teks berwarna. Shiki mendukung berbagai bahasa pemrograman. Yang perlu Anda lakukan adalah menambahkan alias bahasa yang valid ke awal backtick untuk blok kode:

**Input**

````
```js
export default {
  name: 'MyComponent',
  // ...
}
```
````

````
```html
<ul>
  <li v-for="todo in todos" :key="todo.id">
    {{ todo.text }}
  </li>
</ul>
```
````

**Output**

```js
export default {
  name: 'MyComponent'
  // ...
}
```

```html
<ul>
  <li v-for="todo in todos" :key="todo.id">
    {{ todo.text }}
  </li>
</ul>
```

[Daftar bahasa yang valid](https://shiki.style/languages) tersedia di repositori Shiki.

Anda juga dapat menyesuaikan tema syntax highlight, mengonfigurasi alias bahasa, dan mengatur label bahasa kustom di app config. Lihat [opsi `markdown`](../reference/site-config#markdown) untuk detail lebih lanjut.

## Line Highlighting di Blok Kode

**Input**

````
```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```
````

**Output**

```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```

Selain satu baris, Anda juga dapat menentukan beberapa baris tunggal, rentang, atau keduanya:

- Rentang baris: misalnya `{5-8}`, `{3-10}`, `{10-17}`
- Beberapa baris tunggal: misalnya `{4,7,9}`
- Rentang baris dan baris tunggal: misalnya `{4,7-13,16,23-27,40}`

**Input**

````
```js{1,4,6-8}
export default { // Highlighted
  data () {
    return {
      msg: `Highlighted!
      This line isn't highlighted,
      but this and the next 2 are.`,
      motd: 'VitePress is awesome',
      lorem: 'ipsum'
    }
  }
}
```
````

**Output**

```js{1,4,6-8}
export default { // Highlighted
  data () {
    return {
      msg: `Highlighted!
      This line isn't highlighted,
      but this and the next 2 are.`,
      motd: 'VitePress is awesome',
      lorem: 'ipsum',
    }
  }
}
```

Alternatifnya, dimungkinkan untuk menyorot langsung di baris dengan menggunakan komentar `// [!code highlight]`.

**Input**

````
```js
export default {
  data () {
    return {
      msg: 'Highlighted!' // [!!code highlight]
    }
  }
}
```
````

**Output**

```js
export default {
  data() {
    return {
      msg: 'Highlighted!' // [!code highlight]
    }
  }
}
```

## Focus di Blok Kode

Menambahkan komentar `// [!code focus]` pada sebuah baris akan memfokuskannya dan memburamkan bagian kode lainnya.

Selain itu, Anda dapat menentukan jumlah baris untuk difokuskan menggunakan `// [!code focus:<lines>]`.

**Input**

````
```js
export default {
  data () {
    return {
      msg: 'Focused!' // [!!code focus]
    }
  }
}
```
````

**Output**

```js
export default {
  data() {
    return {
      msg: 'Focused!' // [!code focus]
    }
  }
}
```

## Colored Diffs di Blok Kode

Menambahkan komentar `// [!code --]` atau `// [!code ++]` pada sebuah baris akan membuat diff dari baris tersebut, sambil mempertahankan warna dari blok kode.

**Input**

````
```js
export default {
  data () {
    return {
      msg: 'Removed' // [!!code --]
      msg: 'Added' // [!!code ++]
    }
  }
}
```
````

**Output**

```js
export default {
  data () {
    return {
      msg: 'Removed' // [!code --]
      msg: 'Added' // [!code ++]
    }
  }
}
```

## Errors dan Warnings di Blok Kode

Menambahkan komentar `// [!code warning]` atau `// [!code error]` pada sebuah baris akan mewarnainya sesuai.

**Input**

````
```js
export default {
  data () {
    return {
      msg: 'Error', // [!!code error]
      msg: 'Warning' // [!!code warning]
    }
  }
}
```
````

**Output**

```js
export default {
  data() {
    return {
      msg: 'Error', // [!code error]
      msg: 'Warning' // [!code warning]
    }
  }
}
```

## Nomor Baris

Anda dapat mengaktifkan nomor baris untuk setiap blok kode melalui konfigurasi:

```js
export default {
  markdown: {
    lineNumbers: true
  }
}
```

Lihat [opsi `markdown`](../reference/site-config#markdown) untuk detail lebih lanjut.

Anda dapat menambahkan tanda `:line-numbers` / `:no-line-numbers` di fenced code block Anda untuk menimpa nilai yang diatur dalam konfigurasi.

Anda juga dapat menyesuaikan nomor baris awal dengan menambahkan `=` setelah `:line-numbers`. Misalnya, `:line-numbers=2` berarti nomor baris di blok kode akan dimulai dari `2`.

**Input**

````md
```ts {1}
// line-numbers is disabled by default
const line2 = 'This is line 2'
const line3 = 'This is line 3'
```

```ts:line-numbers {1}
// line-numbers is enabled
const line2 = 'This is line 2'
const line3 = 'This is line 3'
```

```ts:line-numbers=2 {1}
// line-numbers is enabled and start from 2
const line3 = 'This is line 3'
const line4 = 'This is line 4'
```
````

**Output**

```ts {1}
// line-numbers is disabled by default
const line2 = 'This is line 2'
const line3 = 'This is line 3'
```

```ts:line-numbers {1}
// line-numbers is enabled
const line2 = 'This is line 2'
const line3 = 'This is line 3'
```

```ts:line-numbers=2 {1}
// line-numbers is enabled and start from 2
const line3 = 'This is line 3'
const line4 = 'This is line 4'
```

## Import Code Snippets

Anda dapat mengimpor potongan kode dari file yang ada melalui sintaks berikut:

```md
<<< @/filepath
```

Ini juga mendukung [line highlighting](#line-highlighting-di-blok-kode):

```md
<<< @/filepath{highlightLines}
```

**Input**

```md
<<< @/snippets/snippet.js{2}
```

**File kode**

<<< @/snippets/snippet.js

**Output**

<<< @/snippets/snippet.js{2}

::: tip
Nilai `@` sesuai dengan source root. Secara default, ini adalah project root VitePress, kecuali `srcDir` dikonfigurasi. Alternatifnya, Anda juga dapat mengimpor dari path relatif:

```md
<<< ../snippets/snippet.js
```

:::

Anda juga dapat menggunakan [VS Code region](https://code.visualstudio.com/docs/editor/codebasics#_folding) untuk hanya menyertakan bagian yang sesuai dari file kode. Anda dapat memberikan nama region kustom setelah `#` mengikuti filepath:

**Input**

```md
<<< @/snippets/snippet-with-region.js#snippet{1}
```

**File kode**

<<< @/snippets/snippet-with-region.js

**Output**

<<< @/snippets/snippet-with-region.js#snippet{1}

Anda juga dapat menentukan bahasa di dalam kurung kurawal (`{}`) seperti ini:

```md
<<< @/snippets/snippet.cs{c#}

<!-- dengan line highlighting: -->

<<< @/snippets/snippet.cs{1,2,4-6 c#}

<!-- dengan nomor baris: -->

<<< @/snippets/snippet.cs{1,2,4-6 c#:line-numbers}
```

Ini berguna jika bahasa sumber tidak dapat disimpulkan dari ekstensi file Anda.

## Code Groups

Anda dapat mengelompokkan beberapa blok kode seperti ini:

**Input**

````md
::: code-group

```js [config.js]
/**
 * @type {import('vitepress').UserConfig}
 */
const config = {
  // ...
}

export default config
```

```ts [config.ts]
import type { UserConfig } from 'vitepress'

const config: UserConfig = {
  // ...
}

export default config
```

:::
````

**Output**

::: code-group

```js [config.js]
/**
 * @type {import('vitepress').UserConfig}
 */
const config = {
  // ...
}

export default config
```

```ts [config.ts]
import type { UserConfig } from 'vitepress'

const config: UserConfig = {
  // ...
}

export default config
```

:::

Anda juga dapat [mengimpor potongan kode](#import-code-snippets) di code group:

**Input**

```md
::: code-group

<!-- nama file digunakan sebagai judul secara default -->

<<< @/snippets/snippet.js

<!-- Anda juga dapat memberikan yang kustom -->

<<< @/snippets/snippet-with-region.js#snippet{1,2 ts:line-numbers} [snippet with region]

:::
```

**Output**

::: code-group

<<< @/snippets/snippet.js

<<< @/snippets/snippet-with-region.js#snippet{1,2 ts:line-numbers} [snippet with region]

:::

## Markdown File Inclusion

Anda dapat menyertakan file markdown di dalam file markdown lain, bahkan bersarang.

::: tip
Anda juga dapat menambahkan prefix path markdown dengan `@`, dan itu akan bertindak sebagai source root. Secara default, source root adalah project root VitePress, kecuali `srcDir` dikonfigurasi.
:::

Misalnya, Anda dapat menyertakan file markdown relatif menggunakan ini:

**Input**

```md
# Docs

## Basics

<!--@@include: ./parts/basics.md-->
```

**File bagian** (`parts/basics.md`)

```md
Some getting started stuff.

### Configuration

Can be created using `.foorc.json`.
```

**Kode setara**

```md
# Docs

## Basics

Some getting started stuff.

### Configuration

Can be created using `.foorc.json`.
```

Ini juga mendukung pemilihan rentang baris:

**Input**

```md:line-numbers
# Docs

## Basics

<!--@@include: ./parts/basics.md{3,}-->
```

**File bagian** (`parts/basics.md`)

```md:line-numbers
Some getting started stuff.

### Configuration

Can be created using `.foorc.json`.
```

**Kode setara**

```md:line-numbers
# Docs

## Basics

### Configuration

Can be created using `.foorc.json`.
```

Format rentang baris yang dipilih dapat berupa: `{3,}`, `{,10}`, `{1,10}`

Anda juga dapat menggunakan [VS Code region](https://code.visualstudio.com/docs/editor/codebasics#_folding) untuk hanya menyertakan bagian yang sesuai dari file kode. Anda dapat memberikan nama region kustom setelah `#` mengikuti filepath:

**Input**

```md:line-numbers
# Docs

## Basics

<!--@@include: ./parts/basics.md#basic-usage{,2}-->
<!--@@include: ./parts/basics.md#basic-usage{5,}-->
```

**File bagian** (`parts/basics.md`)

```md:line-numbers
<!-- #region basic-usage -->
## Usage Line 1

## Usage Line 2

## Usage Line 3
<!-- #endregion basic-usage -->
```

**Kode setara**

```md:line-numbers
# Docs

## Basics

## Usage Line 1

## Usage Line 3
```

::: warning
Perhatikan bahwa ini tidak menghasilkan error jika file Anda tidak ada. Oleh karena itu, saat menggunakan fitur ini pastikan konten dirender seperti yang diharapkan.
:::

Alih-alih VS Code region, Anda juga dapat menggunakan header anchor untuk menyertakan bagian tertentu dari file. Misalnya, jika Anda memiliki header di file markdown Anda seperti ini:

```md
## My Base Section

Some content here.

### My Sub Section

Some more content here.

## Another Section

Content outside `My Base Section`.
```

Anda dapat menyertakan bagian `My Base Section` seperti ini:

```md
## My Extended Section
<!--@@include: ./parts/basics.md#my-base-section-->
```

**Kode setara**

```md
## My Extended Section

Some content here.

### My Sub Section

Some more content here.
```

Di sini, `my-base-section` adalah id yang dihasilkan dari elemen heading. Jika tidak mudah ditebak, Anda dapat membuka file bagian di browser Anda dan klik anchor heading (simbol `#` di kiri heading saat dihover) untuk melihat id di bilah URL. Atau gunakan browser dev tools untuk memeriksa elemen. Alternatifnya, Anda juga dapat menentukan id ke file bagian seperti ini:

```md
## My Base Section {#custom-id}
```

dan menyertakannya seperti ini:

```md
<!--@@include: ./parts/basics.md#custom-id-->
```

## Persamaan Matematika

Ini saat ini bersifat opt-in. Untuk mengaktifkannya, Anda perlu menginstal `markdown-it-mathjax3` dan mengatur `markdown.math` ke `true` di file konfigurasi Anda:

```sh
npm add -D markdown-it-mathjax3@^4
```

```ts [.vitepress/config.ts]
export default {
  markdown: {
    math: true
  }
}
```

**Input**

```md
When $a \ne 0$, there are two solutions to $(ax^2 + bx + c = 0)$ and they are
$$ x = {-b \pm \sqrt{b^2-4ac} \over 2a} $$

**Maxwell's equations:**

| equation                                                                                                                                                                  | description                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| $\nabla \cdot \vec{\mathbf{B}}  = 0$                                                                                                                                      | divergence of $\vec{\mathbf{B}}$ is zero                                               |
| $\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t}  = \vec{\mathbf{0}}$                                                          | curl of $\vec{\mathbf{E}}$ is proportional to the rate of change of $\vec{\mathbf{B}}$ |
| $\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} = \frac{4\pi}{c}\vec{\mathbf{j}}    \nabla \cdot \vec{\mathbf{E}} = 4 \pi \rho$ | _wha?_                                                                                 |
```

**Output**

When $a \ne 0$, there are two solutions to $(ax^2 + bx + c = 0)$ and they are
$$ x = {-b \pm \sqrt{b^2-4ac} \over 2a} $$

**Maxwell's equations:**

| equation                                                                                                                                                                  | description                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| $\nabla \cdot \vec{\mathbf{B}}  = 0$                                                                                                                                      | divergence of $\vec{\mathbf{B}}$ is zero                                               |
| $\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t}  = \vec{\mathbf{0}}$                                                          | curl of $\vec{\mathbf{E}}$ is proportional to the rate of change of $\vec{\mathbf{B}}$ |
| $\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} = \frac{4\pi}{c}\vec{\mathbf{j}}    \nabla \cdot \vec{\mathbf{E}} = 4 \pi \rho$ | _wha?_                                                                                 |

## Image Lazy Loading

Anda dapat mengaktifkan lazy loading untuk setiap gambar yang ditambahkan melalui markdown dengan mengatur `lazyLoading` ke `true` di file konfigurasi Anda:

```js
export default {
  markdown: {
    image: {
      // image lazy loading dinonaktifkan secara default
      lazyLoading: true
    }
  }
}
```

## Konfigurasi Lanjutan

VitePress menggunakan [markdown-it](https://github.com/markdown-it/markdown-it) sebagai perender Markdown. Banyak ekstensi di atas diimplementasikan melalui plugin kustom. Anda dapat lebih menyesuaikan instance `markdown-it` menggunakan opsi `markdown` di `.vitepress/config.js`:

```js
import { defineConfig } from 'vitepress'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItFoo from 'markdown-it-foo'

export default defineConfig({
  markdown: {
    // opsi untuk markdown-it-anchor
    // https://github.com/valeriangalliat/markdown-it-anchor#usage
    anchor: {
      permalink: markdownItAnchor.permalink.headerLink()
    },

    // opsi untuk @mdit-vue/plugin-toc
    // https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-toc#options
    toc: { level: [1, 2] },

    config: (md) => {
      // gunakan lebih banyak plugin markdown-it!
      md.use(markdownItFoo)
    }
  }
})
```

Lihat daftar lengkap properti yang dapat dikonfigurasi di [Referensi Konfigurasi: App Config](../reference/site-config#markdown).
