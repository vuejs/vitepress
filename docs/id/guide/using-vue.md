---
description: Gunakan komponen Vue dan fitur templating dinamis langsung di dalam file Markdown di VitePress.
---

# Menggunakan Vue di Markdown

Di VitePress, setiap file Markdown dikompilasi menjadi HTML dan kemudian diproses sebagai [Vue Single-File Component](https://vuejs.org/guide/scaling-up/sfc.html). Ini berarti Anda dapat menggunakan fitur Vue apa pun di dalam Markdown, termasuk templating dinamis, menggunakan komponen Vue, atau logika komponen Vue dalam halaman apa pun dengan menambahkan tag `<script>`.

Perlu dicatat bahwa VitePress memanfaatkan compiler Vue untuk secara otomatis mendeteksi dan mengoptimalkan bagian konten Markdown yang murni statis. Konten statis dioptimalkan menjadi single placeholder node dan dihilangkan dari payload JavaScript halaman untuk kunjungan awal. Konten tersebut juga dilewati selama client-side hydration. Singkatnya, Anda hanya membayar untuk bagian dinamis pada halaman tertentu.

::: tip Kompatibilitas SSR
Semua penggunaan Vue harus kompatibel dengan SSR. Lihat [Kompatibilitas SSR](./ssr-compat) untuk detail dan solusi umum.
:::

## Templating

### Interpolasi

Setiap file Markdown pertama-tama dikompilasi menjadi HTML dan kemudian diteruskan sebagai komponen Vue ke pipeline proses Vite. Ini berarti Anda dapat menggunakan interpolasi gaya Vue dalam teks:

**Input**

```md
{{ 1 + 1 }}
```

**Output**

<div class="language-text"><pre><code>{{ 1 + 1 }}</code></pre></div>

### Directive

Directive juga berfungsi (perhatikan bahwa secara desain, HTML mentah juga valid di Markdown):

**Input**

```html
<span v-for="i in 3">{{ i }}</span>
```

**Output**

<div class="language-text"><pre><code><span v-for="i in 3">{{ i }} </span></code></pre></div>

## `<script>` dan `<style>`

Tag `<script>` dan `<style>` tingkat root di file Markdown berfungsi seperti di Vue SFC, termasuk `<script setup>`, `<style module>`, dll. Perbedaan utama di sini adalah tidak ada tag `<template>`: semua konten tingkat root lainnya adalah Markdown. Perhatikan juga bahwa semua tag harus ditempatkan **setelah** frontmatter:

```html
---
hello: world
---

<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

## Konten Markdown

Hitungannya: {{ count }}

<button :class="$style.button" @click="count++">Increment</button>

<style module>
.button {
  color: red;
  font-weight: bold;
}
</style>
```

::: warning Hindari `<style scoped>` di Markdown
Ketika digunakan di Markdown, `<style scoped>` memerlukan penambahan atribut khusus ke setiap elemen di halaman saat ini, yang akan secara signifikan memperbesar ukuran halaman. `<style module>` lebih disarankan ketika styling dengan cakupan lokal diperlukan di halaman.
:::

Anda juga memiliki akses ke runtime API VitePress seperti helper [`useData`](../reference/runtime-api#usedata), yang menyediakan akses ke metadata halaman saat ini:

**Input**

```html
<script setup>
import { useData } from 'vitepress'

const { page } = useData()
</script>

<pre>{{ page }}</pre>
```

**Output**

```json
{
  "path": "/using-vue.html",
  "title": "Using Vue in Markdown",
  "frontmatter": {},
  ...
}
```

## Menggunakan Komponen

Anda dapat mengimpor dan menggunakan komponen Vue langsung di file Markdown.

### Mengimpor di Markdown

Jika sebuah komponen hanya digunakan oleh beberapa halaman, disarankan untuk mengimpornya secara eksplisit di tempat penggunaannya. Ini memungkinkan komponen tersebut di-code-split dengan benar dan hanya dimuat ketika halaman terkait ditampilkan:

```md
<script setup>
import CustomComponent from '../components/CustomComponent.vue'
</script>

# Docs

Ini adalah .md yang menggunakan komponen kustom

<CustomComponent />

## More docs

...
```

### Mendaftarkan Komponen Secara Global

Jika sebuah komponen akan digunakan di sebagian besar halaman, komponen tersebut dapat didaftarkan secara global dengan menyesuaikan instance aplikasi Vue. Lihat bagian terkait di [Memperluas Tema Default](./extending-default-theme#registering-global-components) untuk contohnya.

::: warning PENTING
Pastikan nama komponen kustom mengandung tanda hubung atau dalam PascalCase. Jika tidak, ia akan diperlakukan sebagai elemen inline dan dibungkus dalam tag `<p>`, yang akan menyebabkan hydration mismatch karena `<p>` tidak memungkinkan elemen blok ditempatkan di dalamnya.
:::

### Menggunakan Komponen di Header <ComponentInHeader />

Anda dapat menggunakan komponen Vue di header, tetapi perhatikan perbedaan antara sintaks berikut:

| Markdown                                                | Output HTML                               | Header yang Diparsing |
| ------------------------------------------------------- | ----------------------------------------- | --------------------- |
| <pre v-pre><code> # text &lt;Tag/&gt; </code></pre>     | `<h1>text <Tag/></h1>`                    | `text`                |
| <pre v-pre><code> # text \`&lt;Tag/&gt;\` </code></pre> | `<h1>text <code>&lt;Tag/&gt;</code></h1>` | `text <Tag/>`         |

HTML yang dibungkus oleh `<code>` akan ditampilkan apa adanya; hanya HTML yang **tidak** dibungkus yang akan diparsing oleh Vue.

::: tip
Output HTML dihasilkan oleh [Markdown-it](https://github.com/Markdown-it/Markdown-it), sementara header yang diparsing ditangani oleh VitePress (dan digunakan untuk sidebar dan judul dokumen).
:::


## Escaping

Anda dapat meng-escape interpolasi Vue dengan membungkusnya dalam `<span>` atau elemen lain dengan directive `v-pre`:

**Input**

```md
This <span v-pre>{{ will be displayed as-is }}</span>
```

**Output**

<div class="escape-demo">
  <p>This <span v-pre>{{ will be displayed as-is }}</span></p>
</div>

Alternatifnya, Anda dapat membungkus seluruh paragraf dalam custom container `v-pre`:

```md
::: v-pre
{{ This will be displayed as-is }}
:::
```

**Output**

<div class="escape-demo">

::: v-pre
{{ This will be displayed as-is }}
:::

</div>

## Unescape di Blok Kode

Secara default, semua fenced code block secara otomatis dibungkus dengan `v-pre`, sehingga tidak ada sintaks Vue yang akan diproses di dalamnya. Untuk mengaktifkan interpolasi gaya Vue di dalam fences, Anda dapat menambahkan suffix `-vue` ke bahasa, mis. `js-vue`:

**Input**

````md
```js-vue
Hello {{ 1 + 1 }}
```
````

**Output**

```js-vue
Hello {{ 1 + 1 }}
```

Perhatikan bahwa ini mungkin mencegah token tertentu disorot sintaksnya dengan benar.

## Menggunakan CSS Pre-processor

VitePress memiliki [dukungan bawaan](https://vitejs.dev/guide/features.html#css-pre-processors) untuk CSS pre-processor: file `.scss`, `.sass`, `.less`, `.styl` dan `.stylus`. Tidak perlu menginstal plugin khusus Vite untuknya, tetapi pre-processor yang sesuai harus diinstal:

```
# .scss dan .sass
npm install -D sass

# .less
npm install -D less

# .styl dan .stylus
npm install -D stylus
```

Kemudian Anda dapat menggunakan yang berikut di Markdown dan komponen tema:

```vue
<style lang="sass">
.title
  font-size: 20px
</style>
```

## Menggunakan Teleports

VitePress saat ini memiliki dukungan SSG untuk teleport ke body saja. Untuk target lain, Anda dapat membungkusnya di dalam komponen bawaan `<ClientOnly>` atau menyuntikkan markup teleport ke lokasi yang benar di HTML halaman akhir Anda melalui hook [`postRender`](../reference/site-config#postrender).

<ModalDemo />

::: details
<<< @/components/ModalDemo.vue
:::

```md
<ClientOnly>
  <Teleport to="#modal">
    <div>
      // ...
    </div>
  </Teleport>
</ClientOnly>
```

<script setup>
import ModalDemo from '../../components/ModalDemo.vue'
import ComponentInHeader from '../../components/ComponentInHeader.vue'
</script>

<style>
.escape-demo {
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  padding: 0 20px;
}
</style>


## Dukungan VS Code IntelliSense

<!-- Berdasarkan https://github.com/vuejs/language-tools/pull/4321 -->

Vue menyediakan dukungan IntelliSense bawaan melalui [plugin Vue - Official VS Code](https://marketplace.visualstudio.com/items?itemName=Vue.volar). Namun, untuk mengaktifkannya untuk file `.md`, Anda perlu melakukan beberapa penyesuaian pada file konfigurasi.


1. Tambahkan pattern `.md` ke opsi `include` dan `vueCompilerOptions.vitePressExtensions` di file tsconfig/jsconfig:

::: code-group
```json [tsconfig.json]
{
  "include": [
    "docs/**/*.ts",
    "docs/**/*.vue",
    "docs/**/*.md",
  ],
  "vueCompilerOptions": {
    "vitePressExtensions": [".md"],
  },
}
```
:::

2. Tambahkan `markdown` ke opsi `vue.server.includeLanguages` di pengaturan VS Code:

::: code-group
```json [.vscode/settings.json]
{
  "vue.server.includeLanguages": ["vue", "markdown"]
}
```
:::
