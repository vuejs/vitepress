---
outline: deep
---

# Конфигурация сайта {#site-config}

Конфигурация сайта — это место, где вы можете определить глобальные настройки сайта. Параметры конфигурации приложения определяют настройки, которые применяются к каждому сайту VitePress, независимо от того, какая тема на нем используется. Например, базовый каталог или название сайта.

## Обзор {#overview}

### Разрешение конфигурации {#config-resolution}

Файл конфигурации всегда разрешается из `<root>/.vitepress/config.[ext]`, где `<root>` — это корень вашего [проекта](../guide/routing#root-and-source-directory) VitePress, а `[ext]` — одно из поддерживаемых расширений файла. TypeScript поддерживается из коробки. Поддерживаемые расширения включают `.js`, `.ts`, `.mjs` и `.mts`.

В файлах конфигурации рекомендуется использовать синтаксис ES-модулей. Файл конфигурации должен по умолчанию экспортировать объект:

```ts
export default {
  // параметры конфигурации на уровне приложения
  lang: 'ru-RU',
  title: 'VitePress',
  description: 'Генератор статических сайтов на основе Vite и Vue.',
  ...
}
```

:::details Динамическая (асинхронная) конфигурация

Если вам нужно генерировать конфигурацию динамически, вы также можете экспортировать функцию по умолчанию. Например:

```ts
import { defineConfig } from 'vitepress'

export default async () => {
  const posts = await (await fetch('https://my-cms.com/blog-posts')).json()

  return defineConfig({
    // параметры конфигурации на уровне приложения
    lang: 'ru-RU',
    title: 'VitePress',
    description: 'Генератор статических сайтов на основе Vite и Vue.',

    // параметры конфигурации на уровне темы
    themeConfig: {
      sidebar: [
        ...posts.map((post) => ({
          text: post.name,
          link: `/posts/${post.name}`
        }))
      ]
    }
  })
}
```

Вы также можете использовать `await` верхнего уровня. Например:

```ts
import { defineConfig } from 'vitepress'

const posts = await (await fetch('https://my-cms.com/blog-posts')).json()

export default defineConfig({
  // параметры конфигурации на уровне приложения
  lang: 'ru-RU',
  title: 'VitePress',
  description: 'Генератор статических сайтов на основе Vite и Vue.',

  // параметры конфигурации на уровне темы
  themeConfig: {
    sidebar: [
      ...posts.map((post) => ({
        text: post.name,
        link: `/posts/${post.name}`
      }))
    ]
  }
})
```

:::

### Интеллектуальная настройка {#config-intellisense}

Использование помощника `defineConfig` обеспечит интеллектуальный анализ опций конфигурации на основе TypeScript. Если ваша IDE поддерживает эту функцию, она должна работать как в JavaScript, так и в TypeScript.

```js
import { defineConfig } from 'vitepress'

export default defineConfig({
  // ...
})
```

### Типизированная конфигурация темы {#typed-theme-config}

По умолчанию помощник `defineConfig` ожидает тип конфигурации темы из темы по умолчанию:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    // Тип `DefaultTheme.Config`
  }
})
```

Если вы используете пользовательскую тему и хотите проверять типы для конфигурации темы, вам нужно использовать `defineConfigWithTheme`, и передавать тип конфигурации для вашей пользовательской темы через общий аргумент:

```ts
import { defineConfigWithTheme } from 'vitepress'
import type { ThemeConfig } from 'your-theme'

export default defineConfigWithTheme<ThemeConfig>({
  themeConfig: {
    // Tип `ThemeConfig`
  }
})
```

### Настройка Vite, Vue и Markdown {#vite-vue-markdown-config}

- **Vite**

  Вы можете настроить базовый экземпляр Vite с помощью опции [vite](#vite) в конфигурации VitePress. Нет необходимости создавать отдельный файл конфигурации Vite.

- **Vue**

  VitePress уже включает в себя официальный плагин Vue для Vite ([@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue)). Вы можете настроить его параметры с помощью опции [vue](#vue) в конфигурации VitePress.

- **Markdown**

  Вы можете настроить базовый экземпляр [Markdown-It](https://github.com/markdown-it/markdown-it) с помощью опции [markdown](#markdown) в конфигурации VitePress.

## Метаданные сайта {#site-metadata}

### title {#title}

- Тип: `string`
- По умолчанию: `VitePress`
- Можно переопределить для каждой страницы с помощью [метаданных](./frontmatter-config#title)

Название для сайта. При использовании темы по умолчанию оно будет отображаться в панели навигации.

Оно также будет использоваться в качестве суффикса по умолчанию для всех заголовков отдельных страниц, если не определен [`titleTemplate`](#titletemplate). Окончательный заголовок отдельной страницы будет представлять собой текстовое содержимое её первого заголовка `<h1>`, объединённое с глобальным `title` в качестве суффикса. Например, со следующей конфигурацией и содержимым страницы:

```ts
export default {
  title: 'Мой замечательный сайт'
}
```

```md
# Привет
```

Заголовок страницы будет таким: `Привет | Мой замечательный сайт`.

### titleTemplate {##titletemplate}

- Тип: `string | boolean`
- Можно переопределить для каждой страницы с помощью [метаданных](./frontmatter-config#titletemplate)

Позволяет настраивать суффикс заголовка каждой страницы или весь заголовок. Например:

```ts
export default {
  title: 'Мой замечательный сайт',
  titleTemplate: 'Пользовательский суффикс'
}
```

```md
# Привет
```

Заголовок страницы будет таким: `Привет | Пользовательский суффикс`.

Чтобы полностью настроить отображение заголовка, вы можете использовать символ `:title` в `titleTemplate`:

```ts
export default {
  titleTemplate: ':title - Пользовательский суффикс'
}
```

Здесь `:title` будет заменён текстом, выведенным из первого заголовка страницы `<h1>`. Заголовок страницы предыдущего примера будет `Привет - Пользовательский суффикс`.

Опция может быть установлена в значение `false`, чтобы отключить суффиксы заголовков.

### description {#description}

- Тип: `string`
- По умолчанию: `A VitePress site`
- Можно переопределить для каждой страницы с помощью [метаданных](./frontmatter-config#description)

Описание для сайта. Это будет отображаться как тег `<meta>` в HTML-странице.

```ts
export default {
  description: 'A VitePress site'
}
```

### head {#head}

- Тип: `HeadConfig[]`
- По умолчанию: `[]`
- Можно добавлять на страницу через [метаданные](./frontmatter-config#head)

Дополнительные элементы для отображения в теге `<head>` в HTML-странице. Добавленные пользователем теги выводятся перед закрывающим тегом `head`, после тегов VitePress.

```ts
type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string]
```

#### Пример: Добавление значка сайта {#example-adding-a-favicon}

```ts
export default {
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]]
} // поместите favicon.ico в публичную директорию; если установлен параметр base, используйте /base/favicon.ico

/* Отрисуется так:
  <link rel="icon" href="/favicon.ico">
*/
```

#### Пример: Добавление шрифтов Google {#example-adding-google-fonts}

```ts
export default {
  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    [
      'link',
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }
    ],
    [
      'link',
      {
        href: 'https://fonts.googleapis.com/css2?family=Roboto&display=swap',
        rel: 'stylesheet'
      }
    ]
  ]
}

/* Отрисуется так:
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">
*/
```

#### Пример: Регистрация сервис-воркера {#example-registering-a-service-worker}

```ts
export default {
  head: [
    [
      'script',
      { id: 'register-sw' },
      `;(() => {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register('/sw.js')
        }
      })()`
    ]
  ]
}

/* Отрисуется так:
  <script id="register-sw">
    ;(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
      }
    })()
  </script>
*/
```

#### Пример: Использование Google Analytics {#example-using-google-analytics}

```ts
export default {
  head: [
    [
      'script',
      { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=TAG_ID' }
    ],
    [
      'script',
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'TAG_ID');`
    ]
  ]
}

/* Отрисуется так:
  <script async src="https://www.googletagmanager.com/gtag/js?id=TAG_ID"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'TAG_ID');
  </script>
*/
```

### lang {#lang}

- Тип: `string`
- По умолчанию: `en-US`

Атрибут lang для сайта. Будет выглядеть как тег `<html lang="en-US">` в HTML-странице.

```ts
export default {
  lang: 'en-US'
}
```

### base {#base}

- Тип: `string`
- По умолчанию: `/`

Базовый URL-адрес, по которому будет развёрнут сайт. Этот параметр необходимо задать, если вы планируете развернуть свой сайт по подпути, например, для страниц GitHub. Если вы планируете развернуть свой сайт на `https://foo.github.io/bar/`, то вам следует установить base на `'/bar/'`. Он всегда должен начинаться и заканчиваться косой чертой.

Параметр `base` автоматически добавляется ко всем URL, которые начинаются с `/` в других опциях, поэтому вам нужно указать его только один раз.

```ts
export default {
  base: '/base/'
}
```

## Маршрутизация {#routing}

### cleanUrls {#cleanurls}

- Тип: `boolean`
- По умолчанию: `false`

Если установить значение `true`, VitePress будет удалять из URL-адресов завершающий `.html`. Также смотрите [Создание чистого URL-адреса](../guide/routing#generating-clean-url).

::: warning Требуется поддержка сервера
Для включения этой функции может потребоваться дополнительная настройка на вашей хостинговой платформе. Чтобы это сработало, ваш сервер должен быть способен обслуживать `/foo.html` при посещении `/foo` **без редиректа**.
:::

### rewrites {#rewrites}

- Тип: `Record<string, string>`

Определяет сопоставление пользовательских каталогов с URL-адресами. Дополнительную информацию см. в секции [Маршрутизация: перезапись маршрутов](../guide/routing#route-rewrites).

```ts
export default {
  rewrites: {
    'source/:page': 'destination/:page'
  }
}
```

## Сборка {#build}

### srcDir {#srcdir}

- Тип: `string`
- По умолчанию: `.`

Каталог, в котором хранятся ваши страницы в формате Markdown, относительно корня проекта. Также смотрите [Корневая директория и директория с исходными файлами](../guide/routing#root-and-source-directory).

```ts
export default {
  srcDir: './src'
}
```

### srcExclude {#srcexclude}

- Тип: `string[]`
- По умолчанию: `undefined`

[Шаблон](https://github.com/mrmlnc/fast-glob#pattern-syntax) для поиска файлов, которые должны быть исключены из исходного содержимого.

```ts
export default {
  srcExclude: ['**/README.md', '**/TODO.md']
}
```

### outDir {#outdir}

- Тип: `string`
- По умолчанию: `./.vitepress/dist`

Расположение вывода сборки для сайта, относительно [корня проекта](../guide/routing#root-and-source-directory).

```ts
export default {
  outDir: '../public'
}
```

### assetsDir {#assetsdir}

- Тип: `string`
- По умолчанию: `assets`

Укажите каталог, в котором будут храниться сгенерированные ресурсы. Путь должен находиться внутри [`outDir`](#outdir) и разрешается относительно него.

```ts
export default {
  assetsDir: 'static'
}
```

### cacheDir {#cachedir}

- Тип: `string`
- По умолчанию: `./.vitepress/cache`

Каталог для файлов кэша, относительно [корня проекта](../guide/routing#root-and-source-directory). См. также: [cacheDir](https://vitejs.dev/config/shared-options.html#cachedir).

```ts
export default {
  cacheDir: './.vitepress/.vite'
}
```

### ignoreDeadLinks {#ignoredeadlinks}

- Тип: `boolean | 'localhostLinks' | (string | RegExp | ((link: string) => boolean))[]`
- По умолчанию: `false`

Если установлено значение `true`, VitePress не будет завершать сборку из-за неработающих ссылок.

Если установить значение `'localhostLinks'`, сборка будет завершаться при наличии неработающих ссылок, но не будет проверять ссылки `localhost`.

```ts
export default {
  ignoreDeadLinks: true
}
```

Это также может быть массив точных строк url, шаблонов regex или пользовательских функций фильтрации.

```ts
export default {
  ignoreDeadLinks: [
    // игнорировать url "/playground"
    '/playground',
    // игнорировать все ссылки на localhost
    /^https?:\/\/localhost/,
    // игнорировать все ссылки, включающие "/repl/""
    /\/repl\//,
    // пользовательская функция, игнорирует все ссылки, включающие "ignore"
    (url) => {
      return url.toLowerCase().includes('ignore')
    }
  ]
}
```

### metaChunk <Badge type="warning" text="экспериментально" /> {#metachunk}

- Тип: `boolean`
- По умолчанию: `false`

Если установлено значение `true`, метаданные страницы извлекаются в отдельный фрагмент JavaScript, а не вставляются в исходный HTML. Это уменьшает полезную нагрузку HTML каждой страницы и делает метаданные страниц кэшируемыми, что позволяет снизить пропускную способность сервера при наличии большого количества страниц на сайте.

### mpa <Badge type="warning" text="экспериментально" /> {#mpa}

- Тип: `boolean`
- По умолчанию: `false`

Если установлено значение `true`, производственное приложение будет создано в [режиме MPA](../guide/mpa-mode). В режиме MPA по умолчанию используется 0 КБ JavaScript, что приводит к отключению навигации на стороне клиента и требует явного согласия на интерактивность.

## Тема {#theming}

### appearance {#appearance}

- Тип: `boolean | 'dark' | 'force-dark' | 'force-auto' | import('@vueuse/core').UseDarkOptions`
- По умолчанию: `true`

Включать ли тёмный режим (путём добавления класса `.dark` к элементу `<html>`).

- Если опция имеет значение `true`, тема по умолчанию будет определяться цветовой гаммой, предпочитаемой пользователем.
- Если опция имеет значение `dark`, тема по умолчанию будет тёмной, если пользователь не переключит её вручную.
- Если установить значение `false`, пользователи не смогут переключать тему.
- Если для опции установлено значение `force-dark`, тема всегда будет темной, и пользователи не смогут её переключать.
- Если для опции установлено значение `force-auto`, тема всегда будет определяться предпочитаемой пользователем цветовой схемой, и пользователи не смогут её переключать.

Эта опция вставляет встроенный скрипт, который восстанавливает настройки пользователей из локального хранилища с помощью ключа `vitepress-theme-appearance`. Это гарантирует, что класс `.dark` будет применён до отрисовки страницы, чтобы избежать мерцания.

`appearance.initialValue` может быть только `'dark' | undefined`. Ссылки или геттеры не поддерживаются.

### lastUpdated {#lastupdated}

- Тип: `boolean`
- По умолчанию: `false`

Получать ли временную метку последнего обновления для каждой страницы с помощью Git. Временная метка будет включена в данные каждой страницы, доступные через [`useData`](./runtime-api#usedata).

При использовании темы по умолчанию включение этой опции приведёт к отображению времени последнего обновления каждой страницы. Вы можете настроить текст с помощью опции [`themeConfig.lastUpdatedText`](./default-theme-config#lastupdatedtext).

## Кастомизация {#customization}

### markdown {#markdown}

- Тип: `MarkdownOption`

Настройте параметры парсера Markdown. VitePress использует [Markdown-it](https://github.com/markdown-it/markdown-it) в качестве парсера и [Shiki](https://github.com/shikijs/shiki) для подсветки синтаксиса языка. Внутри этой опции вы можете передать различные параметры, связанные с Markdown, в соответствии с вашими потребностями.

```js
export default {
  markdown: {...}
}
```

Проверьте [объявление типа и jsdocs](https://github.com/vuejs/vitepress/blob/main/src/node/markdown/markdown.ts) на наличие всех доступных опций.

### vite {#vite}

- Тип: `import('vite').UserConfig`

Передаёт необработанную [конфигурацию Vite](https://vitejs.dev/config/) внутреннему серверу разработки / сборщику Vite.

```js
export default {
  vite: {
    // параметры конфигурации Vite
  }
}
```

### vue {#vue}

- Тип: `import('@vitejs/plugin-vue').Options`

Передаёт необработанные [параметры `@vitejs/plugin-vue`](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue#options) внутреннему экземпляру плагина.

```js
export default {
  vue: {
    // параметры @vitejs/plugin-vue
  }
}
```

## Хуки сборки {#build-hooks}

Хуки для сборки VitePress позволяют добавлять на сайт новую функциональность и поведение:

- Карта сайта
- Поисковая индексация
- PWA
- Телепорты

### buildEnd {#buildend}

- Тип: `(siteConfig: SiteConfig) => Awaitable<void>`

`buildEnd` — это хук CLI сборки, который будет запущен после завершения сборки (SSG), но до выхода из процесса VitePress CLI.

```ts
export default {
  async buildEnd(siteConfig) {
    // ...
  }
}
```

### postRender {#postrender}

- Тип: `(context: SSGContext) => Awaitable<SSGContext | void>`

`postRender` — это хук сборки, вызываемый после завершения рендеринга SSG. Это позволит вам обрабатывать содержимое телепортов во время SSG.

```ts
export default {
  async postRender(context) {
    // ...
  }
}
```

```ts
interface SSGContext {
  content: string
  teleports?: Record<string, string>
  [key: string]: any
}
```

### transformHead {#transformhead}

- Тип: `(context: TransformContext) => Awaitable<HeadConfig[]>`

`transformHead` — это хук сборки для преобразования заголовка перед генерацией каждой страницы. Это позволит вам добавить в конфигурацию VitePress записи, которые не могут быть добавлены статически. Вам нужно только вернуть дополнительные записи, они будут автоматически объединены с существующими.

::: warning ПРЕДУПРЕЖДЕНИЕ
Не мутируйте ничего внутри `context`.
:::

```ts
export default {
  async transformHead(context) {
    // ...
  }
}
```

```ts
interface TransformContext {
  page: string // например, index.md (относительно srcDir)
  assets: string[] // все ресурсы, не относящиеся к js/css, в виде полностью разрешённых публичных URL-адресов
  siteConfig: SiteConfig
  siteData: SiteData
  pageData: PageData
  title: string
  description: string
  head: HeadConfig[]
  content: string
}
```

Обратите внимание, что этот хук вызывается только при статической генерации сайта. Он не вызывается во время разработки. Если вам нужно добавить динамические записи в голову во время разработки, вместо этого вы можете использовать хук [`transformPageData`](#transformpagedata):

```ts
export default {
  transformPageData(pageData) {
    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push([
      'meta',
      {
        name: 'og:title',
        content:
          pageData.frontmatter.layout === 'home'
            ? `VitePress`
            : `${pageData.title} | VitePress`
      }
    ])
  }
}
```

#### Пример: Добавление канонического URL-адреса `<link>` {#example-adding-a-canonical-url-link}

```ts
export default {
  transformPageData(pageData) {
    const canonicalUrl = `https://example.com/${pageData.relativePath}`
      .replace(/index\.md$/, '')
      .replace(/\.md$/, '.html')

    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push([
      'link',
      { rel: 'canonical', href: canonicalUrl }
    ])
  }
}
```

### transformHtml {#transformhtml}

- Тип: `(code: string, id: string, context: TransformContext) => Awaitable<string | void>`

`transformHtml` — это хук сборки для преобразования содержимого каждой страницы перед сохранением на диск.

::: warning ПРЕДУПРЕЖДЕНИЕ
Не мутируйте ничего внутри `контекста`. Кроме того, изменение html-содержимого может вызвать проблемы с гидратацией во время выполнения.
:::

```ts
export default {
  async transformHtml(code, id, context) {
    // ...
  }
}
```

### transformPageData {#transformpagedata}

- Тип: `(pageData: PageData, context: TransformPageContext) => Awaitable<Partial<PageData> | { [key: string]: any } | void>`

`transformPageData` — это хук для преобразования `pageData` каждой страницы. Вы можете напрямую изменять `pageData` или возвращать изменённые значения, которые будут объединены с данными страницы.

::: warning ПРЕДУПРЕЖДЕНИЕ
Не мутируйте ничего внутри `context` и будьте осторожны, это может повлиять на производительность dev-сервера, особенно если у вас есть некоторые сетевые запросы или тяжёлые вычисления (например, генерация изображений) в хуке. Вы можете проверить `process.env.NODE_ENV === 'production'` для условной логики.
:::

```ts
export default {
  async transformPageData(pageData, { siteConfig }) {
    pageData.contributors = await getPageContributors(pageData.relativePath)
  }

  // или возвращаем данные для объединения
  async transformPageData(pageData, { siteConfig }) {
    return {
      contributors: await getPageContributors(pageData.relativePath)
    }
  }
}
```

```ts
interface TransformPageContext {
  siteConfig: SiteConfig
}
```
