import { createRequire } from 'module'
import { defineConfig, type DefaultTheme } from 'vitepress'

const require = createRequire(import.meta.url)
const pkg = require('vitepress/package.json')

export const ru = defineConfig({
  lang: 'ru-RU',
  description: 'Генератор статических сайтов на основе Vite и Vue.',

  themeConfig: {
    nav: nav(),

    sidebar: {
      '/ru/guide/': { base: '/ru/guide/', items: sidebarGuide() },
      '/ru/reference/': { base: '/ru/reference/', items: sidebarReference() }
    },

    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
      text: 'Редактировать страницу'
    },

    footer: {
      message: 'Опубликовано под лицензией MIT.',
      copyright: '© 2019 – настоящее время, Эван Ю'
    },

    outline: { label: 'Содержание страницы' },

    docFooter: {
      prev: 'Предыдущая страница',
      next: 'Следующая страница'
    },

    lastUpdated: {
      text: 'Обновлено'
    },

    darkModeSwitchLabel: 'Оформление',
    lightModeSwitchTitle: 'Переключить на светлую тему',
    darkModeSwitchTitle: 'Переключить на тёмную тему',
    sidebarMenuLabel: 'Меню',
    returnToTopLabel: 'Вернуться к началу',
    langMenuLabel: 'Изменить язык',
    skipToContentLabel: 'Перейти к содержимому'
  }
})

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: 'Руководство',
      link: '/ru/guide/what-is-vitepress',
      activeMatch: '/ru/guide/'
    },
    {
      text: 'Справочник',
      link: '/ru/reference/site-config',
      activeMatch: '/ru/reference/'
    },
    {
      text: pkg.version,
      items: [
        {
          text: 'Изменения',
          link: 'https://github.com/vuejs/vitepress/blob/main/CHANGELOG.md'
        },
        {
          text: 'Вклад',
          link: 'https://github.com/vuejs/vitepress/blob/main/.github/contributing.md'
        }
      ]
    }
  ]
}

function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Введение',
      collapsed: false,
      items: [
        { text: 'Что такое VitePress?', link: 'what-is-vitepress' },
        { text: 'Первые шаги', link: 'getting-started' },
        { text: 'Маршрутизация', link: 'routing' },
        { text: 'Развёртывание', link: 'deploy' }
      ]
    },
    {
      text: 'Написание',
      collapsed: false,
      items: [
        { text: 'Расширения Markdown', link: 'markdown' },
        { text: 'Обработка ресурсов', link: 'asset-handling' },
        { text: 'Метаданные', link: 'frontmatter' },
        { text: 'Использование Vue в Markdown', link: 'using-vue' },
        { text: 'Интернационализация', link: 'i18n' }
      ]
    },
    {
      text: 'Настройка',
      collapsed: false,
      items: [
        { text: 'Пользовательская тема', link: 'custom-theme' },
        {
          text: 'Расширение темы по умолчанию',
          link: 'extending-default-theme'
        },
        {
          text: 'Загрузка данных в режиме реального времени',
          link: 'data-loading'
        },
        { text: 'Совместимость с SSR', link: 'ssr-compat' },
        { text: 'Подключение к CMS', link: 'cms' }
      ]
    },
    {
      text: 'Экспериментально',
      collapsed: false,
      items: [
        { text: 'Режим MPA', link: 'mpa-mode' },
        { text: 'Генерация карты сайта', link: 'sitemap-generation' }
      ]
    },
    { text: 'Конфигурация и API', base: '/ru/reference/', link: 'site-config' }
  ]
}

function sidebarReference(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Справочник',
      items: [
        { text: 'Конфигурация сайта', link: 'site-config' },
        { text: 'Конфигурация метаданных', link: 'frontmatter-config' },
        { text: 'Runtime API', link: 'runtime-api' },
        { text: 'Командная строка', link: 'cli' },
        {
          text: 'Тема по умолчанию',
          base: '/ru/reference/default-theme-',
          items: [
            { text: 'Обзор', link: 'config' },
            { text: 'Навигация', link: 'nav' },
            { text: 'Сайдбар', link: 'sidebar' },
            { text: 'Главная страница', link: 'home-page' },
            { text: 'Футер', link: 'footer' },
            { text: 'Макет', link: 'layout' },
            { text: 'Значки', link: 'badge' },
            { text: 'Страница команды', link: 'team-page' },
            {
              text: 'Предыдущая и следующая страницы',
              link: 'prev-next-links'
            },
            { text: 'Ссылка для редактирования', link: 'edit-link' },
            { text: 'Последнее обновление', link: 'last-updated' },
            { text: 'Поиск', link: 'search' },
            { text: 'Carbon Ads (реклама)', link: 'carbon-ads' }
          ]
        }
      ]
    }
  ]
}

export const search: DefaultTheme.AlgoliaSearchOptions['locales'] = {
  ru: {
    placeholder: 'Поиск в документации',
    translations: {
      button: {
        buttonText: 'Поиск',
        buttonAriaLabel: 'Поиск'
      },
      modal: {
        searchBox: {
          resetButtonTitle: 'Сбросить поиск',
          resetButtonAriaLabel: 'Сбросить поиск',
          cancelButtonText: 'Отменить поиск',
          cancelButtonAriaLabel: 'Отменить поиск'
        },
        startScreen: {
          recentSearchesTitle: 'История поиска',
          noRecentSearchesText: 'Нет истории поиска',
          saveRecentSearchButtonTitle: 'Сохранить в истории поиска',
          removeRecentSearchButtonTitle: 'Удалить из истории поиска',
          favoriteSearchesTitle: 'Избранное',
          removeFavoriteSearchButtonTitle: 'Удалить из избранного'
        },
        errorScreen: {
          titleText: 'Невозможно получить результаты',
          helpText: 'Вам может потребоваться проверить подключение к Интернету'
        },
        footer: {
          selectText: 'выбрать',
          navigateText: 'перейти',
          closeText: 'закрыть',
          searchByText: 'поставщик поиска'
        },
        noResultsScreen: {
          noResultsText: 'Нет результатов для',
          suggestedQueryText: 'Вы можете попытаться узнать',
          reportMissingResultsText:
            'Считаете, что поиск даёт ложные результаты？',
          reportMissingResultsLinkText: 'Нажмите на кнопку «Обратная связь»'
        }
      }
    }
  }
}
