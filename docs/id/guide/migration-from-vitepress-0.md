# Migrasi dari VitePress 0.x

Jika Anda berasal dari VitePress versi 0.x, ada beberapa breaking change karena fitur dan peningkatan baru. Ikuti panduan ini untuk melihat cara memigrasikan aplikasi Anda ke VitePress terbaru.

## App Config

- Fitur internasionalisasi belum diimplementasikan.

## Theme Config

- Opsi `sidebar` telah mengubah strukturnya.
  - Key `children` sekarang dinamai `items`.
  - Item tingkat atas saat ini mungkin tidak berisi `link`. Kami berencana untuk mengembalikannya.
- `repo`, `repoLabel`, `docsDir`, `docsBranch`, `editLinks`, `editLinkText` dihapus demi API yang lebih fleksibel.
  - Untuk menambahkan tautan GitHub dengan ikon ke nav, gunakan fitur [Social Links](../reference/default-theme-nav#navigation-links).
  - Untuk menambahkan fitur "Edit this page", gunakan fitur [Edit Link](../reference/default-theme-edit-link).
- Opsi `lastUpdated` sekarang dipisah menjadi `config.lastUpdated` dan `themeConfig.lastUpdatedText`.
- `carbonAds.carbon` diubah menjadi `carbonAds.code`.

## Frontmatter Config

- Opsi `home: true` telah berubah menjadi `layout: home`. Selain itu, banyak pengaturan terkait Homepage telah dimodifikasi untuk menyediakan fitur tambahan. Lihat [panduan Home Page](../reference/default-theme-home-page) untuk detailnya.
- Opsi `footer` dipindahkan ke [`themeConfig.footer`](../reference/default-theme-config#footer).
