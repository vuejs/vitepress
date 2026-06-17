---
description: Gunakan komponen Badge untuk menambahkan label status pada heading di dokumentasi VitePress.
---

# Badge

Dengan Badge, Anda dapat menambahkan status pada heading. Misalnya, ini dapat berguna untuk menentukan jenis bagian, atau versi yang didukung.

## Penggunaan

Anda dapat menggunakan komponen `Badge` yang tersedia secara global.

```html
### Judul <Badge type="info" text="default" />
### Judul <Badge type="tip" text="^1.9.0" />
### Judul <Badge type="warning" text="beta" />
### Judul <Badge type="danger" text="caution" />
```

Kode di atas menghasilkan tampilan seperti:

### Title <Badge type="info" text="default" />
### Title <Badge type="tip" text="^1.9.0" />
### Title <Badge type="warning" text="beta" />
### Title <Badge type="danger" text="caution" />

## Custom Children

`<Badge>` menerima `children`, yang akan ditampilkan di dalam badge.

```html
### Judul <Badge type="info">custom element</Badge>
```

### Title <Badge type="info">custom element</Badge>

## Menyesuaikan Warna Tipe

Anda dapat menyesuaikan gaya badge dengan menimpa variabel css. Berikut adalah nilai default:

```css
:root {
  --vp-badge-info-border: transparent;
  --vp-badge-info-text: var(--vp-c-text-2);
  --vp-badge-info-bg: var(--vp-c-default-soft);

  --vp-badge-tip-border: transparent;
  --vp-badge-tip-text: var(--vp-c-brand-1);
  --vp-badge-tip-bg: var(--vp-c-brand-soft);

  --vp-badge-warning-border: transparent;
  --vp-badge-warning-text: var(--vp-c-warning-1);
  --vp-badge-warning-bg: var(--vp-c-warning-soft);

  --vp-badge-danger-border: transparent;
  --vp-badge-danger-text: var(--vp-c-danger-1);
  --vp-badge-danger-bg: var(--vp-c-danger-soft);
}
```

## `<Badge>`

Komponen `<Badge>` menerima props berikut:

```ts
interface Props {
  // Ketika `<slot>` diberikan, nilai ini diabaikan.
  text?: string

  // Default ke `tip`.
  type?: 'info' | 'tip' | 'warning' | 'danger'
}
```
