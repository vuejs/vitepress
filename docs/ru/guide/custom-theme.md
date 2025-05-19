# Пользовательская тема {#using-a-custom-theme}

## Разрешение темы {#theme-resolving}

Вы можете включить пользовательскую тему, создав файл `.vitepress/theme/index.js` или `.vitepress/theme/index.ts` («файл входа темы»):

```
.
├─ docs                # корень проекта
│  ├─ .vitepress
│  │  ├─ theme
│  │  │  └─ index.js   # файл входа темы
│  │  └─ config.js     # файл конфигурации
│  └─ index.md
└─ package.json
```

VitePress всегда будет использовать пользовательскую тему вместо темы по умолчанию, если обнаружит наличие входного файла темы. Однако вы можете [расширить тему по умолчанию](./extending-default-theme), чтобы выполнить расширенные настройки поверх нее.

## Интерфейс темы {#theme-interface}

Пользовательская тема VitePress определяется как объект со следующим интерфейсом:

```ts
interface Theme {
  /**
   * Корневой компонент макета для каждой страницы
   * @required
   */
  Layout: Component
  /**
   * Улучшение экземпляра приложения Vue
   * @optional
   */
  enhanceApp?: (ctx: EnhanceAppContext) => Awaitable<void>
  /**
   * Расширяем другую тему, вызывая её `enhanceApp` перед нашей
   * @optional
   */
  extends?: Theme
}

interface EnhanceAppContext {
  app: App // Экземпляр приложения Vue
  router: Router // Экземпляр маршрутизатора VitePress
  siteData: Ref<SiteData> // Метаданные на уровне сайта
}
```

Файл входа темы должен экспортировать тему по умолчанию:

```js [.vitepress/theme/index.js]

// Вы можете напрямую импортировать файлы Vue в файле входа темы.
// VitePress предварительно настроен с помощью @vitejs/plugin-vue.
import Layout from './Layout.vue'

export default {
  Layout,
  enhanceApp({ app, router, siteData }) {
    // ...
  }
}
```

Экспорт по умолчанию является единственным контрактом для пользовательской темы, и только свойство `Layout` является обязательным. Таким образом, технически тема VitePress может быть простой, как один компонент Vue.

Внутри компонент макета работает так же, как и обычное приложение Vite + Vue 3. Обратите внимание, что тема также должна быть [SSR-совместимой](./ssr-compat).

## Создание макета {#building-a-layout}

Самый базовый компонент макета должен содержать компонент [`<Content />`](../reference/runtime-api#content):

```vue [.vitepress/theme/Layout.vue]
<template>
  <h1>Пользовательский макет!</h1>

  <!-- здесь будет отображаться содержимое в формате Markdown -->
  <Content />
</template>
```

Приведённая выше схема просто отображает разметку каждой страницы в виде HTML. Добавим обработку 404 ошибки в качестве первого улучшения:

```vue{1-4,9-12}
<script setup>
import { useData } from 'vitepress'
const { page } = useData()
</script>

<template>
  <h1>Пользовательский макет!</h1>

  <div v-if="page.isNotFound">
    Пользовательская страница 404!
  </div>
  <Content v-else />
</template>
```

Хелпер [`useData()`](../reference/runtime-api#usedata) предоставляет нам все данные во время выполнения, необходимые для условной отрисовки различных макетов. Среди различных данных, к которым мы можем получить доступ, являются метаданные текущей страницы. Мы можем использовать это, чтобы позволить конечному пользователю управлять макетом на каждой странице. Например, пользователь может указать, что страница должна использовать специальный макет главной страницы:

```md
---
layout: home
---
```

И мы можем настроить нашу тему, чтобы справиться с этим:

```vue{3,12-14}
<script setup>
import { useData } from 'vitepress'
const { page, frontmatter } = useData()
</script>

<template>
  <h1>Пользовательский макет!</h1>

  <div v-if="page.isNotFound">
    Пользовательская страница 404!
  </div>
  <div v-if="frontmatter.layout === 'home'">
    Пользовательская домашняя страница!
  </div>
  <Content v-else />
</template>
```

Конечно, вы можете разделить макет на большее количество компонентов:

```vue{3-5,12-15}
<script setup>
import { useData } from 'vitepress'
import NotFound from './NotFound.vue'
import Home from './Home.vue'
import Page from './Page.vue'

const { page, frontmatter } = useData()
</script>

<template>
  <h1>Пользовательский макет!</h1>

  <NotFound v-if="page.isNotFound" />
  <Home v-if="frontmatter.layout === 'home'" />
  <Page v-else /> <!-- <Page /> рендерит <Content /> -->
</template>
```

Обратитесь к [Справочнику Runtime API](../reference/runtime-api), чтобы узнать обо всём, что доступно в компонентах темы. Кроме того, вы можете использовать [загрузку данных в режиме реального времени](./data-loading) для создания макета, управляемого данными — например, страницы со списком всех записей в блоге текущего проекта.

## Распространение пользовательской темы {#distributing-a-custom-theme}

Самый простой способ распространить пользовательскую тему — предоставить её в виде [репозитория шаблонов на GitHub](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository).

Если вы хотите распространить тему в виде пакета npm, выполните следующие действия:

1. Экспортируйте объект темы в качестве экспорта по умолчанию в записи пакета.

2. Если есть возможность, экспортируйте определение типа конфигурации темы как `ThemeConfig`.

3. Если ваша тема требует настройки конфигурации VitePress, экспортируйте эту конфигурацию в подпапку пакета (например. `my-theme/config`), чтобы пользователь мог расширить её.

4. Документируйте параметры конфигурации темы (как через файл конфигурации, так и через метаданные).

5. Предоставьте чёткие инструкции по использованию вашей темы (см. ниже).

## Использование пользовательской темы {#consuming-a-custom-theme}

Чтобы использовать внешнюю тему, импортируйте и реэкспортируйте её из элемента пользовательской темы:

```js [.vitepress/theme/index.js]
import Theme from 'awesome-vitepress-theme'

export default Theme
```

Если тема требует расширения:

```js [.vitepress/theme/index.js]
import Theme from 'awesome-vitepress-theme'

export default {
  extends: Theme,
  enhanceApp(ctx) {
    // ...
  }
}
```

Если тема требует специальных настроек VitePress, вам нужно будет также расширить их в своем собственном конфиге:

```ts [.vitepress/config.ts]
import baseConfig from 'awesome-vitepress-theme/config'

export default {
  // расширить базовый конфиг темы (если необходимо)
  extends: baseConfig
}
```

Наконец, если тема предоставляет типы для своего конфига темы:

```ts [.vitepress/config.ts]
import baseConfig from 'awesome-vitepress-theme/config'
import { defineConfigWithTheme } from 'vitepress'
import type { ThemeConfig } from 'awesome-vitepress-theme'

export default defineConfigWithTheme<ThemeConfig>({
  extends: baseConfig,
  themeConfig: {
    // Тип `ThemeConfig`
  }
})
```
