---
description: Referensi perintah CLI VitePress termasuk dev, build, preview, dan init.
---

# Command Line Interface

## `vitepress dev`

Memulai server pengembangan VitePress menggunakan direktori yang ditentukan sebagai root. Default ke direktori saat ini. Perintah `dev` juga dapat dihilangkan ketika dijalankan di direktori saat ini.

### Penggunaan

```sh
# mulai di direktori saat ini, tanpa menuliskan `dev`
vitepress

# mulai di subdirektori
vitepress dev [root]
```

### Opsi

| Opsi            | Deskripsi                                                                |
| --------------- | ------------------------------------------------------------------------ |
| `--open [path]` | Buka browser saat startup (`boolean \| string`)                          |
| `--port <port>` | Tentukan port (`number`)                                                 |
| `--base <path>` | Public base path (default: `/`) (`string`)                               |
| `--cors`        | Aktifkan CORS                                                            |
| `--strictPort`  | Keluar jika port yang ditentukan sedang digunakan (`boolean`)            |
| `--force`       | Paksa optimizer mengabaikan cache dan melakukan re-bundle (`boolean`)    |

## `vitepress build`

Membangun situs VitePress untuk production.

### Penggunaan

```sh
vitepress build [root]
```

### Opsi

| Opsi                            | Deskripsi                                                                                                               |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `--mpa` (eksperimental)         | Build dalam [mode MPA](../guide/mpa-mode) tanpa client-side hydration (`boolean`)                                       |
| `--base <path>`                 | Public base path (default: `/`) (`string`)                                                                              |
| `--target <target>`             | Target transpile (default: `"modules"`) (`string`)                                                                      |
| `--outDir <dir>`                | Direktori output relatif terhadap **cwd** (default: `<root>/.vitepress/dist`) (`string`)                                |
| `--assetsInlineLimit <number>`  | Batas aset statis yang di-inline sebagai base64 dalam byte (default: `4096`) (`number`)                                 |

## `vitepress preview`

Pratinjau hasil build production secara lokal.

### Penggunaan

```sh
vitepress preview [root]
```

### Opsi

| Opsi            | Deskripsi                                |
| --------------- | ---------------------------------------- |
| `--base <path>` | Public base path (default: `/`) (`string`) |
| `--port <port>` | Tentukan port (`number`)                  |

## `vitepress init`

Memulai [Setup Wizard](../guide/getting-started#setup-wizard) di direktori saat ini.

### Penggunaan

```sh
vitepress init
```
