---
description: Buat halaman tim dengan profil anggota menggunakan komponen tim bawaan VitePress.
---

<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://github.com/yyx990803.png',
    name: 'Evan You',
    title: 'Creator',
    links: [
      { icon: 'github', link: 'https://github.com/yyx990803' },
      { icon: 'twitter', link: 'https://twitter.com/youyuxi' }
    ]
  },
  {
    avatar: 'https://github.com/kiaking.png',
    name: 'Kia King Ishii',
    title: 'Developer',
    links: [
      { icon: 'github', link: 'https://github.com/kiaking' },
      { icon: 'twitter', link: 'https://twitter.com/KiaKing85' }
    ]
  }
]
</script>

# Halaman Tim

Jika Anda ingin memperkenalkan tim Anda, Anda dapat menggunakan komponen Team untuk membuat Halaman Tim. Ada dua cara menggunakan komponen ini. Salah satunya adalah menyematkannya di halaman dokumen, dan yang lainnya adalah membuat Halaman Tim penuh.

## Menampilkan anggota tim di sebuah halaman

Anda dapat menggunakan komponen `<VPTeamMembers>` yang diekspos dari `vitepress/theme` untuk menampilkan daftar anggota tim di halaman mana pun.

```html
<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://www.github.com/yyx990803.png',
    name: 'Evan You',
    title: 'Creator',
    links: [
      { icon: 'github', link: 'https://github.com/yyx990803' },
      { icon: 'twitter', link: 'https://twitter.com/youyuxi' }
    ]
  },
  ...
]
</script>

# Tim Kami

Sapa tim hebat kami.

<VPTeamMembers size="small" :members />
```

Di atas akan menampilkan anggota tim dalam elemen bergaya kartu. Seharusnya menampilkan sesuatu yang mirip dengan di bawah ini.

<VPTeamMembers size="small" :members />

Komponen `<VPTeamMembers>` tersedia dalam 2 ukuran berbeda, `small` dan `medium`. Meskipun tergantung pada preferensi Anda, biasanya ukuran `small` lebih cocok ketika digunakan di halaman dokumen. Anda juga dapat menambahkan lebih banyak properti ke setiap anggota seperti menambahkan tombol "description" atau "sponsor". Pelajari lebih lanjut di [`<VPTeamMembers>`](#vpteammembers).

Menyematkan anggota tim di halaman dokumen cocok untuk tim berukuran kecil di mana memiliki halaman tim penuh khusus mungkin terlalu berlebihan, atau memperkenalkan sebagian anggota sebagai referensi untuk konteks dokumentasi.

Jika Anda memiliki jumlah anggota yang banyak, atau hanya ingin memiliki lebih banyak ruang untuk menampilkan anggota tim, pertimbangkan untuk [membuat halaman tim penuh](#create-a-full-team-page).

## Membuat Halaman Tim Penuh

Alih-alih menambahkan anggota tim ke halaman dokumen, Anda juga dapat membuat Halaman Tim penuh, mirip dengan cara Anda membuat [Home Page](./default-theme-home-page) kustom.

Untuk membuat halaman tim, pertama, buat file md baru. Nama file tidak masalah, tetapi di sini kita sebut saja `team.md`. Di file ini, atur opsi frontmatter `layout: page`, lalu Anda dapat menyusun struktur halaman Anda menggunakan komponen `TeamPage`.

```html
---
layout: page
---
<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamMembers
} from 'vitepress/theme'

const members = [
  {
    avatar: 'https://www.github.com/yyx990803.png',
    name: 'Evan You',
    title: 'Creator',
    links: [
      { icon: 'github', link: 'https://github.com/yyx990803' },
      { icon: 'twitter', link: 'https://twitter.com/youyuxi' }
    ]
  },
  ...
]
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>
      Tim Kami
    </template>
    <template #lead>
      Pengembangan VitePress dipandu oleh tim internasional,
      beberapa di antaranya telah memilih untuk ditampilkan di bawah.
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers :members />
</VPTeamPage>
```

Ketika membuat halaman tim penuh, ingatlah untuk membungkus semua komponen dengan komponen `<VPTeamPage>`. Komponen ini akan memastikan semua komponen terkait tim yang bersarang mendapatkan struktur layout yang tepat seperti spasi.

Komponen `<VPPageTitle>` menambahkan bagian judul halaman. Judul berupa heading `<h1>`. Gunakan slot `#title` dan `#lead` untuk mendokumentasikan tentang tim Anda.

`<VPMembers>` bekerja sama seperti ketika digunakan di halaman dokumen. Ini akan menampilkan daftar anggota.

### Menambahkan bagian untuk membagi anggota tim

Anda dapat menambahkan "bagian" ke halaman tim. Misalnya, Anda mungkin memiliki berbagai jenis anggota tim seperti Anggota Tim Inti dan Mitra Komunitas. Anda dapat membagi anggota-anggota ini menjadi beberapa bagian untuk menjelaskan peran masing-masing grup dengan lebih baik.

Untuk melakukannya, tambahkan komponen `<VPTeamPageSection>` ke file `team.md` yang kita buat sebelumnya.

```html
---
layout: page
---
<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamMembers,
  VPTeamPageSection
} from 'vitepress/theme'

const coreMembers = [...]
const partners = [...]
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>Tim Kami</template>
    <template #lead>...</template>
  </VPTeamPageTitle>
  <VPTeamMembers size="medium" :members="coreMembers" />
  <VPTeamPageSection>
    <template #title>Mitra</template>
    <template #lead>...</template>
    <template #members>
      <VPTeamMembers size="small" :members="partners" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>
```

Komponen `<VPTeamPageSection>` dapat memiliki slot `#title` dan `#lead` mirip dengan komponen `VPTeamPageTitle`, dan juga slot `#members` untuk menampilkan anggota tim.

Ingatlah untuk menempatkan komponen `<VPTeamMembers>` di dalam slot `#members`.

## `<VPTeamMembers>`

Komponen `<VPTeamMembers>` menampilkan daftar anggota yang diberikan.

```html
<VPTeamMembers
  size="medium"
  :members="[
    { avatar: '...', name: '...' },
    { avatar: '...', name: '...' },
    ...
  ]"
/>
```

```ts
interface Props {
  // Ukuran setiap anggota. Default ke `medium`.
  size?: 'small' | 'medium'

  // Daftar anggota yang akan ditampilkan.
  members: TeamMember[]
}

interface TeamMember {
  // Gambar avatar untuk anggota.
  avatar: string

  // Nama anggota.
  name: string

  // Judul yang akan ditampilkan di bawah nama anggota.
  // mis. Developer, Software Engineer, dll.
  title?: string

  // Organisasi tempat anggota bernaung.
  org?: string

  // URL untuk organisasi.
  orgLink?: string

  // Deskripsi untuk anggota.
  desc?: string

  // Tautan sosial. mis. GitHub, Twitter, dll. Anda dapat memberikan
  // objek Social Links di sini.
  // Lihat: https://vitepress.dev/reference/default-theme-config.html#sociallinks
  links?: SocialLink[]

  // URL untuk halaman sponsor anggota.
  sponsor?: string

  // Teks untuk tautan sponsor. Default ke 'Sponsor'.
  actionText?: string
}
```

## `<VPTeamPage>`

Komponen root ketika membuat halaman tim penuh. Ini hanya menerima satu slot. Ini akan menata semua komponen terkait tim yang diberikan.

## `<VPTeamPageTitle>`

Menambahkan bagian "judul" halaman. Paling baik digunakan di bagian paling awal di bawah `<VPTeamPage>`. Ini menerima slot `#title` dan `#lead`.

```html
<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>
      Tim Kami
    </template>
    <template #lead>
      Pengembangan VitePress dipandu oleh tim internasional,
      beberapa di antaranya telah memilih untuk ditampilkan di bawah.
    </template>
  </VPTeamPageTitle>
</VPTeamPage>
```

## `<VPTeamPageSection>`

Membuat "bagian" di dalam halaman tim. Ini menerima slot `#title`, `#lead`, dan `#members`. Anda dapat menambahkan bagian sebanyak yang Anda suka di dalam `<VPTeamPage>`.

```html
<VPTeamPage>
  ...
  <VPTeamPageSection>
    <template #title>Mitra</template>
    <template #lead>Lorem ipsum...</template>
    <template #members>
      <VPTeamMembers :members="data" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>
```
