import { createRequire } from 'module'
import { defineAdditionalConfig, type DefaultTheme } from 'vitepress'

const require = createRequire(import.meta.url)
const pkg = require('vitepress/package.json')

export default defineAdditionalConfig({
  description: 'ژنراتور استاتیک وب‌سایت با Vite و Vue',

  // prettier-ignore
  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100..900&display=swap', rel: 'stylesheet' }],
  ],

  themeConfig: {
    nav: nav(),

    search: { options: searchOptions() },

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
      text: 'آخرین به‌روزرسانی‌'
    },

    notFound: {
      title: 'صفحه پیدا نشد',
      quote:
        'اما اگر جهت خود را تغییر ندهید و همچنان به جستجو ادامه دهید، ممکن است در نهایت به جایی برسید که در حال رفتن به آن هستید.',
      linkLabel: 'برو به خانه',
      linkText: 'من را به خانه ببر'
    },

    langMenuLabel: 'تغییر زبان',
    returnToTopLabel: 'بازگشت به بالا',
    sidebarMenuLabel: 'منوی جانبی',
    darkModeSwitchLabel: 'تم تاریک',
    lightModeSwitchTitle: 'رفتن به حالت روشن',
    darkModeSwitchTitle: 'رفتن به حالت تاریک',
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
          text: '1.6.4',
          link: 'https://vuejs.github.io/vitepress/v1/fa/'
        },
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

function searchOptions(): Partial<DefaultTheme.AlgoliaSearchOptions> {
  return {
    translations: {
      button: {
        buttonText: 'جستجو',
        buttonAriaLabel: 'جستجو'
      },
      modal: {
        searchBox: {
          clearButtonTitle: 'پاک کردن',
          clearButtonAriaLabel: 'پاک کردن عبارت جستجو',
          closeButtonText: 'بستن',
          closeButtonAriaLabel: 'بستن',
          placeholderText: 'در مستندات جستجو کنید یا از Ask AI بپرسید',
          placeholderTextAskAi: 'سؤال دیگری بپرسید...',
          placeholderTextAskAiStreaming: 'در حال پاسخ گویی...',
          searchInputLabel: 'جستجو',
          backToKeywordSearchButtonText: 'بازگشت به جستجوی کلیدواژه',
          backToKeywordSearchButtonAriaLabel: 'بازگشت به جستجوی کلیدواژه',
          newConversationPlaceholder: 'یک سؤال بپرسید',
          conversationHistoryTitle: 'تاریخچه گفت وگوی من',
          startNewConversationText: 'شروع گفت وگوی جدید',
          viewConversationHistoryText: 'تاریخچه گفت وگو',
          threadDepthErrorPlaceholder: 'محدودیت گفت وگو رسید'
        },
        newConversation: {
          newConversationTitle: 'امروز چگونه می توانم کمک کنم؟',
          newConversationDescription:
            'در مستندات شما جستجو می کنم تا سریع راهنماهای راه اندازی، جزئیات ویژگی ها و نکات رفع اشکال را پیدا کنم.'
        },
        footer: {
          selectText: 'انتخاب',
          submitQuestionText: 'ارسال سؤال',
          selectKeyAriaLabel: 'کلید Enter',
          navigateText: 'پیمایش',
          navigateUpKeyAriaLabel: 'پیکان بالا',
          navigateDownKeyAriaLabel: 'پیکان پایین',
          closeText: 'بستن',
          backToSearchText: 'بازگشت به جستجو',
          closeKeyAriaLabel: 'کلید Escape',
          poweredByText: 'قدرت گرفته از'
        },
        errorScreen: {
          titleText: 'امکان دریافت نتایج وجود ندارد',
          helpText: 'ممکن است لازم باشد اتصال شبکه را بررسی کنید.'
        },
        startScreen: {
          recentSearchesTitle: 'اخیر',
          noRecentSearchesText: 'جستجوی اخیر وجود ندارد',
          saveRecentSearchButtonTitle: 'ذخیره این جستجو',
          removeRecentSearchButtonTitle: 'حذف این جستجو از تاریخچه',
          favoriteSearchesTitle: 'علاقه مندی ها',
          removeFavoriteSearchButtonTitle: 'حذف این جستجو از علاقه مندی ها',
          recentConversationsTitle: 'گفت وگوهای اخیر',
          removeRecentConversationButtonTitle: 'حذف این گفت وگو از تاریخچه'
        },
        noResultsScreen: {
          noResultsText: 'هیچ نتیجه ای برای',
          suggestedQueryText: 'سعی کنید جستجو کنید',
          reportMissingResultsText:
            'فکر می کنید این جستجو باید نتیجه داشته باشد؟',
          reportMissingResultsLinkText: 'به ما اطلاع دهید.'
        },
        resultsScreen: {
          askAiPlaceholder: 'از هوش مصنوعی بپرسید: ',
          noResultsAskAiPlaceholder:
            'در مستندات پیدا نکردید؟ از Ask AI کمک بگیرید: '
        },
        askAiScreen: {
          disclaimerText:
            'پاسخ ها توسط هوش مصنوعی تولید می شوند و ممکن است اشتباه باشند. بررسی کنید.',
          relatedSourcesText: 'منابع مرتبط',
          thinkingText: 'در حال فکر کردن...',
          copyButtonText: 'کپی',
          copyButtonCopiedText: 'کپی شد!',
          copyButtonTitle: 'کپی',
          likeButtonTitle: 'پسندیدم',
          dislikeButtonTitle: 'نپسندیدم',
          thanksForFeedbackText: 'از بازخورد شما متشکریم!',
          preToolCallText: 'در حال جستجو...',
          duringToolCallText: 'در حال جستجو...',
          afterToolCallText: 'جستجو برای',
          stoppedStreamingText: 'شما این پاسخ را متوقف کردید',
          errorTitleText: 'خطای گفتگو',
          threadDepthExceededMessage:
            'برای حفظ دقت پاسخ ها، این گفت وگو بسته شد.',
          startNewConversationButtonText: 'شروع گفت وگوی جدید'
        }
      }
    },
    askAi: {
      sidePanel: {
        button: {
          translations: {
            buttonText: 'از هوش مصنوعی بپرسید',
            buttonAriaLabel: 'از هوش مصنوعی بپرسید'
          }
        },
        panel: {
          translations: {
            header: {
              title: 'از هوش مصنوعی بپرسید',
              conversationHistoryTitle: 'تاریخچه گفت وگوی من',
              newConversationText: 'شروع گفت وگوی جدید',
              viewConversationHistoryText: 'تاریخچه گفت وگو'
            },
            promptForm: {
              promptPlaceholderText: 'یک سؤال بپرسید',
              promptAnsweringText: 'در حال پاسخ گویی...',
              promptAskAnotherQuestionText: 'سؤال دیگری بپرسید',
              promptDisclaimerText:
                'پاسخ ها توسط هوش مصنوعی تولید می شوند و ممکن است اشتباه باشند.',
              promptLabelText:
                'برای ارسال Enter را بزنید، یا برای خط جدید Shift+Enter.',
              promptAriaLabelText: 'ورودی پرسش'
            },
            conversationScreen: {
              preToolCallText: 'در حال جستجو...',
              searchingText: 'در حال جستجو...',
              toolCallResultText: 'جستجو برای',
              conversationDisclaimer:
                'پاسخ ها توسط هوش مصنوعی تولید می شوند و ممکن است اشتباه باشند. بررسی کنید.',
              reasoningText: 'در حال استدلال...',
              thinkingText: 'در حال فکر کردن...',
              relatedSourcesText: 'منابع مرتبط',
              stoppedStreamingText: 'شما این پاسخ را متوقف کردید',
              copyButtonText: 'کپی',
              copyButtonCopiedText: 'کپی شد!',
              likeButtonTitle: 'پسندیدم',
              dislikeButtonTitle: 'نپسندیدم',
              thanksForFeedbackText: 'از بازخورد شما متشکریم!',
              errorTitleText: 'خطای گفتگو'
            },
            newConversationScreen: {
              titleText: 'امروز چگونه می توانم کمک کنم؟',
              introductionText:
                'در مستندات شما جستجو می کنم تا سریع راهنماهای راه اندازی، جزئیات ویژگی ها و نکات رفع اشکال را پیدا کنم.'
            },
            logo: {
              poweredByText: 'قدرت گرفته از'
            }
          }
        }
      }
    }
  }
}
