---
description: Tampilkan tautan edit pada halaman dokumen untuk memungkinkan pengguna menyarankan perubahan di GitHub atau GitLab.
---

# Edit Link

## Konfigurasi Tingkat Situs

Edit Link dapat digunakan untuk menampilkan tautan untuk mengedit halaman pada layanan manajemen Git seperti GitHub atau GitLab. Untuk mengaktifkannya, tambahkan opsi `themeConfig.editLink` ke config Anda.

```js
export default {
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path'
    }
  }
}
```

Opsi `pattern` mendefinisikan struktur URL untuk tautan, dan `:path` akan diganti dengan path halaman.

Anda juga dapat memberikan fungsi murni yang menerima [`PageData`](./runtime-api#usedata) sebagai argumen dan mengembalikan string URL.

```js
export default {
  themeConfig: {
    editLink: {
      pattern: ({ filePath }) => {
        if (filePath.startsWith('packages/')) {
          return `https://github.com/acme/monorepo/edit/main/${filePath}`
        } else {
          return `https://github.com/acme/monorepo/edit/main/docs/${filePath}`
        }
      }
    }
  }
}
```

Fungsi ini tidak boleh memiliki side-effect atau mengakses apa pun di luar cakupannya karena akan diserialisasi dan dijalankan di browser.

Secara default, ini akan menambahkan teks tautan "Edit this page" di bagian bawah halaman dokumen. Anda dapat menyesuaikan teks ini dengan mendefinisikan opsi `text`.

```js
export default {
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    }
  }
}
```

## Konfigurasi Frontmatter

Ini dapat dinonaktifkan per halaman menggunakan opsi `editLink` di frontmatter:

```yaml
---
editLink: false
---
```
