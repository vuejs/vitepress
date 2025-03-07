# نوار کناری {#sidebar}

نوار کناری بلوک اصلی ناوبری برای مستندات شما است. شما می‌توانید منوی نوار کناری را در [`themeConfig.sidebar`](./default-theme-config#sidebar) پیکربندی کنید.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'راهنما',
        items: [
          { text: 'مقدمه', link: '/introduction' },
          { text: 'شروع کردن', link: '/getting-started' },
          ...
        ]
      }
    ]
  }
}
```

## مبانی {#the-basics}

ساده‌ترین فرم منوی نوار کناری ارسال یک آرایه تکی از لینک‌هاست. آیتم سطح اول "بخش" نوار کناری را تعریف می‌کند. باید شامل `text` باشد که عنوان بخش است و `items` که لینک‌های واقعی ناوبری هستند.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'عنوان بخش A',
        items: [
          { text: 'آیتم A', link: '/item-a' },
          { text: 'آیتم B', link: '/item-b' },
          ...
        ]
      },
      {
        text: 'عنوان بخش B',
        items: [
          { text: 'آیتم C', link: '/item-c' },
          { text: 'آیتم D', link: '/item-d' },
          ...
        ]
      }
    ]
  }
}
```

هر `link` باید مسیر به فایل واقعی را با `/` آغاز کند. اگر شما `/` را به انتهای لینک اضافه کنید، صفحه `index.md` دایرکتوری متناظر را نمایش می‌دهد.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'راهنما',
        items: [
          // این صفحه `/guide/index.md` را نمایش می‌دهد.
          { text: 'مقدمه', link: '/guide/' }
        ]
      }
    ]
  }
}
```

شما می‌توانید آیتم‌های نوار کناری را تا عمق ۶ سطح تعویض کنید که از سطح ریشه شمارش می‌شود. توجه داشته باشید که عمق بیشتر از ۶ سطح از آیتم‌های تو در تو نادیده گرفته می‌شود و در نوار کناری نمایش داده نمی‌شود.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'سطح ۱',
        items: [
          {
            text: 'سطح ۲',
            items: [
              {
                text: 'سطح ۳',
                items: [
                  ...
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

## نوارهای کناری چندگانه {#multiple-sidebars}

می‌توانید بسته به مسیر صفحه، نوار کناری مختلفی را نمایش دهید. به عنوان مثال، همانطور که در این سایت نشان داده شده است، ممکن است بخواهید برای مستندات خود بخش‌های جداگانه مانند صفحه "راهنما" و صفحه "پیکربندی" را ایجاد کنید.

برای این کار، ابتدا صفحات خود را در دایرکتوری‌های مختلف برای هر بخش مورد نظر خود سازماندهی کنید:

```
.
├─ guide/
│  ├─ index.md
│  ├─ one.md
│  └─ two.md
└─ config/
   ├─ index.md
   ├─ three.md
   └─ four.md
```

سپس، پیکربندی خود را برای تعریف نوار کناری برای هر بخش تعیین کنید. در این موارد، شما باید به جای یک آرایه، یک شیء را ارسال کنید.

```js
export default {
  themeConfig: {
    sidebar: {
      // این نوار کناری نمایش داده می‌شود زمانی که کاربر در دایرکتوری `guide` است.
      '/guide/': [
        {
          text: 'راهنما',
          items: [
            { text: 'فهرست', link: '/guide/' },
            { text: 'یک', link: '/guide/one' },
            { text: 'دو', link: '/guide/two' }
          ]
        }
      ],

      // این نوار کناری نمایش داده می‌شود زمانی که کاربر در دایرکتوری `config` است.
      '/config/': [
        {
          text: 'پیکربندی',
          items: [
            { text: 'فهرست', link: '/config/' },
            { text: 'سه', link: '/config/three' },
            { text: 'چهار', link: '/config/four' }
          ]
        }
      ]
    }
  }
}
```

## گروه‌های نوار کناری قابل جمع و جور {#collapsible-sidebar-groups}

با اضافه کردن گزینه `collapsed` به گروه نوار کناری، دکمه جداگانه‌ای برای پنهان کردن/نمایش هر بخش نمایش داده می‌شود.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'عنوان بخش A',
        collapsed: false,
        items: [...]
      }
    ]
  }
}
```

تمام بخش‌ها به طور پیش‌فرض "باز" هستند. اگر می‌خواهید آن‌ها را در بارگذاری اولیه صفحه "بسته" کنید، گزینه `collapsed` را به `true` تنظیم کنید.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'عنوان بخش A',
        collapsed: true,
        items: [...]
      }
    ]
  }
}
```

## `useSidebar` <Badge type="info" text="composable" /> {#usesidebar}

داده‌های مربوط به نوار کناری را برمی‌گرداند. شیء برگردانده شده دارای نوع‌های زیر است:

```ts
export interface DocSidebar {
  isOpen: Ref<boolean>
  sidebar: ComputedRef<DefaultTheme.SidebarItem[]>
  sidebarGroups: ComputedRef<DefaultTheme.SidebarItem[]>
  hasSidebar: ComputedRef<boolean>
  hasAside: ComputedRef<boolean>
  leftAside: ComputedRef<boolean>
  isSidebarEnabled: ComputedRef<boolean>
  open: () => void
  close: () => void
  toggle: () => void
}
```

**مثال:**

```vue
<script setup>
import { useSidebar } from 'vitepress/theme'

const { hasSidebar } = useSidebar()
</script>

<template>
  <div v-if="hasSidebar">فقط ن

مایش داده شود زمانی که نوار کناری وجود دارد</div>
</template>
```
