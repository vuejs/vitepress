import { createRequire } from 'module'
import { defineConfig, type DefaultTheme } from 'vitepress'

const require = createRequire(import.meta.url)
const pkg = require('vitepress/package.json')

export const fa = defineConfig({
  title: 'ویت‌پرس',
  lang: 'fa-IR',
  description: 'Vite & Vue powered static site generator.',
  dir: 'rtl',
  markdown: {
    container: {
      tipLabel: 'نکته',
      warningLabel: 'هشدار',
      dangerLabel: 'خطر',
      infoLabel: 'اطلاعات',
      detailsLabel: 'جزئیات'
    }
  },
  themeConfig: {
    nav: nav(),
    sidebar: {
      '/fa/guide/': { base: '/fa/guide/', items: sidebarGuide() },
      '/fa/reference/': { base: '/fa/reference/', items: sidebarReference() }
    },

    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
      text: 'ویرایش این صفحه در گیت‌هاب'
    },

    footer: {
      message: 'انتشار یافته تحت لایسنس MIT',
      copyright: 'حق نسخه‌برداری © 2019-کنون Evan You'
    },

    docFooter: {
      prev: 'قبلی',
      next: 'بعدی'
    },

    outline: {
      label: 'در این صفحه'
    },

    lastUpdated: {
      text: 'آخرین به‌روزرسانی‌',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },

    langMenuLabel: 'تغییر زبان',
    returnToTopLabel: 'بازگشت به بالا',
    sidebarMenuLabel: 'منوی جانبی',
    darkModeSwitchLabel: 'تم تاریک',
    lightModeSwitchTitle: 'رفتن به حالت روشن',
    darkModeSwitchTitle: 'رفتن به حالت تاریک',
    notFound: {
      linkLabel: 'بازگشت به خانه',
      linkText: 'بازگشت به خانه',
      title: 'صفحه مورد نظر یافت نشد',
      code: '۴۰۴',
      quote:
        'اما اگر جهت خود را تغییر ندهید و اگر ادامه دهید به دنبال چیزی که دنبال می‌کنید، ممکن است در نهایت به جایی که در حال رفتن به سمتش هستید، برسید.'
    },
    siteTitle: 'ویت‌پرس'
  }
})

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: 'راهنما',
      link: 'fa/guide/what-is-vitepress',
      activeMatch: '/guide/'
    },
    {
      text: 'مرجع',
      link: 'fa/reference/site-config',
      activeMatch: '/reference/'
    },
    {
      text: pkg.version,
      items: [
        {
          text: 'Changelog',
          link: 'https://github.com/vuejs/vitepress/blob/main/CHANGELOG.md'
        },
        {
          text: 'مشارکت',
          link: 'https://github.com/vuejs/vitepress/blob/main/.github/contributing.md'
        }
      ]
    }
  ]
}

function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'معرفی',
      collapsed: false,
      items: [
        { text: 'ویت‌پرس چیست؟', link: 'what-is-vitepress' },
        { text: 'شروع کار', link: 'getting-started' },
        { text: 'مسیریابی', link: 'routing' },
        { text: 'استقرار', link: 'deploy' }
      ]
    },
    {
      text: 'نوشتن',
      collapsed: false,
      items: [
        { text: 'افزونه‌های Markdown', link: 'markdown' },
        { text: 'مدیریت منابع', link: 'asset-handling' },
        { text: 'Frontmatter', link: 'frontmatter' },
        { text: 'استفاده از Vue در Markdown', link: 'using-vue' },
        { text: 'بین‌المللی سازی', link: 'i18n' }
      ]
    },
    {
      text: 'شخصی‌سازی',
      collapsed: false,
      items: [
        { text: 'استفاده از تم شخصی', link: 'custom-theme' },
        {
          text: 'گسترش تم پیش‌فرض',
          link: 'extending-default-theme'
        },
        { text: 'بارگیری داده در زمان Build', link: 'data-loading' },
        { text: 'سازگاری SSR', link: 'ssr-compat' },
        { text: 'اتصال به CMS', link: 'cms' }
      ]
    },
    {
      text: 'آزمایشی',
      collapsed: false,
      items: [
        { text: 'حالت MPA', link: 'mpa-mode' },
        { text: 'جنریت کردن Sitemap', link: 'sitemap-generation' }
      ]
    },
    { text: 'پیکربندی و مرجع API', base: 'fa/reference/', link: 'site-config' }
  ]
}

function sidebarReference(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'مرجع',
      base: 'fa/reference/',
      items: [
        { text: 'پیکربندی Site', link: 'site-config' },
        { text: 'پیکربندی Frontmatter', link: 'frontmatter-config' },
        { text: 'Runtime API', link: 'runtime-api' },
        { text: 'CLI', link: 'cli' },
        {
          text: 'تم پیش‌فرض',
          base: 'fa/reference/default-theme-',
          items: [
            { text: 'بررسی اجمالی', link: 'config' },
            { text: 'ناوبری', link: 'nav' },
            { text: 'نوار کنار صفحه', link: 'sidebar' },
            { text: 'صفحه اصلی', link: 'home-page' },
            { text: 'پاورقی', link: 'footer' },
            { text: 'طرح', link: 'layout' },
            { text: 'نشان', link: 'badge' },
            { text: 'صفحه تیم', link: 'team-page' },
            { text: 'لینک‌های قبلی / بعدی', link: 'prev-next-links' },
            { text: 'ویرایش لینک', link: 'edit-link' },
            { text: 'Timestamp آخرین به‌روزرسانی', link: 'last-updated' },
            { text: 'جستجو', link: 'search' },
            { text: 'تبلیغات Carbon', link: 'carbon-ads' }
          ]
        }
      ]
    }
  ]
}

export const search: DefaultTheme.AlgoliaSearchOptions['locales'] = {
  fa: {
    placeholder: 'جستجوی مستندات',
    translations: {
      button: {
        buttonText: 'جستجو',
        buttonAriaLabel: 'جستجو'
      },
      modal: {
        searchBox: {
          resetButtonTitle: 'آغاز مجدد جستجو',
          resetButtonAriaLabel: 'آغاز مجدد جستجو',
          cancelButtonText: 'لغو',
          cancelButtonAriaLabel: 'لغو'
        },
        startScreen: {
          recentSearchesTitle: 'جستجو‌های اخیر',
          noRecentSearchesText: 'تاریخچه جستجویی یافت نشد.',
          saveRecentSearchButtonTitle: 'ذخیره تاریخچه جستجو',
          removeRecentSearchButtonTitle: 'حذف تاریخچه جستجو',
          favoriteSearchesTitle: 'موارد دلخواه',
          removeFavoriteSearchButtonTitle: 'حذف مورد دلخواه'
        },
        errorScreen: {
          titleText: 'نتیجه‌ای یافت نشد برای',
          helpText: 'اتصال شبکه خود را بررسی کنید'
        },
        footer: {
          selectText: 'انتخاب',
          navigateText: 'رفتن',
          closeText: 'بستن',
          searchByText: ' جستجو با '
        },
        noResultsScreen: {
          noResultsText: 'نتیجه‌ای یافت نشد برای'
        }
      }
    }
  }
}
