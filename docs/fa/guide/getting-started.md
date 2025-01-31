# شروع کار {#getting-started}

## تست آنلاین {#try-it-online}

می‌توانید ویت‌پرس را مستقیماً در مرورگر خود در [StackBlitz](https://vitepress.new) امتحان کنید.

## نصب {#installation}

### پیش‌نیازها {#prerequisites}

- [Node.js](https://nodejs.org/) نسخه 18 یا بالاتر.
- ترمینال برای دسترسی به ویت‌پرس از طریق رابط خط فرمان (CLI).
- ویرایشگر متنی با پشتیبانی از [Markdown](https://en.wikipedia.org/wiki/Markdown).
  - [VSCode](https://code.visualstudio.com/) به همراه [افزونه رسمی Vue](https://marketplace.visualstudio.com/items?itemName=Vue.volar).

ویت‌پرس می‌تواند به صورت مستقل استفاده شود یا در یک پروژه موجود نصب شود. در هر دو حالت، می‌توانید آن را با دستور زیر نصب کنید:

::: code-group

```sh [npm]
$ npm add -D vitepress
```

```sh [pnpm]
$ pnpm add -D vitepress
```

```sh [yarn]
$ yarn add -D vitepress
```

```sh [yarn (pnp)]
$ yarn add -D vitepress vue
```

```sh [bun]
$ bun add -D vitepress
```

:::

::: details درباره peer dependency های ناموجود هشدار دریافت می‌کنید؟

اگر از PNPM استفاده می‌کنید، متوجه هشدار peer dependency برای `@docsearch/js` خواهید شد. این مسئله جلوی عملکرد ویت‌پرس را نمی‌گیرد. اگر می‌خواهید این هشدار را نادیده بگیرید، موارد زیر را به `package.json` خود اضافه کنید:

```json
"pnpm": {
  "peerDependencyRules": {
    "ignoreMissing": [
      "@algolia/client-search",
      "search-insights"
    ]
  }
}
```

:::

::: tip نکته

ویت‌پرس یک بسته فقط ESM است. از `require()` برای وارد کردن آن استفاده نکنید و اطمینان حاصل کنید که نزدیک‌ترین `package.json` شما شامل `"type": "module"` است، یا پسوند فایل‌های مربوطه خود مانند `.vitepress/config.js` را به `.mjs`/`.mts` تغییر دهید. برای جزئیات بیشتر به [راهنمای عیب‌یابی Vite](http://vitejs.dev/guide/troubleshooting.html#this-package-is-esm-only) مراجعه کنید. همچنین، در زمینه‌های async CJS می‌توانید از `await import('vitepress')` استفاده کنید.

:::

### Wizard راه‌اندازی

ویت‌پرس با یک جادوگر راه‌اندازی خط فرمان ارائه می‌شود که به شما کمک می‌کند یک پروژه پایه را بسازید. پس از نصب، با اجرای دستور زیر جادوگر را راه‌اندازی کنید:

::: code-group

```sh [npm]
$ npx vitepress init
```

```sh [pnpm]
$ pnpm vitepress init
```

```sh [yarn]
$ yarn vitepress init
```

```sh [bun]
$ bun vitepress init
```

:::

چند سوال ساده از شما پرسیده خواهد شد:

<<< @/snippets/init.ansi

::: tip Vue به عنوان peer dependency

اگر قصد دارید سفارشی‌سازی‌هایی که از کامپوننت‌ها یا APIهای Vue استفاده می‌کنند را انجام دهید، باید `vue` را به عنوان dependency نیز نصب کنید.

:::

## ساختار فایل‌ها {#file-structure}

اگر در حال ساخت یک سایت مستقل ویت‌پرس هستید، می‌توانید سایت را در دایرکتوری فعلی خود (`./`) بسازید. اما، اگر ویت‌پرس را در یک پروژه موجود به همراه سایر کدهای منبع نصب می‌کنید، توصیه می‌شود سایت را در یک دایرکتوری تودرتو (مثلاً `./docs`) بسازید تا از بقیه پروژه جدا باشد.

فرض کنیم که پروژه ویت‌پرس را در `./docs` ساخته‌اید، ساختار فایل‌های تولید شده باید به این شکل باشد:

```
.
├─ docs
│  ├─ .vitepress
│  │  └─ config.js
│  ├─ api-examples.md
│  ├─ markdown-examples.md
│  └─ index.md
└─ package.json
```

دایرکتوری `docs` به عنوان **ریشه پروژه** سایت ویت‌پرس در نظر گرفته می‌شود. دایرکتوری `.vitepress` محل ذخیره فایل‌های پیکربندی ویت‌پرس، حافظه نهان سرور توسعه، خروجی ساخت و کد سفارشی‌سازی تم اختیاری است.

::: tip نکته

به طور پیش‌فرض، ویت‌پرس حافظه نهان سرور توسعه خود را در `.vitepress/cache` و خروجی ساخت تولیدی را در `.vitepress/dist` ذخیره می‌کند. اگر از Git استفاده می‌کنید، باید آنها را به فایل `.gitignore` خود اضافه کنید. این مکان‌ها همچنین قابل [پیکربندی](../reference/site-config#outdir) هستند.

:::

### فایل پیکربندی {#the-config-file}

فایل پیکربندی (`.vitepress/config.js`) به شما اجازه می‌دهد جنبه‌های مختلف سایت ویت‌پرس خود را سفارشی کنید، با گزینه‌های پایه‌ای مانند عنوان و توضیحات سایت:

```js [.vitepress/config.js]
export default {
  // گزینه‌های سطح سایت
  title: 'ویت‌پرس',
  description: 'فقط در حال بازی کردن.',

  themeConfig: {
    // گزینه‌های سطح تم
  }
}
```

همچنین می‌توانید رفتار تم را از طریق گزینه `themeConfig` پیکربندی کنید. برای جزئیات کامل درباره همه گزینه‌های پیکربندی، به [راهنمای پیکربندی](../reference/site-config) مراجعه کنید.

### فایل‌های منبع {#source-files}

فایل‌های Markdown خارج از دایرکتوری `.vitepress` به عنوان **فایل‌های منبع** در نظر گرفته می‌شوند.

ویت‌پرس از **مسیر یابی مبتنی بر فایل** استفاده می‌کند: هر فایل `.md` به یک فایل `.html` متناظر با همان مسیر کامپایل می‌شود. برای مثال، `index.md` به `index.html` کامپایل می‌شود و می‌تواند در مسیر ریشه `/` سایت ویت‌پرس نتیجه‌گیری شده بازدید شود.

ویت‌پرس همچنین قابلیت تولید URL‌های تمیز، بازنویسی مسیرها و تولید پویا صفحات را فراهم می‌کند. این موارد در [راهنمای مسیر یابی](./routing) پوشش داده خواهند شد.

## راه‌اندازی و اجرا {#up-and-running}

این ابزار باید اسکریپت‌های npm زیر را به `package.json` شما اضافه کرده باشد اگر اجازه این کار را در طول فرآیند راه‌اندازی داده باشید:

```json [package.json]
{
  ...
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs"
  },
  ...
}
```

اسکریپت `docs:dev` یک سرور توسعه محلی با به‌روزرسانی‌های فوری راه‌اندازی می‌کند. آن را با دستور زیر اجرا کنید:

::: code-group

```sh [npm]
$ npm run docs:dev
```

```sh [pnpm]
$ pnpm run docs:dev
```

```sh [yarn]
$ yarn docs:dev
```

```sh [bun]
$ bun run docs:dev
```

:::

به جای اسکریپت‌های npm، می‌توانید ویت‌پرس را مستقیماً با دستور زیر اجرا کنید:

::: code-group

```sh [npm]
$ npx vitepress dev docs
```

```sh [pnpm]
$ pnpm vitepress dev docs
```

```sh [yarn]
$ yarn vitepress dev docs
```

```sh [bun]
$ bun vitepress dev docs
```

:::

استفاده بیشتر از خط فرمان در [مرجع CLI](../reference/cli) مستند شده است.

سرور توسعه باید در `http://localhost:5173` اجرا شود. URL را در مرورگر خود بازدید کنید تا سایت جدید خود را در عمل ببینید!

## مراحل بعدی {#what-s-next}

- برای درک بهتر چگونگی نگاشت فایل‌های markdown به HTML تولید شده، به [راهنمای مسیر یابی](./routing) مراجعه کنید.

- برای کشف بیشتر درباره اینکه چه کارهایی می‌توانید در صفحه انجام دهید، مانند نوشتن محتوای markdown یا استفاده از کامپوننت‌های Vue، به بخش "نوشتن" راهنما مراجعه کنید. یک مکان عالی برای شروع یادگیری درباره [افزونه‌های Markdown](./markdown) است.

- برای کشف ویژگی‌های ارائه شده توسط تم پیش‌فرض مستندات، به [مرجع پیکربندی تم پیش‌فرض](../reference/default-theme-config) مراجعه کنید.

- اگر می‌خواهید ظاهر سایت خود را بیشتر سفارشی کنید، بررسی کنید که چگونه [تم پیش‌فرض را گسترش دهید](./extending-default-theme) یا [یک تم سفارشی بسازید](./custom-theme).

- هنگامی که سایت مستندات شما شکل گرفت، حتماً [راهنمای استقرار](./deploy) را بخوانید.
