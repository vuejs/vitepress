---
description: Sesuaikan tautan halaman sebelumnya dan berikutnya yang ditampilkan di bagian bawah halaman dokumen di VitePress.
---

# Prev Next Links

Anda dapat menyesuaikan teks dan tautan untuk halaman sebelumnya dan berikutnya (ditampilkan di footer dokumen). Ini berguna jika Anda menginginkan teks yang berbeda dari yang ada di sidebar. Selain itu, Anda mungkin merasa berguna untuk menonaktifkan footer atau menautkan ke halaman yang tidak termasuk dalam sidebar Anda.

## prev

- Tipe: `string | false | { text?: string; link?: string }`

- Detail:

  Menentukan teks/tautan yang akan ditampilkan pada tautan ke halaman sebelumnya. Jika Anda tidak mengatur ini di frontmatter, teks/tautan akan disimpulkan dari konfigurasi sidebar.

- Contoh:

  - Untuk menyesuaikan hanya teks:

    ```yaml
    ---
    prev: 'Memulai | Markdown'
    ---
    ```

  - Untuk menyesuaikan teks dan tautan:

    ```yaml
    ---
    prev:
      text: 'Markdown'
      link: '/guide/markdown'
    ---
    ```

  - Untuk menyembunyikan halaman sebelumnya:

    ```yaml
    ---
    prev: false
    ---
    ```

## next

Sama seperti `prev` tetapi untuk halaman berikutnya.
