# ناوبری {#nav}

ناوبری نوار ناوبری است که در بالای صفحه نمایش داده می‌شود و شامل عنوان سایت، لینک‌های منوی جهانی، و غیره می‌باشد.

## عنوان سایت و لوگو {#site-title-and-logo}

به طور پیش‌فرض، ناو نام سایت را با ارجاع به مقدار [`config.title`](./site-config#title) نمایش می‌دهد. اگر می‌خواهید تغییر دهید که چه چیزی در ناو نمایش داده شود، می‌توانید متن سفارشی را در گزینه `themeConfig.siteTitle` تعریف کنید.

```js
export default {
  themeConfig: {
    siteTitle: 'عنوان سفارشی من'
  }
}
```

اگر برای سایت خود لوگو دارید، می‌توانید آن را با ارسال مسیر تصویر نمایش دهید. شما باید لوگو را در دایرکتوری `public` قرار داده و مسیر مطلق آن را تعریف کنید.

```js
export default {
  themeConfig: {
    logo: '/my-logo.svg'
  }
}
```

هنگام افزودن یک لوگو، آن به همراه عنوان سایت نمایش داده می‌شود. اگر لوگوی شما همه چیزی است که نیاز دارید و اگر می‌خواهید متن عنوان سایت را پنهان کنید، گزینه `siteTitle` را برابر با `false` قرار دهید.

```js
export default {
  themeConfig: {
    logo: '/my-logo.svg',
    siteTitle: false
  }
}
```

همچنین می‌توانید به عنوان لوگو یک شیء را نیز ارسال کنید اگر می‌خواهید ویژگی `alt` را اضافه کنید یا آن را بر اساس حالت تاریک / روشن سفارشی‌سازی کنید. برای جزئیات بیشتر به [`themeConfig.logo`](./default-theme-config#logo) مراجعه کنید.

## لینک‌های ناوبری {#navigation-links}

شما می‌توانید گزینه `themeConfig.nav` را تعریف کنید تا لینک‌ها را به ناوبری خود اضافه کنید.

```js
export default {
  themeConfig: {
    nav: [
      { text: 'راهنما', link: '/guide' },
      { text: 'پیکربندی', link: '/config' },
      { text: 'تغییرات', link: 'https://github.com/...' }
    ]
  }
}
```

`text` متن واقعی است که در ناوبری نمایش داده می‌شود و `link` لینکی است که هنگام کلیک بر روی متن به آن ناوبری می‌شود. برای لینک، مسیر را به صورت واقعی بدون پیشوند `.md` تنظیم کنید و همیشه با `/` شروع کنید.

لینک‌های ناوبری همچنین می‌توانند منوهای کشویی باشند. برای این کار، کلید `items` را در گزینه لینک تنظیم کنید.

```js
export default {
  themeConfig: {
    nav: [
      { text: 'راهنما', link: '/guide' },
      {
        text: 'منوی کشویی',
        items: [
          { text: 'مورد الف', link: '/item-1' },
          { text: 'مورد ب', link: '/item-2' },
          { text: 'مورد ج', link: '/item-3' }
        ]
      }
    ]
  }
}
```

لطفا توجه داشته باشید که عنوان منوی کشویی (`منوی کشویی` در مثال بالا) نمی‌تواند خاصیت `link` داشته باشد زیرا این دکمه برای باز کردن صفحه گفتگوی کشویی می‌شود.

همچنین می‌توانید بخش‌هایی را نیز به موارد منوی کشویی با ارسال موارد بیشتر تو در تو اضافه کنید.

```js
export default {
  themeConfig: {
    nav: [
      { text: 'راهنما', link: '/guide' },
      {
        text: 'منوی کشویی',
        items: [
          {
            // عنوان بخش
            text: 'عنوان بخش A',
            items: [
              { text: 'آیتم A بخش A', link: '...' },
              { text: 'آیتم B بخش B', link: '...' }
            ]
          }
        ]
      },
      {
        text: 'منوی کشویی',
        items: [
          {
            // شما همچنین می‌توانید عنوان را حذف کنید.
            items: [
              { text: 'آیتم A بخش A', link: '...' },
              { text: 'آیتم B بخش B', link: '...' }
            ]
          }
        ]
      }
    ]
  }
}
```

### سفارشی‌سازی وضعیت "فعال" لینک {#customize-link-s-active-state}

موارد منوی ناوبری زمانی که صفحه فعلی زیر مسیر مطابقت دارد، مشخص می‌شوند. اگر می‌خواهید مسیر مطابقت را سفارشی کنید، ویژگی `activeMatch` و regex را به عنوان مقدار رشته تعریف کنید.

```js
export default {
  themeConfig: {
    nav: [
      // این لینک وضعیت فعال را در زمانی که کاربر در مسیر `/config/` است، دریافت می‌کند.
      {
        text: 'راهنما',
        link: '/guide',
        activeMatch: '/config/'
      }
    ]
  }
}
```

::: warning هشدار
`activeMatch` انتظار می‌رود که به عنوان یک رشته regex باشد، اما شما باید آن را به عنوان یک رشته تعریف کنید. ما نمی‌توانیم از شیء RegExp واقعی اینجا استفاده کنیم زیرا در زمان ساخت غیر قابل سریالیز کردن است.
:::

### سفارشی‌سازی ویژگی‌های "target" و "rel" لینک {#customize-link-s-target-and-rel-attributes}

به طور پیش‌فرض، ویت‌پرس به طور خودکار ویژگی‌های

`target` و `rel` را بر اساس اینکه لینک یک لینک خارجی است یا خیر، تعیین می‌کند. اما اگر می‌خواهید، شما همچنین می‌توانید آن‌ها را سفارشی کنید.

```js
export default {
  themeConfig: {
    nav: [
      {
        text: 'کالای معاملاتی',
        link: 'https://www.thegithubshop.com/',
        target: '_self',
        rel: 'sponsored'
      }
    ]
  }
}
```

## لینک‌های اجتماعی {#social-links}

به [`socialLinks`](./default-theme-config#sociallinks) مراجعه کنید.

## اجزای سفارشی

می‌توانید اجزای سفارشی را در نوار ناوبری با استفاده از گزینه `component` اضافه کنید. کلید `component` باید نام مؤلفه Vue باشد و باید به صورت جهانی با استفاده از [Theme.enhanceApp](../guide/custom-theme#theme-interface) ثبت شود.

```js [.vitepress/config.js]
export default {
  themeConfig: {
    nav: [
      {
        text: 'منوی من',
        items: [
          {
            component: 'MyCustomComponent',
            // پارامترهای اختیاری برای ارسال به مؤلفه
            props: {
              title: 'مؤلفه سفارشی من'
            }
          }
        ]
      },
      {
        component: 'AnotherCustomComponent'
      }
    ]
  }
}
```

سپس، شما باید مؤلفه را به صورت جهانی ثبت کنید:

```js [.vitepress/theme/index.js]
import DefaultTheme from 'vitepress/theme'

import MyCustomComponent from './components/MyCustomComponent.vue'
import AnotherCustomComponent from './components/AnotherCustomComponent.vue'

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('MyCustomComponent', MyCustomComponent)
    app.component('AnotherCustomComponent', AnotherCustomComponent)
  }
}
```

اجزای شما در نوار ناوبری نمایش داده خواهد شد. ویت‌پرس ویژگی‌های اضافی زیر را به مؤلفه ارائه می‌دهد:

- `screenMenu`: یک بولین اختیاری که نشان می‌دهد آیا مؤلفه در منوی ناوبری تلفن همراه است یا خیر

می‌توانید یک نمونه را در آزمایش‌های e2e [اینجا](https://github.com/vuejs/vitepress/tree/main/__tests__/e2e/.vitepress) بررسی کنید.
