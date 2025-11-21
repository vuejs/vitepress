# Runtime API {#runtime-api}

VitePress предлагает несколько встроенных API, позволяющих получить доступ к данным приложения. VitePress также поставляется с несколькими встроенными компонентами, которые можно использовать глобально.

Вспомогательные методы глобально импортируются из `vitepress` и обычно используются в компонентах Vue для пользовательских тем. Однако их можно использовать и внутри страниц `.md`, так как файлы markdown компилируются в [однофайловые компоненты](https://ru.vuejs.org/guide/scaling-up/sfc.html) Vue.

Методы, начинающиеся с `use*`, указывают на то, что это функция [Vue 3 Composition API](https://ru.vuejs.org/guide/introduction.html#composition-api) («композабл»), которая может быть использована только внутри `setup()` или `<script setup>`.

## `useData` <Badge type="info" text="композабл" /> {#usedata}

Возвращает данные, относящиеся к конкретной странице. Возвращаемый объект имеет следующий тип:

```ts
interface VitePressData<T = any> {
  /**
   * Метаданные на уровне сайта
   */
  site: Ref<SiteData<T>>
  /**
   * themeConfig from .vitepress/config.js
   */
  theme: Ref<T>
  /**
   * Метаданные на уровне страницы
   */
  page: Ref<PageData>
  /**
   * Метаданные страницы
   */
  frontmatter: Ref<PageData['frontmatter']>
  /**
   * Параметры динамического маршрута
   */
  params: Ref<PageData['params']>
  title: Ref<string>
  description: Ref<string>
  lang: Ref<string>
  isDark: Ref<boolean>
  dir: Ref<string>
  localeIndex: Ref<string>
}

interface PageData {
  title: string
  titleTemplate?: string | boolean
  description: string
  relativePath: string
  filePath: string
  headers: Header[]
  frontmatter: Record<string, any>
  params?: Record<string, any>
  isNotFound?: boolean
  lastUpdated?: number
}
```

**Пример:**

```vue
<script setup>
import { useData } from 'vitepress'

const { theme } = useData()
</script>

<template>
  <h1>{{ theme.footer.copyright }}</h1>
</template>
```

## `useRoute` <Badge type="info" text="композабл" /> {#useroute}

Возвращает текущий объект маршрута со следующим типом:

```ts
interface Route {
  path: string
  data: PageData
  component: Component | null
}
```

## `useRouter` <Badge type="info" text="композабл" /> {#userouter}

Возвращает экземпляр маршрутизатора VitePress, чтобы вы могли программно перейти на другую страницу.

```ts
interface Router {
  /**
   * Текущий маршрут.
   */
  route: Route
  /**
   * Переход к новому URL-адресу.
   */
  go: (to?: string) => Promise<void>
  /**
   * Вызывается перед изменением маршрута. Верните `false`, чтобы отменить навигацию.
   */
  onBeforeRouteChange?: (to: string) => Awaitable<void | boolean>
  /**
   * Вызывается перед загрузкой компонента страницы (после того, как состояние истории
   * обновлено). Верните `false`, чтобы отменить навигацию.
   */
  onBeforePageLoad?: (to: string) => Awaitable<void | boolean>
  /**
   * Вызывается после изменения маршрута.
   */
  onAfterRouteChange?: (to: string) => Awaitable<void>
}
```

## `withBase` <Badge type="info" text="хелпер" /> {#withbase}

- **Тип**: `(path: string) => string`

Добавляет настроенный [`base`](./site-config#base) к заданному URL-пути. Также смотрите секцию [Базовый URL](../guide/asset-handling#base-url).

## `<Content />` <Badge type="info" text="компонент" /> {#content}

Компонент `<Content />` отображает отрисованное содержимое Markdown. Полезно [при создании собственной темы](../guide/custom-theme).

```vue
<template>
  <h1>Пользовательский макет!</h1>
  <Content />
</template>
```

## `<ClientOnly />` <Badge type="info" text="компонент" /> {#clientonly}

Компонент `<ClientOnly />` отображает свой слот только на стороне клиента.

Поскольку приложения VitePress при генерации статических сборок рендерятся в Node.js, любое использование Vue должно соответствовать универсальным требованиям к коду. Короче говоря, убедитесь, что доступ к API Browser / DOM осуществляется только в хуках `beforeMount` или `mounted`.

Если вы используете или демонстрируете компоненты, которые не являются SSR-дружественными (например, содержат пользовательские директивы), вы можете обернуть их внутри компонента `ClientOnly`.

```vue-html
<ClientOnly>
  <NonSSRFriendlyComponent />
</ClientOnly>
```

- См. также: [Совместимость с SSR](../guide/ssr-compat)

## `$frontmatter` <Badge type="info" text="глобальный шаблон" /> {#frontmatter}

Прямой доступ к [метаданным](../guide/frontmatter) текущей страницы в выражениях Vue.

```md
---
title: Привет
---

# {{ $frontmatter.title }}
```

## `$params` <Badge type="info" text="глобальный шаблон" /> {#params}

Прямой доступ к параметрам [динамических маршрутов](../guide/routing#dynamic-routes) текущей страницы в выражениях Vue.

```md
- имя пакета: {{ $params.pkg }}
- версия: {{ $params.version }}
```
