# نشان {#badge}

برچسب به شما امکان می‌دهد وضعیت‌های مختلفی را به سربرگ‌های خود اضافه کنید. به عنوان مثال، می‌تواند مفید باشد تا نوع بخش را مشخص کنید یا نسخه‌های پشتیبانی شده را نشان دهید.

## استفاده {#usage}

شما می‌توانید از کامپوننت `Badge` که به صورت جهانی در دسترس است، استفاده کنید.

```html
### عنوان <Badge type="info" text="پیش‌فرض" />
### عنوان <Badge type="tip" text="^1.9.0" />
### عنوان <Badge type="warning" text="بتا" />
### عنوان <Badge type="danger" text="هشدار" />
```

کد بالا به صورت زیر نمایش داده می‌شود:

### عنوان <Badge type="info" text="پیش‌فرض" /> {#title}

### عنوان <Badge type="tip" text="^1.9.0" /> {#title-1}

### عنوان <Badge type="warning" text="بتا" /> {#title-2}

### عنوان <Badge type="danger" text="هشدار" /> {#title-3}

## ارائه دادن محتوای دلخواه {#custom-children}

`<Badge>` می‌پذیرد `children` که در برچسب نمایش داده خواهد شد.

```html
### عنوان <Badge type="info">عنصر سفارشی</Badge>
```

### عنوان <Badge type="info">عنصر سفارشی</Badge>

## سفارشی‌سازی رنگ نوع {#customize-type-color}

شما می‌توانید استایل برچسب‌ها را با دوباره‌نویسی متغیرهای css سفارشی کنید. مقادیر پیش‌فرض به شرح زیر هستند:

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

## `<Badge>` {#badge-1}

کامپوننت `<Badge>` پراپ‌های زیر را می‌پذیرد:

```ts
interface Props {
  // وقتی `<slot>` ارسال می‌شود، این مقدار نادیده گرفته می‌شود.
  text?: string

  // پیش‌فرض به `tip`.
  type?: 'info' | 'tip' | 'warning' | 'danger'
}
```
