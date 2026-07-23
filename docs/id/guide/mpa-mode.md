---
description: Aktifkan mode MPA (Multi-Page Application) di VitePress untuk halaman tanpa JavaScript dengan performa awal yang lebih baik.
---

# Mode MPA <Badge type="warning" text="eksperimental" />

Mode MPA (Multi-Page Application) dapat diaktifkan melalui command line dengan `vitepress build --mpa`, atau melalui konfigurasi dengan opsi `mpa: true`.

Dalam mode MPA, semua halaman dirender tanpa JavaScript apa pun secara default. Hasilnya, situs produksi kemungkinan akan mendapatkan skor performa kunjungan awal yang lebih baik dari alat audit.

Namun, karena tidak adanya navigasi SPA, tautan antar halaman akan menyebabkan reload halaman penuh. Navigasi setelah load dalam mode MPA tidak akan terasa seinstan dalam mode SPA.

Perhatikan juga bahwa tanpa-JS-secara-default berarti Anda pada dasarnya menggunakan Vue murni sebagai bahasa templating sisi server. Tidak ada event handler yang akan dipasang di browser, sehingga tidak akan ada interaktivitas. Untuk memuat JavaScript sisi klien, Anda perlu menggunakan tag khusus `<script client>`:

```html
<script client>
document.querySelector('h1').addEventListener('click', () => {
  console.log('client side JavaScript!')
})
</script>

# Hello
```

`<script client>` adalah fitur khusus VitePress, bukan fitur Vue. Fitur ini bekerja di file `.md` maupun `.vue`, tetapi hanya dalam mode MPA. Client script di semua komponen tema akan dibundel bersama, sementara client script untuk halaman tertentu akan dipisah hanya untuk halaman tersebut.

Perhatikan bahwa `<script client>` **tidak dievaluasi sebagai kode komponen Vue**: ini diproses sebagai modul JavaScript biasa. Karena alasan ini, mode MPA hanya boleh digunakan jika situs Anda memerlukan interaktivitas sisi klien yang sangat minimal.
