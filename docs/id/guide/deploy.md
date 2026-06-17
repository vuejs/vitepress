---
description: Deploy situs VitePress Anda ke platform populer seperti Netlify, Vercel, GitHub Pages, dan lainnya.
outline: deep
---

# Deploy Situs VitePress Anda

Panduan berikut didasarkan pada beberapa asumsi bersama:

- Situs VitePress berada di dalam direktori `docs` proyek Anda.
- Anda menggunakan direktori output build default (`.vitepress/dist`).
- VitePress diinstal sebagai dependensi lokal di proyek Anda, dan Anda telah menyiapkan script berikut di `package.json` Anda:

  ```json [package.json]
  {
    "scripts": {
      "docs:build": "vitepress build docs",
      "docs:preview": "vitepress preview docs"
    }
  }
  ```

## Build dan Uji Secara Lokal

1. Jalankan perintah ini untuk membangun docs:

   ```sh
   $ npm run docs:build
   ```

2. Setelah dibangun, pratinjau secara lokal dengan menjalankan:

   ```sh
   $ npm run docs:preview
   ```

   Perintah `preview` akan memulai server web statis lokal yang akan menyajikan direktori output `.vitepress/dist` di `http://localhost:4173`. Anda dapat menggunakan ini untuk memastikan semuanya terlihat baik sebelum push ke produksi.

3. Anda dapat mengonfigurasi port server dengan meneruskan `--port` sebagai argumen.

   ```json
   {
     "scripts": {
       "docs:preview": "vitepress preview docs --port 8080"
     }
   }
   ```

   Sekarang metode `docs:preview` akan meluncurkan server di `http://localhost:8080`.

## Mengatur Public Base Path

Secara default, kami mengasumsikan situs akan dideploy di path root domain (`/`). Jika situs Anda akan disajikan di sub-path, mis. `https://mywebsite.com/blog/`, maka Anda perlu mengatur opsi [`base`](../reference/site-config#base) ke `'/blog/'` di konfigurasi VitePress.

**Contoh:** Jika Anda menggunakan Github (atau GitLab) Pages dan mendeploy ke `user.github.io/repo/`, maka atur `base` Anda ke `/repo/`.

## HTTP Cache Headers

Jika Anda memiliki kontrol atas header HTTP di server produksi Anda, Anda dapat mengonfigurasi header `cache-control` untuk mencapai performa yang lebih baik pada kunjungan berulang.

Build produksi menggunakan nama file yang di-hash untuk aset statis (JavaScript, CSS, dan aset impor lainnya yang tidak ada di `public`). Jika Anda memeriksa pratinjau produksi menggunakan tab network devtools browser Anda, Anda akan melihat file seperti `app.4f283b18.js`.

Hash `4f283b18` ini dihasilkan dari konten file ini. URL hash yang sama dijamin menyajikan konten file yang sama, dan jika konten berubah, URL juga berubah. Ini berarti Anda dapat dengan aman menggunakan header cache terkuat untuk file-file ini. Semua file tersebut akan ditempatkan di bawah `assets/` di direktori output, sehingga Anda dapat mengonfigurasi header berikut untuknya:

```
Cache-Control: max-age=31536000,immutable
```

::: details Contoh file `_headers` Netlify

```
/assets/*
  cache-control: max-age=31536000
  cache-control: immutable
```

Catatan: file `_headers` harus ditempatkan di [direktori public](./asset-handling#direktori-public), dalam kasus kami, `docs/public/_headers`, sehingga disalin apa adanya ke direktori output.

[Dokumentasi custom headers Netlify](https://docs.netlify.com/routing/headers/)

:::

::: details Contoh konfigurasi Vercel di `vercel.json`

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

Catatan: file `vercel.json` harus ditempatkan di root **repositori** Anda.

[Dokumentasi Vercel tentang konfigurasi headers](https://vercel.com/docs/concepts/projects/project-configuration#headers)

:::

## Panduan Platform

### Netlify / Vercel / Cloudflare Pages / AWS Amplify / Render {#generic}

Siapkan proyek baru dan ubah pengaturan ini menggunakan dashboard Anda:

- **Build Command:** `npm run docs:build`
- **Output Directory:** `docs/.vitepress/dist`
- **Node Version:** `20` (atau di atasnya)

::: warning
Jangan aktifkan opsi seperti _Auto Minify_ untuk kode HTML. Ini akan menghapus komentar dari output yang memiliki arti bagi Vue. Anda mungkin melihat error hydration mismatch jika komentar-komentar tersebut dihapus.
:::

### GitHub Pages

1. Buat file bernama `deploy.yml` di dalam direktori `.github/workflows` proyek Anda dengan konten seperti ini:

   ```yaml [.github/workflows/deploy.yml]
   # Contoh workflow untuk membangun dan mendeploy situs VitePress ke GitHub Pages
   #
   name: Deploy VitePress site to Pages

   on:
     # Berjalan pada push yang menargetkan branch `main`. Ubah ini ke `master` jika Anda
     # menggunakan branch `master` sebagai branch default.
     push:
       branches: [main]

     # Memungkinkan Anda menjalankan workflow ini secara manual dari tab Actions
     workflow_dispatch:

   # Mengatur izin GITHUB_TOKEN untuk memungkinkan deployment ke GitHub Pages
   permissions:
     contents: read
     pages: write
     id-token: write

   # Izinkan hanya satu deployment bersamaan, melewatkan run yang antre antara run yang sedang berjalan dan antrean terbaru.
   # Namun, JANGAN batalkan run yang sedang berjalan karena kami ingin mengizinkan deployment produksi ini selesai.
   concurrency:
     group: pages
     cancel-in-progress: false

   jobs:
     # Build job
     build:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v5
           with:
             fetch-depth: 0 # Tidak diperlukan jika lastUpdated tidak diaktifkan
         # - uses: pnpm/action-setup@v4 # Uncomment blok ini jika Anda menggunakan pnpm
         #   with:
         #     version: 9 # Tidak diperlukan jika Anda telah mengatur "packageManager" di package.json
         # - uses: oven-sh/setup-bun@v1 # Uncomment ini jika Anda menggunakan Bun
         - name: Setup Node
           uses: actions/setup-node@v6
           with:
             node-version: 24
             cache: npm # atau pnpm / yarn
         - name: Setup Pages
           uses: actions/configure-pages@v4
         - name: Install dependencies
           run: npm ci # atau pnpm install / yarn install / bun install
         - name: Build with VitePress
           run: npm run docs:build # atau pnpm docs:build / yarn docs:build / bun run docs:build
         - name: Upload artifact
           uses: actions/upload-pages-artifact@v3
           with:
             path: docs/.vitepress/dist

     # Deployment job
     deploy:
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       needs: build
       runs-on: ubuntu-latest
       name: Deploy
       steps:
         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v4
   ```

   ::: warning
   Pastikan opsi `base` di VitePress Anda dikonfigurasi dengan benar. Lihat [Mengatur Public Base Path](#mengatur-public-base-path) untuk detail lebih lanjut.
   :::

2. Di pengaturan repositori Anda di bawah item menu "Pages", pilih "GitHub Actions" di "Build and deployment > Source".

3. Push perubahan Anda ke branch `main` dan tunggu workflow GitHub Actions selesai. Anda akan melihat situs Anda dideploy ke `https://<username>.github.io/[repository]/` atau `https://<custom-domain>/` tergantung pada pengaturan Anda. Situs Anda akan secara otomatis dideploy pada setiap push ke branch `main`.

### GitLab Pages

1. Atur `outDir` di konfigurasi VitePress ke `../public`. Konfigurasikan opsi `base` ke `'/<repository>/'` jika Anda ingin mendeploy ke `https://<username>.gitlab.io/<repository>/`. Anda tidak memerlukan `base` jika mendeploy ke custom domain, halaman pengguna atau grup, atau memiliki pengaturan "Use unique domain" yang diaktifkan di GitLab.

2. Buat file bernama `.gitlab-ci.yml` di root proyek Anda dengan konten di bawah ini. Ini akan membangun dan mendeploy situs Anda setiap kali Anda membuat perubahan pada konten Anda:

   ```yaml [.gitlab-ci.yml]
   image: node:24
   pages:
     cache:
       paths:
         - node_modules/
     script:
       # - apk add git # Uncomment ini jika Anda menggunakan docker image kecil seperti alpine dan mengaktifkan lastUpdated
       - npm install
       - npm run docs:build
     artifacts:
       paths:
         - public
     only:
       - main
   ```

<!-- keep headings sorted alphabetically, leave nginx at the end -->

### Azure

1. Ikuti [dokumentasi resmi](https://docs.microsoft.com/en-us/azure/static-web-apps/build-configuration).

2. Atur nilai-nilai ini di file konfigurasi Anda (dan hapus yang tidak Anda perlukan, seperti `api_location`):

   - **`app_location`**: `/`
   - **`output_location`**: `docs/.vitepress/dist`
   - **`app_build_command`**: `npm run docs:build`

### CloudRay

Anda dapat mendeploy proyek VitePress Anda dengan [CloudRay](https://cloudray.io/) dengan mengikuti [instruksi](https://cloudray.io/articles/how-to-deploy-vitepress-site) ini.

### Firebase

1. Buat `firebase.json` dan `.firebaserc` di root proyek Anda:

   `firebase.json`:

   ```json [firebase.json]
   {
     "hosting": {
       "public": "docs/.vitepress/dist",
       "ignore": []
     }
   }
   ```

   `.firebaserc`:

   ```json [.firebaserc]
   {
     "projects": {
       "default": "<YOUR_FIREBASE_ID>"
     }
   }
   ```

2. Setelah menjalankan `npm run docs:build`, jalankan perintah ini untuk deploy:

   ```sh
   firebase deploy
   ```

### Heroku

1. Ikuti dokumentasi dan panduan yang diberikan di [`heroku-buildpack-static`](https://elements.heroku.com/buildpacks/heroku/heroku-buildpack-static).

2. Buat file bernama `static.json` di root proyek Anda dengan konten di bawah ini:

   ```json [static.json]
   {
     "root": "docs/.vitepress/dist"
   }
   ```

### Hostinger

Anda dapat mendeploy proyek VitePress Anda dengan [Hostinger](https://www.hostinger.com/web-apps-hosting) dengan mengikuti [instruksi](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/) ini. Saat mengonfigurasi pengaturan build, pilih VitePress sebagai framework dan sesuaikan direktori root ke `./docs`.

### Kinsta

Anda dapat mendeploy situs VitePress Anda di [Kinsta](https://kinsta.com/static-site-hosting/) dengan mengikuti [instruksi](https://kinsta.com/docs/vitepress-static-site-example/) ini.

### Stormkit

Anda dapat mendeploy proyek VitePress Anda ke [Stormkit](https://www.stormkit.io) dengan mengikuti [instruksi](https://stormkit.io/blog/how-to-deploy-vitepress) ini.

### Surge

1. Setelah menjalankan `npm run docs:build`, jalankan perintah ini untuk deploy:

   ```sh
   npx surge docs/.vitepress/dist
   ```

### Nginx

Berikut adalah contoh konfigurasi blok server Nginx. Setup ini mencakup kompresi gzip untuk aset berbasis teks umum, aturan untuk menyajikan file statis situs VitePress Anda dengan header caching yang tepat serta menangani `cleanUrls: true`.

```nginx
server {
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    listen 80;
    server_name _;
    index index.html;

    location / {
        # lokasi konten
        root /app;

        # exact matches -> reverse clean urls -> folders -> not found
        try_files $uri $uri.html $uri/ =404;

        # halaman yang tidak ada
        error_page 404 /404.html;

        # folder tanpa index.html menghasilkan 403 di setup ini
        error_page 403 /404.html;

        # sesuaikan header caching
        # file di folder assets memiliki nama file hash
        location ~* ^/assets/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

Konfigurasi ini mengasumsikan bahwa situs VitePress yang telah dibangun terletak di direktori `/app` di server Anda. Sesuaikan directive `root` jika file situs Anda berada di tempat lain.

::: warning Jangan default ke index.html
Resolusi try_files tidak boleh default ke index.html seperti di aplikasi Vue lainnya. Ini akan menghasilkan state halaman yang tidak valid.
:::

Informasi lebih lanjut dapat ditemukan di [dokumentasi resmi nginx](https://nginx.org/en/docs/), di isu-isu ini [#2837](https://github.com/vuejs/vitepress/discussions/2837), [#3235](https://github.com/vuejs/vitepress/issues/3235) serta di [blog post](https://blog.mehdi.cc/articles/vitepress-cleanurls-on-nginx-environment#readings) oleh Mehdi Merah.
