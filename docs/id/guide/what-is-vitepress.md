---
description: VitePress adalah generator situs statis yang dirancang untuk membangun situs cepat dan berfokus pada konten berbasis Vite dan Vue.
---

# Apa Itu VitePress?

VitePress adalah [Static Site Generator](https://en.wikipedia.org/wiki/Static_site_generator) (SSG) yang dirancang untuk membangun situs cepat yang berfokus pada konten. Secara singkat, VitePress mengambil konten sumber Anda yang ditulis dalam [Markdown](https://en.wikipedia.org/wiki/Markdown), menerapkan tema padanya, dan menghasilkan halaman HTML statis yang dapat dideploy dengan mudah di mana saja.

<div class="tip custom-block" style="padding-top: 8px">

Hanya ingin mencobanya? Langsung ke [Panduan Cepat](./getting-started).

</div>

## Use Cases

- **Dokumentasi**

  VitePress hadir dengan tema default yang dirancang untuk dokumentasi teknis. Tema ini mendukung halaman yang sedang Anda baca saat ini, beserta dokumentasi untuk [Vite](https://vitejs.dev/), [Rollup](https://rollupjs.org/), [Pinia](https://pinia.vuejs.org/), [VueUse](https://vueuse.org/), [Vitest](https://vitest.dev/), [D3](https://d3js.org/), [UnoCSS](https://unocss.dev/), [Iconify](https://iconify.design/) dan [banyak lagi](https://github.com/search?q=/%22vitepress%22:+/+path:/(?:package%7Cdeno)%5C.jsonc?$/+NOT+is:fork+NOT+is:archived&type=code).

  [Dokumentasi resmi Vue.js](https://vuejs.org/) juga berbasis VitePress, tetapi menggunakan tema kustom yang dibagikan di antara berbagai terjemahan.

- **Blog, Portofolio, dan Situs Marketing**

  VitePress mendukung [tema yang sepenuhnya dikustomisasi](./custom-theme), dengan pengalaman developer setara aplikasi Vite + Vue standar. Dibangun di atas Vite juga berarti Anda dapat langsung memanfaatkan plugin Vite dari ekosistemnya yang kaya. Selain itu, VitePress menyediakan API yang fleksibel untuk [memuat data](./data-loading) (lokal atau remote) dan [menghasilkan rute secara dinamis](./routing#dynamic-routes). Anda dapat menggunakannya untuk membangun hampir apa pun selama data dapat ditentukan pada waktu build.

  [Blog resmi Vue.js](https://blog.vuejs.org/) adalah blog sederhana yang menghasilkan halaman indeks berdasarkan konten lokal.

## Developer Experience

VitePress bertujuan memberikan Developer Experience (DX) yang hebat saat bekerja dengan konten Markdown.

- **[Berbasis Vite:](https://vitejs.dev/)** server langsung menyala, dengan perubahan selalu langsung tercermin (<100ms) tanpa reload halaman.

- **[Ekstensi Markdown Bawaan:](./markdown)** Frontmatter, tabel, syntax highlighting... semua tersedia. Secara khusus, VitePress menyediakan banyak fitur lanjutan untuk bekerja dengan blok kode, menjadikannya ideal untuk dokumentasi yang sangat teknis.

- **[Markdown yang Diperkuat Vue:](./using-vue)** setiap halaman Markdown juga merupakan Vue [Single-File Component](https://vuejs.org/guide/scaling-up/sfc.html), berkat kompatibilitas sintaks 100% template Vue dengan HTML. Anda dapat menyematkan interaktivitas dalam konten statis Anda menggunakan fitur templating Vue atau komponen Vue yang diimpor.

## Performa

Tidak seperti banyak SSG tradisional di mana setiap navigasi menghasilkan reload halaman penuh, situs yang dihasilkan oleh VitePress menyajikan HTML statis pada kunjungan awal, tetapi menjadi [Single Page Application](https://en.wikipedia.org/wiki/Single-page_application) (SPA) untuk navigasi selanjutnya di dalam situs. Model ini, menurut kami, memberikan keseimbangan optimal untuk performa:

- **Initial Load Cepat**

  Kunjungan awal ke halaman mana pun akan disajikan HTML statis yang telah di-pre-render untuk kecepatan loading yang cepat dan SEO optimal. Halaman kemudian memuat bundel JavaScript yang mengubah halaman menjadi Vue SPA ("hydration"). Bertentangan dengan asumsi umum bahwa hydration SPA lambat, proses ini sebenarnya sangat cepat berkat performa mentah Vue 3 dan optimasi compiler. Pada [PageSpeed Insights](https://pagespeed.web.dev/report?url=https%3A%2F%2Fvitepress.dev%2F), situs VitePress umum mencapai skor performa hampir sempurna bahkan pada perangkat seluler kelas bawah dengan jaringan lambat.

- **Navigasi Setelah Load Cepat**

  Lebih penting lagi, model SPA menghasilkan pengalaman pengguna yang lebih baik **setelah** initial load. Navigasi selanjutnya di dalam situs tidak lagi menyebabkan reload halaman penuh. Sebaliknya, konten halaman yang masuk akan diambil dan diperbarui secara dinamis. VitePress juga secara otomatis melakukan pre-fetch potongan halaman untuk tautan yang berada dalam viewport. Dalam kebanyakan kasus, navigasi setelah load akan terasa instan.

- **Interaktivitas Tanpa Dampak Negatif**

  Untuk dapat menghidrasi bagian Vue dinamis yang tertanam di dalam Markdown statis, setiap halaman Markdown diproses sebagai komponen Vue dan dikompilasi menjadi JavaScript. Ini mungkin terdengar tidak efisien, tetapi compiler Vue cukup pintar untuk memisahkan bagian statis dan dinamis, meminimalkan biaya hydration dan ukuran payload. Untuk initial load halaman, bagian statis secara otomatis dihilangkan dari payload JavaScript dan dilewati selama hydration.

## Bagaimana dengan VuePress?

VitePress adalah penerus spiritual VuePress 1. VuePress 1 asli berbasis Vue 2 dan webpack. Dengan Vue 3 dan Vite di baliknya, VitePress memberikan DX yang jauh lebih baik, performa produksi yang lebih baik, tema default yang lebih halus, dan API kustomisasi yang lebih fleksibel.

Perbedaan API antara VitePress dan VuePress 1 sebagian besar terletak pada tema dan kustomisasi. Jika Anda menggunakan VuePress 1 dengan tema default, seharusnya relatif mudah untuk bermigrasi ke VitePress.

Mempertahankan dua SSG secara paralel tidak berkelanjutan, sehingga tim Vue telah memutuskan untuk fokus pada VitePress sebagai SSG utama yang direkomendasikan dalam jangka panjang. Sekarang VuePress 1 telah deprecated, dan VuePress 2 telah diserahkan ke tim komunitas VuePress untuk pengembangan dan pemeliharaan lebih lanjut.
