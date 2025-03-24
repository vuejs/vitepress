# Настройка темы по умолчанию {#default-theme-config}

Конфигурация темы позволяет настроить её под себя. Вы можете настроить тему с помощью опции `themeConfig` в файле конфигурации:

```ts
export default {
  lang: 'ru-RU',
  title: 'VitePress',
  description: 'Генератор статического сайта на базе Vite и Vue.',

  // Конфигурации, связанные с темой.
  themeConfig: {
    logo: '/logo.svg',
    nav: [...],
    sidebar: { ... }
  }
}
```

**Параметры, описанные на этой странице, применимы только к теме по умолчанию.** Разные темы предполагают разные конфигурации темы. При использовании пользовательской темы объект конфигурации темы будет передан теме, чтобы она могла определить условное поведение на его основе.

## i18nRouting {#i18nrouting}

- Тип: `boolean`

При смене локали на `ru` URL изменится с `/foo` (или `/en/foo/`) на `/ru/foo`. Вы можете отключить это поведение, установив для параметра `themeConfig.i18nRouting` значение `false`.

## logo {#logo}

- Тип: `ThemeableImage`

Файл логотипа для отображения в навигационной панели, прямо перед заголовком сайта. Принимает строку пути или объект, чтобы установить другой логотип для светлого/тёмного режима.

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

## siteTitle {#sitetitle}

- Тип: `string | false`

Вы можете настроить этот элемент для замены стандартного заголовка сайта (`title` в конфигурации приложения) в nav. При установке значения `false` заголовок в панели навигации будет отключен. Пригодится, если у вас есть `logo`, который уже содержит текст названия сайта.

```ts
export default {
  themeConfig: {
    siteTitle: 'Привет, мир'
  }
}
```

## nav {#nav}

- Тип: `NavItem`

Конфигурация для пункта навигационного меню. Подробнее в главе [Тема по умолчанию: Навигация](./default-theme-nav#navigation-links).

```ts
export default {
  themeConfig: {
    nav: [
      { text: 'Руководство', link: '/guide' },
      {
        text: 'Выпадающее меню',
        items: [
          { text: 'Пункт A', link: '/item-1' },
          { text: 'Пункт B', link: '/item-2' },
          { text: 'Пункт C', link: '/item-3' }
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

## sidebar {#sidebar}

- Тип: `Sidebar`

Конфигурация для пунктов меню боковой панели. Подробнее в главе [Тема по умолчанию: Сайдбар](./default-theme-sidebar).

```ts
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Руководство',
        items: [
          { text: 'Введение', link: '/introduction' },
          { text: 'Первые шаги', link: '/getting-started' },
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
  [path: string]: SidebarItem[]
}

export type SidebarItem = {
  /**
   * Текстовая метка элемента
   */
  text?: string

  /**
   * Ссылка на элемент
   */
  link?: string

  /**
   * Потомки элемента
   */
  items?: SidebarItem[]

  /**
   * Если не указано, группа не будет сворачиваться
   *
   * Если `true`, то группа будет сворачиваться и разворачиваться по умолчанию
   *
   * Если `false`, группа сворачивается, но по умолчанию разворачивается
   */
  collapsed?: boolean
}
```

## aside {#aside}

- Тип: `boolean | 'left'`
- По умолчанию: `true`
- Можно переопределить для каждой страницы с помощью [метаданных](./frontmatter-config#aside)

Установка этого значения в `false` предотвращает отрисовку контейнера сайдбара.\
Установка этого значения в `true` приведёт к отображению сайдбара справа.\
Установка этого значения в `left` приведёт к отображению сайдбара слева.

Если вы хотите отключить его для всех режимов просмотра, используйте `aside: false`.

## outline {#outline}

- Тип: `Outline | Outline['level'] | false`
- Уровень можно переопределить для каждой страницы с помощью [метаданных](./frontmatter-config#outline)

Установка этого значения в `false` предотвращает отрисовку оглавления. Для получения более подробной информации обратитесь к этому интерфейсу:

```ts
interface Outline {
  /**
   * Уровни заголовков, которые будут отображаться в оглавлении.
   * Одиночное число означает, что будут отображаться только заголовки этого уровня.
   * Если передается кортеж, то первое число — это минимальный уровень, а второе — максимальный.
   * `'deep'` то же самое, что `[2, 6]`, что означает, что будут отображены все заголовки от `<h2>` до `<h6>`.
   *
   * @default 2
   */
  level?: number | [number, number] | 'deep'

  /**
   * Заголовок, который будет отображаться в оглавлении.
   *
   * @default 'На этой странице'
   */
  label?: string
}
```

## socialLinks {#sociallinks}

- Тип: `SocialLink[]`

Вы можете задать эту опцию, чтобы показывать ссылки на ваши социальные аккаунты с помощью иконок в панели навигации.

```ts
export default {
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
      { icon: 'twitter', link: '...' },
      // Можно добавить пользовательские иконки, передав SVG в виде строки:
      {
        icon: {
          svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Dribbble</title><path d="M12...6.38z"/></svg>'
        },
        link: '...',
        // Можно включить пользовательский ярлык для доступности (необязательно, но рекомендуется):
        ariaLabel: 'классная ссылка'
      }
    ]
  }
}
```

```ts
interface SocialLink {
  icon: string | { svg: string }
  link: string
  ariaLabel?: string
}
```

## footer {#footer}

- Тип: `Footer`
- Можно переопределить для каждой страницы с помощью [метаданных](./frontmatter-config#footer)

Настройка футера. Вы можете разместить в футере сообщение или текст об авторских правах, однако он будет отображаться только в том случае, если страница не содержит боковой панели. Это объясняется соображениями дизайна.

```ts
export default {
  themeConfig: {
    footer: {
      message: 'Опубликовано под лицензией MIT.',
      copyright: '© 2019 – настоящее время, Эван Ю'
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

## editLink {#editlink}

- Тип: `EditLink`
- Можно переопределить для каждой страницы с помощью [метаданных](./frontmatter-config#editlink)

Ссылка для редактирования позволяет отобразить ссылку для редактирования страницы на сервисах управления Git, таких как GitHub или GitLab. См. секцию [Тема по умолчанию: Ссылка для редактирования](./default-theme-edit-link) для получения более подробной информации.

```ts
export default {
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
      text: 'Редактировать эту страницу на GitHub'
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

## lastUpdated {#lastupdated}

- Тип: `LastUpdatedOptions`

Позволяет настраивать текст и формат даты последнего обновления.

```ts
export default {
  themeConfig: {
    lastUpdated: {
      text: 'Обновлено',
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
   * @default 'Last updated'
   */
  text?: string

  /**
   * @default
   * { dateStyle: 'short',  timeStyle: 'short' }
   */
  formatOptions?: Intl.DateTimeFormatOptions & { forceLocale?: boolean }
}
```

## algolia {#algolia}

- Тип: `AlgoliaSearch`

Опция для поддержки поиска на вашем сайте документации с помощью [Algolia DocSearch](https://docsearch.algolia.com/docs/what-is-docsearch). Подробнее в главе [Тема по умолчанию: Поиск](./default-theme-search)

```ts
export interface AlgoliaSearchOptions extends DocSearchProps {
  locales?: Record<string, Partial<DocSearchProps>>
}
```

Посмотреть все доступные опции можно [здесь](https://github.com/vuejs/vitepress/blob/main/types/docsearch.d.ts).

## carbonAds {#carbon-ads}

- Тип: `CarbonAdsOptions`

Возможность отображения [Carbon Ads](https://www.carbonads.net/).

```ts
export default {
  themeConfig: {
    carbonAds: {
      code: 'код-рекламы',
      placement: 'место-размещения-рекламы'
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

Подробнее в главе [Тема по умолчанию: Carbon Ads](./default-theme-carbon-ads)

## docFooter {#docfooter}

- Тип: `DocFooter`

Можно использовать для настройки текста, отображаемого над ссылками на предыдущую и следующую страницы. Полезно, если вы не пишете документы только на английском языке. Также можно использовать для глобального отключения подобных ссылок. Если вы хотите выборочно включить/выключить эти ссылки на отдельной странице, воспользуйтесь [метаданными](./default-theme-prev-next-links).

```ts
export default {
  themeConfig: {
    docFooter: {
      prev: 'Предыдущая страница',
      next: 'Следующая страница'
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

## darkModeSwitchLabel {#darkmodeswitchlabel}

- Тип: `string`
- По умолчанию: `Appearance`

Можно использовать для настройки надписи переключателя тёмного режима. Этот ярлык отображается только в мобильном представлении.

## lightModeSwitchTitle {#lightmodeswitchtitle}

- Тип: `string`
- По умолчанию: `Switch to light theme`

Может использоваться для настройки заголовка переключателя светлого режима, который появляется при наведении курсора.

## darkModeSwitchTitle {#darkmodeswitchtitle}

- Тип: `string`
- По умолчанию: `Switch to dark theme`

Можно использовать для настройки заголовка переключателя тёмного режима, который появляется при наведении курсора.

## sidebarMenuLabel {#sidebarmenulabel}

- Тип: `string`
- По умолчанию: `Menu`

Может использоваться для настройки метки бокового меню. Эта метка отображается только в мобильном представлении.

## returnToTopLabel {#returntotoplabel}

- Тип: `string`
- По умолчанию: `Return to top`

Может использоваться для настройки метки кнопки возврата наверх. Эта метка отображается только в мобильном представлении.

## langMenuLabel {#langmenulabel}

- Тип: `string`
- По умолчанию: `Change language`

Можно использовать для настройки aria-метки кнопки переключения языка в панели навигации. Это используется только в том случае, если вы используете [i18n](../guide/i18n).

## skipToContentLabel

- Тип: `string`
- По умолчанию: `Skip to content`

Можно использовать для настройки метки ссылки перехода к содержимому. Эта ссылка отображается, когда пользователь перемещается по сайту с помощью клавиатуры.

## externalLinkIcon {#externallinkicon}

- Тип: `boolean`
- По умолчанию: `false`

Отображать ли значок внешней ссылки рядом с внешними ссылками в Markdown.
