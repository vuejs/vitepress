# پیکربندی پیش‌فرض تم {#default-theme-config}

پیکربندی تم به شما امکان می‌دهد تا تم خود را سفارشی کنید. شما می‌توانید پیکربندی تم را از طریق گزینه `themeConfig` در فایل پیکربندی تعریف کنید:

```ts
export default {
  lang: 'en-US',
  title: 'ویت‌پرس',
  description: 'Vite & Vue powered static site generator.',

  // پیکربندی‌های مربوط به تم.
  themeConfig: {
    logo: '/logo.svg',
    nav: [...],
    sidebar: { ... }
  }
}
```

**گزینه‌های مستند شده در این صفحه تنها برای تم پیش‌فرض اعمال می‌شوند.** تم‌های مختلف انتظار دارند که پیکربندی تم متفاوتی داشته باشند. در هنگام استفاده از یک تم سفارشی، شیء پیکربندی تم به تم منتقل می‌شود تا تم بتواند بر اساس آن رفتار شرطی را تعریف کند.

## i18nRouting {#i18nrouting}

- نوع: `boolean`

تغییر زبان به `zh` باعث تغییر URL از `/foo` (یا `/en/foo/`) به `/zh/foo` می‌شود. شما می‌توانید این رفتار را با تنظیم `themeConfig.i18nRouting` به `false` غیرفعال کنید.

## logo {#logo}

- نوع: `ThemeableImage`

فایل لوگو برای نمایش در نوار ناوبری، به سمت راست قبل از عنوان سایت. یک رشته مسیر یا یک شیء برای تنظیم لوگو متفاوت برای حالت نوری/تاریک قبول می‌کند.

```ts
export default {
  themeConfig: {
    logo: '/logo.svg'
  }
}
```

```ts
type ThemeableImage =
  | string
  | { src: string; alt?: string }
  | { light: string; dark: string; alt?: string }
```

## siteTitle

- نوع: `string | false`

شما می‌توانید این مورد را سفارشی کنید تا عنوان سایت پیش‌فرض (`title` در پیکربندی برنامه) را در ناوبری جایگزین کنید. هنگامی که به `false` تنظیم می‌شود، عنوان در ناوبری غیرفعال می‌شود. این قابلیت مفید است زمانی که شما لوگو دارید که حاوی متن عنوان سایت است.

```ts
export default {
  themeConfig: {
    siteTitle: 'Hello World'
  }
}
```

## nav

- نوع: `NavItem`

پیکربندی برای موارد منوی ناوبری. جزئیات بیشتر در [تم پیش‌فرض: ناوبری](./default-theme-nav#navigation-links).

```ts
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

```ts
type NavItem = NavItemWithLink | NavItemWithChildren

interface NavItemWithLink {
  text: string
  link: string
  activeMatch?: string
  target?: string
  rel?: string
  noIcon?: boolean
}

interface NavItemChildren {
  text?: string
  items: NavItemWithLink[]
}

interface NavItemWithChildren {
  text?: string
  items: (NavItemChildren | NavItemWithLink)[]
  activeMatch?: string
}
```

## sidebar

- نوع: `Sidebar`

پیکربندی برای موارد منوی نوار کناری. جزئیات بیشتر در [تم پیش‌فرض: نوار کناری](./default-theme-sidebar).

```ts
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'راهنما',
        items: [
          { text: 'معرفی', link: '/introduction' },
          { text: 'شروع کار', link: '/getting-started' },
          ...
        ]
      }
    ]
  }
}
```

```ts
export type Sidebar = SidebarItem[] | SidebarMulti

export interface SidebarMulti {
  [path: string]: SidebarItem[] | { items: SidebarItem[]; base: string }
}

export type SidebarItem = {
  /**
   * برچسب متنی مورد.
   */
  text?: string

  /**
   * لینک مورد.
   */
  link?: string

  /**
   * فرزندان مورد.
   */
  items?: SidebarItem[]

  /**
   * اگر مشخص نشده باشد، گروه قابل جمع‌شدن نیست.
   *
   * اگر `true` باشد، گروه قابل جمع‌شدن است و به طور پیش‌فرض جمع شده است
   *
   * اگر `false` باشد، گروه قابل جمع‌شدن است اما به طور پیش‌فرض باز شده است
   */
  collapsed?: boolean

  /**
   * مسیر پایه برای موارد فرزند.
   */
  base?: string

  /**
   * سفارشی‌سازی متنی که در پا صفحه قبلی/بعدی نمایش داده می‌شود.
   */
  docFooterText?: string

  rel?: string
  target?: string
}
```

## aside

- نوع: `boolean | 'left'`
- پیش‌فرض: `true`
- می‌تواند به صورت خودکار برای هر صفحه از طریق [frontmatter](./frontmatter-config#aside) بازنویسی شود.

تنظیم این مقدار به `false` از رندر کردن کانتینر اطراف خودداری می‌کند.\
تنظیم این مقدار به `true` کانتینر اطراف را به راست رندر می‌کند.\
تنظیم این مقدار به `left` کانتینر اطراف را به چپ رندر می‌کند.

اگر می‌خواهید آن را برای تمام نمایه‌گرها غیرفعال کنید، به جای آن باید از `outline: false` استفاده کنید.

## outline

- نوع: `Outline | Outline['level'] | false`
- می‌تواند به صورت خودکار برای هر صفحه از طریق [frontmatter](./frontmatter-config#outline) بازنویسی شود.

تنظیم این مقدار به `false` از

رندر کردن کانتینر آوند خودداری می‌کند. به این رابط مراجعه کنید تا جزئیات بیشتری را بدانید:

```ts
interface Outline {
  /**
   * سطوح سرفصل‌هایی که در آوند نمایش داده خواهند شد.
   * یک عدد تک را به این معنا است که تنها سرفصل‌های آن سطح نمایش داده می‌شوند.
   * اگر یک دوتایی گذر داده شود، عدد اول سطح حداقل و عدد دوم سطح حداکثر است.
   * `'deep'` مانند `[2، 6]` است، که به معنای همه سرفصل‌ها از `<h2>` تا `<h6>` است.
   *
   * @default 2
   */
  level?: number | [number، number] | 'deep'

  /**
   * عنوانی که باید در آوند نمایش داده شود.
   *
   * @default 'On this page'
   */
  label?: string
}
```

## socialLinks

- نوع: `SocialLink[]`

می‌توانید این گزینه را تعریف کنید تا لینک‌های حساب اجتماعی خود را با آیکون‌ها در ناوبری نمایش دهید.

```ts
export default {
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
      { icon: 'twitter', link: '...' },
      // شما همچنین می‌توانید آیکون‌های سفارشی را با ارسال SVG به عنوان رشته اضافه کنید:
      {
        icon: {
          svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Dribbble</title><path d="M12...6.38z"/></svg>'
        },
        link: '...',
        // شما همچنین می‌توانید برچسب سفارشی را برای دسترسی (اختیاری اما توصیه می‌شود) شامل کنید:
        ariaLabel: 'لینک جذاب'
      }
    ]
  }
}
```

```ts
interface SocialLink {
  icon: SocialLinkIcon
  link: string
  ariaLabel?: string
}

type SocialLinkIcon =
  | 'discord'
  | 'facebook'
  | 'github'
  | 'instagram'
  | 'linkedin'
  | 'mastodon'
  | 'npm'
  | 'slack'
  | 'twitter'
  | 'x'
  | 'youtube'
  | { svg: string }
```

## footer

- نوع: `Footer`
- می‌تواند به صورت خودکار برای هر صفحه از طریق [frontmatter](./frontmatter-config#footer) بازنویسی شود.

پیکربندی پا. شما می‌توانید پیام یا متن حق کپی را در پا اضافه کنید، با این حال، فقط زمانی نمایش داده می‌شود که صفحه شامل نوار کناری نباشد. این به دلایل طراحی است.

```ts
export default {
  themeConfig: {
    footer: {
      message: 'منتشر شده تحت مجوز MIT.',
      copyright: 'حق نشر © 2019-present Evan You'
    }
  }
}
```

```ts
export interface Footer {
  message?: string
  copyright?: string
}
```

## editLink

- نوع: `EditLink`
- می‌تواند به صورت خودکار برای هر صفحه از طریق [frontmatter](./frontmatter-config#editlink) بازنویسی شود.

پیوند ویرایش به شما امکان می‌دهد که یک لینک به ویرایش صفحه را در خدمات مدیریت گیت مانند GitHub یا GitLab نمایش دهید. برای جزئیات بیشتر به [تم پیش‌فرض: لینک ویرایش](./default-theme-edit-link) مراجعه کنید.

```ts
export default {
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
      text: 'ویرایش این صفحه در GitHub'
    }
  }
}
```

```ts
export interface EditLink {
  pattern: string
  text?: string
}
```

## lastUpdated

- نوع: `LastUpdatedOptions`

امکانات سفارشی‌سازی برای متن به‌روز شده و فرمت تاریخ.

```ts
export default {
  themeConfig: {
    lastUpdated: {
      text: 'به‌روزرسانی شده در',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    }
  }
}
```

```ts
export interface LastUpdatedOptions {
  /**
   * @default 'آخرین به‌روزرسانی'
   */
  text?: string

  /**
   * @default
   * { dateStyle: 'short',  timeStyle: 'short' }
   */
  formatOptions?: Intl.DateTimeFormatOptions & { forceLocale?: boolean }
}
```

## algolia

- نوع: `AlgoliaSearch`

یک گزینه برای پشتیبانی از جستجو در سایت مستندات خود با استفاده از [Algolia DocSearch](https://docsearch.algolia.com/docs/what-is-docsearch). بیشتر در [تم پیش‌فرض: جستجو](./default-theme-search) بیاموزید.

```ts
export interface AlgoliaSearchOptions extends DocSearchProps {
  locales?: Record<string, Partial<DocSearchProps>>
}
```

گزینه‌های کامل را [اینجا](https://github.com/vuejs/vitepress/blob/main/types/docsearch.d.ts) مشاهده کنید.

## carbonAds {#carbon-ads}

- نوع: `CarbonAdsOptions`

یک گزینه برای نمایش [Carbon Ads](https://www.carbonads.net/).

```ts
export default {
  themeConfig: {
    carbonAds: {
      code: 'your-carbon-code',
      placement: 'your-carbon-placement'
    }
  }
}
```

```ts
export interface CarbonAdsOptions {
  code: string
  placement: string
}
```

بیشتر در [تم پیش‌فرض: Carbon Ads](./default-theme-carbon-ads) بیاموزید.

## docFooter

- نوع: `DocFooter`

می‌تواند برای سفارشی‌سازی متنی که در بالای لینک‌های قبلی و بعدی نمایش داده می‌شود استفاده شود. مفید است اگر مستندات خود را به زبانی غیر از انگلیسی نوشته باشید. همچنین می‌تواند برای غیرفعال کردن لینک‌های قبلی/بعدی به صورت جهانی استفاده شود. اگر می‌خواهید لینک‌های قبلی/بعدی را به صورت انتخابی فعال

/غیرفعال کنید، می‌توانید از [frontmatter](./default-theme-prev-next-links) استفاده کنید.

```ts
export default {
  themeConfig: {
    docFooter: {
      prev: 'صفحه قبلی',
      next: 'صفحه بعدی'
    }
  }
}
```

```ts
export interface DocFooter {
  prev?: string | false
  next?: string | false
}
```

## darkModeSwitchLabel

- نوع: `string`
- پیش‌فرض: `ظاهر`

می‌تواند برای سفارشی‌سازی برچسب سوئیچ حالت تاریک استفاده شود. این برچسب تنها در نمای تلفن همراه نمایش داده می‌شود.

## lightModeSwitchTitle

- نوع: `string`
- پیش‌فرض: `تغییر به تم روشن`

می‌تواند برای سفارشی‌سازی عنوان سوئیچ حالت روشن که در بالا حاشیه دار می‌شود، استفاده شود.

## darkModeSwitchTitle

- نوع: `string`
- پیش‌فرض: `تغییر به تم تاریک`

می‌تواند برای سفارشی‌سازی عنوان سوئیچ حالت تاریک که در بالا حاشیه دار می‌شود، استفاده شود.

## sidebarMenuLabel

- نوع: `string`
- پیش‌فرض: `منو`

می‌تواند برای سفارشی‌سازی برچسب منوی نوار کناری استفاده شود. این برچسب تنها در نمای تلفن همراه نمایش داده می‌شود.

## returnToTopLabel

- نوع: `string`
- پیش‌فرض: `بازگشت به بالا`

می‌تواند برای سفارشی‌سازی برچسب دکمه بازگشت به بالا استفاده شود. این برچسب تنها در نمای تلفن همراه نمایش داده می‌شود.

## langMenuLabel

- نوع: `string`
- پیش‌فرض: `تغییر زبان`

می‌تواند برای سفارشی‌سازی برچسب aria- توگل زبان در ناوبری استفاده شود. این فقط در صورت استفاده از [i18n](../guide/i18n) استفاده می‌شود.

## externalLinkIcon

- نوع: `boolean`
- پیش‌فرض: `false`

آیا باید نمایش آیکون لینک خارجی کنار لینک‌های خارجی در مارک‌داون باشد.
