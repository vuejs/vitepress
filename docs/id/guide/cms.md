---
outline: deep
description: Hubungkan VitePress ke headless CMS menggunakan rute dinamis dan data loader.
---

# Menghubungkan ke CMS

## Alur Kerja Umum

Menghubungkan VitePress ke CMS sebagian besar akan berkisar pada [Rute Dinamis](./routing#dynamic-routes). Pastikan Anda memahami cara kerjanya sebelum melanjutkan.

Karena setiap CMS bekerja secara berbeda, di sini kami hanya dapat memberikan alur kerja umum yang perlu Anda adaptasi ke skenario spesifik Anda.

1. Jika CMS Anda memerlukan otentikasi, buat file `.env` untuk menyimpan token API Anda dan muat seperti ini:

    ```js
    // posts/[id].paths.js
    import { loadEnv } from 'vitepress'

    const env = loadEnv('', process.cwd())
    ```

2. Ambil data yang diperlukan dari CMS dan format menjadi data paths yang tepat:

    ```js
    export default {
      async paths() {
        // gunakan library klien CMS masing-masing jika diperlukan
        const data = await (await fetch('https://my-cms-api', {
          headers: {
            // token jika diperlukan
          }
        })).json()

        return data.map(entry => {
          return {
            params: { id: entry.id, /* title, authors, date dll. */ },
            content: entry.content
          }
        })
      }
    }
    ```

3. Render konten di halaman:

    ```md
    # {{ $params.title }}

    - oleh {{ $params.author }} pada {{ $params.date }}

    <!-- @content -->
    ```

## Panduan Integrasi

Jika Anda telah menulis panduan tentang mengintegrasikan VitePress dengan CMS tertentu, silakan gunakan tautan "Edit this page" di bawah ini untuk mengirimkannya di sini!
