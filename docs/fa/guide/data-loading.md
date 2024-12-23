# بارگذاری داده در زمان ساخت {#build-time-data-loading}

ویت‌پرس یک ویژگی به نام **بارگذارهای داده** ارائه می‌دهد که به شما این امکان را می‌دهد که داده‌های دلخواه را بارگیری کنید و آن‌ها را از صفحات یا اجزا وارد کنید. بارگذاری داده فقط **در زمان ساخت** اجرا می‌شود: داده‌های حاصل به صورت JSON در بسته JavaScript نهایی سریالیزه می‌شوند.

بارگذارهای داده می‌توانند برای بارگیری داده‌های از راه دور یا تولید فراداده‌ها بر اساس فایل‌های محلی استفاده شوند. به عنوان مثال، می‌توانید از بارگذارهای داده استفاده کنید تا تمام صفحات API محلی خود را تجزیه کنید و به طور خودکار یک فهرست از تمام ورودی‌های API تولید کنید.

## استفاده ابتدایی {#basic-usage}

یک فایل بارگذار داده باید با `.data.js` یا `.data.ts` پایان یابد. فایل باید یک صادرات پیش‌فرض از یک شی با متد `load()` داشته باشد:

```js [example.data.js]
export default {
  load() {
    return {
      hello: 'world'
    }
  }
}
```

ماژول بارگذار فقط در Node.js ارزیابی می‌شود، بنابراین شما می‌توانید API ‌های Node و وابستگی‌های npm را به عنوان نیازهای خود وارد کنید.

سپس می‌توانید داده را از این فایل در صفحات `.md` و اجزا `.vue` با استفاده از صادرات نام‌گذاری شده `data` وارد کنید:

```vue
<script setup>
import { data } from './example.data.js'
</script>

<pre>{{ data }}</pre>
```

خروجی:

```json
{
  "hello": "world"
}
```

شما متوجه خواهید شد که بارگذار داده خودش داده را صادر نمی‌کند. ویت‌پرس پشت صحنه متد `load()` را فراخوانی می‌کند و به طور ضمنی نتیجه را از طریق صادرات نام‌گذاری شده `data` ارائه می‌دهد.

این کار حتی اگر بارگذار async باشد انجام می‌شود:

```js
export default {
  async load() {
    // دریافت داده از راه دور
    return (await fetch('...')).json()
  }
}
```

## داده از فایل‌های محلی {#data-from-local-files}

وقتی نیاز به تولید داده بر اساس فایل‌های محلی دارید، باید از گزینه `watch` در بارگذار داده استفاده کنید تا تغییرات اعمال شده به این فایل‌ها بتواند به روزرسانی‌های سریع منجر شود.

گزینه `watch` همچنین در آنجا مفید است که می‌توانید از [الگوهای glob](https://github.com/mrmlnc/fast-glob#pattern-syntax) برای تطابق با چندین فایل استفاده کنید. الگوها می‌توانند نسبت به فایل بارگذار خود نسبی باشند و تابع `load()` فایل‌های تطابق یافته را به عنوان مسیرهای مطلق دریافت می‌کند.

مثال زیر نشان می‌دهد که چگونه فایل‌های CSV را بارگذاری کرده و آن‌ها را با استفاده از [csv-parse](https://github.com/adaltas/node-csv/tree/master/packages/csv-parse/) به JSON تبدیل می‌کند. این فایل تنها در زمان ساخت اجرا می‌شود، بنابراین شما نیازی به ارسال پارسر CSV به مشتری ندارید!

```js
import fs from 'node:fs'
import { parse } from 'csv-parse/sync'

export default {
  watch: ['./data/*.csv'],
  load(watchedFiles) {
    // watchedFiles یک آرایه از مسیرهای مطلق فایل‌های تطابق یافته خواهد بود.
    // تولید یک آرایه از فراداده‌های پست وبلاگ که می‌تواند برای نمایش
    // یک لیست در طرح استفاده شود
    return watchedFiles.map((file) => {
      return parse(fs.readFileSync(file, 'utf-8'), {
        columns: true,
        skip_empty_lines: true
      })
    })
  }
}
```

## `createContentLoader` {#createcontentloader}

وقتی که در حال ساختن یک سایت متمرکز بر محتوا هستیم، اغلب نیاز به ایجاد یک "بایگانی" یا "فهرست" صفحه داریم: یک صفحه که ما همه ورودی‌های موجود در مجموعه محتوای خود را لیست می‌کنیم، به عنوان مثال پست‌های وبلاگ یا صفحات API. ما می‌توانیم این کار را مستقیماً با API بارگذار داده انجام دهیم، اما از آنجا که این یک حالت استفاده رایج است، ویت‌پرس همچنین یک کمک‌کننده به نام `createContentLoader` را فراهم می‌کند تا این فرآیند را ساده‌تر کند:

```js [posts.data.js]
import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/*.md', /* گزینه‌ها */)
```

کمک‌کننده یک الگوی glob را نسبت به [دایرکتوری منبع](./routing#source-directory) مشخص می‌کند و یک شی `{ watch، load }` را که می‌تواند به عنوان صادرات پیش‌فرض در یک فایل بارگذار داده استفاده شود، برمی‌گرداند. همچنین پیاده‌سازی حافظه پنهانی بر اساس برچسب‌های تغییر مدیریت

می‌کند تا عملکرد توسعه را بهبود بخشد.

لطفاً توجه داشته باشید که بارگذار فقط با فایل‌های Markdown کار می‌کند - فایل‌های غیر-Markdown تطابق یافته حذف می‌شوند.

داده بارگذاری شده یک آرایه با نوع `ContentData[]` خواهد بود:

```ts
interface ContentData {
  // آدرس URL برای صفحه. به عنوان مثال /posts/hello.html (شامل پایه نمی‌شود)
  // تکرار دستی یا استفاده از `transform` سفارشی برای نرمال کردن مسیرها
  url: string
  // اطلاعات frontmatter صفحه
  frontmatter: Record<string, any>

  // موارد زیر فقط وقتی که گزینه‌های مربوط فعال باشند
  // ما در زیر آنها را بررسی می‌کنیم
  src: string | undefined
  html: string | undefined
  excerpt: string | undefined
}
```

به طور پیش‌فرض، تنها `url` و `frontmatter` ارائه می‌شوند. این به خاطر این است که داده بارگذاری شده به عنوان JSON در بسته مشتری نهایی درج می‌شود، بنابراین ما باید در مورد اندازه آن محتاط باشیم. در زیر مثالی از استفاده از داده برای ساخت یک صفحه فهرست کمینه وبلاگ آورده شده است:

```vue
<script setup>
import { data as posts } from './posts.data.js'
</script>

<template>
  <h1>همه پست‌های وبلاگ</h1>
  <ul>
    <li v-for="post of posts">
      <a :href="post.url">{{ post.frontmatter.title }}</a>
      <span>توسط {{ post.frontmatter.author }}</span>
    </li>
  </ul>
</template>
```

### گزینه‌ها {#options}

احتمالاً داده پیش‌فرض به تمام نیازها پاسخ نمی‌دهد - شما می‌توانید با استفاده از گزینه‌ها به تبدیل داده‌ها مشترک شوید:

```js [posts.data.js]
import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/*.md', {
  includeSrc: true, // آیا منبع اصلی مارک‌داون را اضافه کنیم؟
  render: true,     // آیا صفحه HTML را نیز شامل کنیم؟
  excerpt: true,    // آیا خلاصه را نیز شامل کنیم؟
  transform(rawData) {
    // نقشه‌برداری، مرتب‌سازی یا فیلتر کردن داده‌های اصلی به دلخواه.
    // نتیجه نهایی آنچه است که به مشتری ارسال خواهد شد.
    return rawData.sort((a, b) => {
      return +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date)
    }).map((page) => {
      page.src     // منبع اصلی مارک‌داون
      page.html    // صفحه HTML کامل
      page.excerpt // خلاصه HTML (محتوای بالای اولین `---`)
      return {/* ... */}
    })
  }
})
```

بررسی کنید که چگونه در [وبلاگ Vue.js](https://github.com/vuejs/blog/blob/main/.vitepress/theme/posts.data.ts) استفاده شده است.

API `createContentLoader` همچنین می‌تواند در داخل [هوک‌های ساخت](../reference/site-config#build-hooks) استفاده شود:

```js [.vitepress/config.js]
export default {
  async buildEnd() {
    const posts = await createContentLoader('posts/*.md').load()
    // تولید فایل‌های بر اساس فراداده‌های پست‌ها، مثلاً فید RSS
  }
}
```

**انواع**

```ts
interface ContentOptions<T = ContentData[]> {
  /**
   * آیا منبع اصلی را اضافه کنیم؟
   * @default false
   */
  includeSrc?: boolean

  /**
   * آیا منبع را به HTML تبدیل کرده و در داده شامل کنیم؟
   * @default false
   */
  render?: boolean

  /**
   * اگر `boolean` باشد، آیا باید خلاصه را تجزیه و شامل کنیم؟ (به صورت HTML)
   *
   * اگر `function` باشد، کنترل نحوه استخراج خلاصه از محتوا.
   *
   * اگر `string` باشد، تعیین کنید که چگونه جداکننده سفارشی باید برای استخراج خلاصه استفاده شود.
   * جداکننده پیش‌فرض `---` است اگر `excerpt` `true` باشد.
   *
   * @see https://github.com/jonschlinkert/gray-matter#optionsexcerpt
   * @see https://github.com/jonschlinkert/gray-matter#optionsexcerpt_separator
   *
   * @default false
   */
  excerpt?:
    | boolean
    | ((file: { data: { [key: string]: any }; content: string; excerpt?: string }, options?: any) => void)
    | string

  /**
   * تبدیل داده. توجه داشته باشید که داده به عنوان JSON در بسته مشتری درج خواهد شد
   * اگر از اجزا یا فایل‌های مارک‌داون وارد شود.
   */
  transform?: (data: ContentData[]) => T | Promise<T>
}
```

## بارگذارهای داده تایپ شده  {#typed-data-loaders}

زمان استفاده از TypeScript، می‌توانید بارگذار و صادرات `data` خود را به این شکل تایپ کنید:

```ts
import { defineLoader } from 'vitepress'

export interface Data {
  // نوع داده
}

declare const data: Data
export { data }

export default defineLoader({
  // گزینه‌های بارگذاری با تایپ چک شده
  watch: ['...'],
  async load(): Promise<Data> {
    // ...
  }
})
```

## پیکربندی {#configuration}

برای دریافت اطلاعات پیکربندی در داخل یک بارگذار، می‌توانید از کدی مانند زیر استفاده کنید:

```ts
import type { SiteConfig } from 'vitepress'

const config: SiteConfig = (globalThis as any).VITEPRESS_CONFIG
```
