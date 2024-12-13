# پیوند ویرایش {#edit-link}

## پیکربندی سطح سایت {#site-level-config}

پیوند ویرایش به شما این امکان را می‌دهد که یک پیوند به صفحه ویرایش را در خدمات مدیریت گیت مانند GitHub یا GitLab نمایش دهید. برای فعال‌سازی آن، گزینه `themeConfig.editLink` را به پیکربندی خود اضافه کنید.

```js
export default {
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path'
    }
  }
}
```

گزینه `pattern` ساختار URL را برای پیوند تعیین می‌کند و `:path` با مسیر صفحه جایگزین خواهد شد.

همچنین می‌توانید یک تابع خالص ارائه دهید که `PageData` را به عنوان آرگومان دریافت کرده و رشته URL را برمی‌گرداند.

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

این تابع نباید اثر جانبی داشته باشد و هیچ چیز خارج از دامنه خود را دسترسی ندهد، زیرا که در مرورگر سریالیزه و اجرا خواهد شد.

به طور پیش‌فرض، این عبارت "ویرایش این صفحه" را در پایین صفحه مستندات اضافه می‌کند. می‌توانید این متن را با تعریف گزینه `text` سفارشی‌سازی کنید.

```js
export default {
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
      text: 'ویرایش این صفحه در GitHub'
    }
  }
}
```

## پیکربندی Frontmatter {#frontmatter-config}

می‌توانید این امکان را برای هر صفحه با استفاده از گزینه `editLink` در frontmatter غیرفعال کنید:

```yaml
---
editLink: false
---
```
