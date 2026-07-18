---
description: پیکربندی طرح صفحه اصلی تم پیش‌فرض ویت‌پرس با بخش‌های hero، ویژگی‌ها و محتوای سفارشی.
---

# صفحه اصلی {#home-page}

قالب پیش‌فرض ویت‌پرس یک طرح صفحه اصلی فراهم می‌کند که می‌توانید آن را همچنین در [صفحه اصلی این سایت](../) مشاهده کنید. شما می‌توانید آن را در هر یک از صفحات خود با تعیین `layout: home` در [frontmatter](./frontmatter-config) استفاده کنید.

```yaml
---
layout: home
---
```

اما این گزینه به تنهایی خیلی کاربردی نخواهد بود. شما می‌توانید با اضافه کردن بخش‌های "قالب‌های پیش‌فرض" مختلف، چندین بخش متفاوت را به صفحه اصلی اضافه کنید مانند `hero` و `features`.

## بخش Hero {#hero-section}

بخش Hero در بالای صفحه اصلی قرار دارد. در ادامه می‌توانید نحوه پیکربندی بخش Hero را ببینید.

```yaml
---
layout: home

hero:
  name: ویت‌پرس
  text: Vite & Vue powered static site generator.
  tagline: Lorem ipsum...
  image:
    src: /logo.png
    alt: ویت‌پرس
  actions:
    - theme: brand
      text: Get Started
      link: /guide/what-is-vitepress
    - theme: alt
      text: View on GitHub
      link: https://github.com/vuejs/vitepress
---
```

```ts
interface Hero {
  // رشته نمایش داده شده در بالای `text`. همراه با رنگ برند و انتظار می‌رود که کوتاه باشد، مانند نام محصول.
  name?: string

  // متن اصلی بخش Hero. این به عنوان تگ `h1` تعریف می‌شود.
  text: string

  // تگ‌لاین نمایش داده شده زیر `text`.
  tagline?: string

  // تصویر که در کنار ناحیه متن و تگ‌لاین نمایش داده می‌شود.
  image?: ThemeableImage

  // دکمه‌های اقدام برای نمایش در بخش Hero صفحه اصلی.
  actions?: HeroAction[]
}

type ThemeableImage =
  | string
  | { src: string; alt?: string }
  | { light: string; dark: string; alt?: string }

interface HeroAction {
  // رنگ تم دکمه. به طور پیش‌فرض `brand` است.
  theme?: 'brand' | 'alt'

  // برچسب دکمه.
  text: string

  // مقصد لینک دکمه.
  link: string

  // ویژگی هدف لینک.
  target?: string

  // ویژگی rel لینک.
  rel?: string
}
```

### سفارشی‌سازی رنگ نام {#customizing-the-name-color}

ویت‌پرس از رنگ برند (`--vp-c-brand-1`) برای `name` استفاده می‌کند. با این حال، شما می‌توانید این رنگ را با جایگذاری متغیر `--vp-home-hero-name-color` سفارشی کنید.

```css
:root {
  --vp-home-hero-name-color: blue;
}
```

همچنین می‌توانید با ترکیب `--vp-home-hero-name-background`، رنگ گرادیانت `name` را تعیین کنید.

```css
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe, #41d1ff);
}
```

## {#features-section} بخش ویژگی‌ها

در بخش ویژگی‌ها، می‌توانید هر تعدادی ویژگی که مایلید پس از بخش Hero نمایش دهید، لیست کنید. برای پیکربندی آن، گزینه `features` را به frontmatter ارسال کنید.

می‌توانید برای هر ویژگی آیکونی ارائه دهید که می‌تواند یک ایموجی یا هر نوع تصویر دیگری باشد. زمانی که آیکون پیکربندی شده یک تصویر است (svg، png، jpeg...). باید آیکون را با عرض و ارتفاع مناسب ارائه دهید. شما همچنین می‌توانید توضیحات، اندازه داخلی آن و نسخه‌های آن برای تم تاریک و روشن را ارائه دهید هنگام لزوم.

```yaml
---
layout: home

features:
  - icon: 🛠️
    title: ساده و کم حجم، همیشه
    details: Lorem ipsum...
  - icon:
      src: /cool-feature-icon.svg
    title: ویژگی جالب دیگر
    details: Lorem ipsum...
  - icon:
      dark: /dark-feature-icon.svg
      light: /light-feature-icon.svg
    title: ویژگی جالب دیگر
    details: Lorem ipsum...
---
```

```ts
interface Feature {
  // نمایش آیکون در هر جعبه ویژگی.
  icon?: FeatureIcon

  // عنوان ویژگی.
  title: string

  // جزئیات ویژگی.
  details: string

  // لینک زمانی که بر روی جزئیات کلیک می‌کنید. لینک می‌تواند داخلی یا خارجی باشد.
  //
  // به عنوان مثال: `guide/reference/default-theme-home-page` یا `https://example.com`
  link?: string

  // متن لینکی که داخل جزئیات کامپوننت نمایش داده می‌شود. بهتر است با گزینه `link` استفاده شود.
  //
  // به عنوان مثال: `بیشتر بدانید`، `صفحه بازدید` و غیره.
  linkText?: string

  // ویژگی rel لینک برای گزینه `link`.
  //
  // به عنوان مثال: `external`
  rel?: string

  // ویژگی target لینک برای گزینه `link`.
  target?: string
}

type FeatureIcon =
  | string
  | { src: string; alt?: string; width?: string; height: string }
  | {
      light: string
      dark: string
      alt?: string
      width?: string
      height: string
    }
```

## محتوای Markdown {#markdown-content}

می‌توانید محتوای اضافی را به صفحه اصلی سایت خود اضافه کنید فقط با افزودن Markdown زیر تقسیم‌کننده `---` در پایین frontmatter.

````md
---
layout: home

hero:
  name

: ویت‌پرس
  text: Vite & Vue powered static site generator.
---

## شروع کردن

می‌توانید بلافاصله با استفاده از `npx` از ویت‌پرس شروع کنید!

```sh
npm init
npx vitepress init
```
````

::: info اطلاعات
ویت‌پرس همیشه استایل اضافی محتوای صفحه `layout: home` را خودکار نمی‌کند. برای بازگشت به رفتار قدیمی، می‌توانید `markdownStyles: false` را به frontmatter اضافه کنید.
:::
