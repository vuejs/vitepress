---
description: Настройте и расширьте тему VitePress по умолчанию с помощью пользовательских CSS, компонентов, макетов и слотов.
outline: deep
---

# Расширение темы по умолчанию {#extending-the-default-theme}

Тема VitePress по умолчанию оптимизирована для документации и может быть настроена по вашему усмотрению. Полный список опций можно найти в главе [Настройки темы по умолчанию](../reference/default-theme-config).

Однако есть ряд случаев, когда одной лишь конфигурации будет недостаточно. Например:

1. Вам нужно изменить стили CSS;
2. Вам нужно изменить экземпляр приложения Vue, например, чтобы зарегистрировать глобальные компоненты;
3. Вам нужно внедрить пользовательский контент в тему через слоты макета.

Эти расширенные настройки потребуют использования пользовательской темы, которая «расширяет» тему по умолчанию.

::: tip СОВЕТ
Прежде чем приступить к работе, обязательно прочитайте главу [Пользовательская тема](./custom-theme), чтобы понять, как работают пользовательские темы.
:::

## Настройка CSS {#customizing-css}

CSS темы по умолчанию можно настроить, переопределив переменные CSS корневого уровня:

```js [.vitepress/theme/index.js]
import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default DefaultTheme
```

```css
/* .vitepress/theme/custom.css */
:root {
  --vp-c-brand-1: #646cff;
  --vp-c-brand-2: #747bff;
}
```

См. [переменные CSS темы по умолчанию](https://github.com/vuejs/vitepress/blob/main/src/client/theme-default/styles/vars.css), которые можно переопределить.

### Навбар {#navbar}

Навбар отрисовывает единую поверхность фона, управляемую CSS-переменными, поэтому его вид можно изменить, не затрагивая внутреннюю реализацию компонента:

```css
:root {
  /* высота бара и фон */
  --vp-nav-height: 4rem;
  --vp-nav-bg-color: var(--vp-c-bg);

  /* фон, когда находимся поверх главной страницы (без прокрутки);
     установите var(--vp-nav-bg-color), чтобы отказаться от прозрачного оформления */
  --vp-nav-home-bg-color: transparent;

  /* фильтр, применяемый к контенту за баром */
  --vp-nav-backdrop-filter: none;

  /* нижняя линия бара и фон мобильного меню */
  --vp-nav-divider-color: var(--vp-c-gutter);
  --vp-nav-screen-bg-color: var(--vp-c-bg);
}
```

Например, навбар в стиле матового стекла:

```css
:root {
  --vp-nav-bg-color: color-mix(in srgb, var(--vp-c-bg) 65%, transparent);
  --vp-nav-backdrop-filter: saturate(180%) blur(8px);
}
```

Та же обработка распространяется и на локальную навигацию: `--vp-local-nav-bg-color` по умолчанию следует за цветом поверхности навбара, и там, где два бара соприкасаются, они разделяют единую размытую поверхность, так что стекло остаётся непрерывным между ними.

::: warning
`backdrop-filter` заметно влияет на производительность прокрутки, особенно на больших или High-DPI экранах. При использовании полупрозрачного бара также проверьте контрастность текста поверх содержимого страницы. Safari 17 и более ранние версии не применяют управляемые переменными backdrop-фильтры, поэтому показывают полупрозрачный цвет без размытия.
:::

Когда элементы навигации не помещаются в доступную ширину, они перемещаются в меню `⋯` в конце навбара вместо того, чтобы обрезаться, начиная с ссылок на соцсети, переключателя внешнего вида и переключателя локали, за которыми следуют элементы навигации справа налево. Подпись этой кнопки можно локализовать с помощью [`extraMenuLabel`](../reference/default-theme-config#extramenulabel).

## Использование различных шрифтов {#using-different-fonts}

VitePress использует [Inter](https://rsms.me/inter/) в качестве шрифта по умолчанию, и будет включать шрифты в вывод сборки. Шрифт также автоматически загружается в производство. Однако это может быть нежелательно, если вы хотите использовать другой основной шрифт.

Чтобы не включать Inter в вывод сборки, импортируйте тему из `vitepress/theme-without-fonts`:

```js [.vitepress/theme/index.js]
import DefaultTheme from 'vitepress/theme-without-fonts'
import './my-fonts.css'

export default DefaultTheme
```

```css
/* .vitepress/theme/my-fonts.css */
:root {
  --vp-font-family-base: /* normal text font */ --vp-font-family-mono:
    /* code font */;
}
```

::: warning ПРЕДУПРЕЖДЕНИЕ
Если вы используете дополнительные компоненты, такие как [Страница команды](../reference/default-theme-team-page), убедитесь, что они также импортированы из `vitepress/theme-without-fonts`!
:::

Если ваш шрифт — это локальный файл, на который ссылаются через `@font-face`, он будет обработан как ресурс и включён в каталог `.vitepress/dist/assets` с хэшированным именем файла. Чтобы предварительно загрузить этот файл, используйте хук сборки [transformHead](../reference/site-config#transformhead):

```js [.vitepress/config.js]
export default {
  transformHead({ assets }) {
    // настраиваем regex соответствующим образом, чтобы он соответствовал вашему шрифту
    const myFontFile = assets.find(file => /font-name\.[\w-]+\.woff2/.test(file))
    if (myFontFile) {
      return [
        [
          'link',
          {
            rel: 'preload',
            href: myFontFile,
            as: 'font',
            type: 'font/woff2',
            crossorigin: ''
          }
        ]
      ]
    }
  }
}
```

## Регистрация глобальных компонентов {#registering-global-components}

```js [.vitepress/theme/index.js]
import DefaultTheme from 'vitepress/theme'

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // регистрируем пользовательские глобальные компоненты
    app.component('MyGlobalComponent' /* ... */)
  }
}
```

Если вы используете TypeScript:

```ts [.vitepress/theme/index.ts]
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // регистрируем пользовательские глобальные компоненты
    app.component('MyGlobalComponent' /* ... */)
  }
} satisfies Theme
```

Поскольку мы используем Vite, можно применять [глобальную функцию импорта](https://vite-docs.ru/guide/features.html#glob-import) Vite для автоматической регистрации каталога компонентов.

## Слоты макета {#layout-slots}

Компонент `<Layout/>` темы по умолчанию имеет несколько слотов, которые можно использовать для вставки содержимого в определённые места страницы. Вот пример внедрения компонента перед оглавлением:

```js [.vitepress/theme/index.js]
import DefaultTheme from 'vitepress/theme'
import MyLayout from './MyLayout.vue'

export default {
  extends: DefaultTheme,
  // переопределяем макет с помощью компонента-обёртки,
  // который внедряет слоты
  Layout: MyLayout
}
```

```vue [.vitepress/theme/MyLayout.vue]
<script setup>
import DefaultTheme from 'vitepress/theme'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #aside-outline-before>
      Мой пользовательский контент в верхней части боковой панели
    </template>
  </Layout>
</template>
```

Также можно использовать функцию рендеринга.

```js [.vitepress/theme/index.js]
import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import MyComponent from './MyComponent.vue'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'aside-outline-before': () => h(MyComponent)
    })
  }
}
```

Полный список слотов, доступных в макете темы по умолчанию:

- Когда `layout: 'doc'` (по умолчанию) включен через метаданные:
  - `doc-top`
  - `doc-bottom`
  - `doc-footer-before`
  - `doc-before`
  - `doc-after`
  - `sidebar-nav-before`
  - `sidebar-nav-after`
  - `aside-top`
  - `aside-bottom`
  - `aside-outline-before`
  - `aside-outline-after`
  - `aside-ads-before`
  - `aside-ads-after`
- Когда `layout: 'home'` включен через метаданные:
  - `home-hero-before`
  - `home-hero-info-before`
  - `home-hero-info`
  - `home-hero-info-after`
  - `home-hero-actions-before-actions`
  - `home-hero-actions-after`
  - `home-hero-image`
  - `home-hero-after`
  - `home-features-before`
  - `home-features-after`
- Когда `layout: 'page'` включен через метаданные:
  - `page-top`
  - `page-bottom`
- На странице «Не найдено (404)»:
  - `not-found`
- Всегда:
  - `layout-top`
  - `layout-bottom`
  - `nav-bar-title-before`
  - `nav-bar-title-after`
  - `nav-bar-content-before`
  - `nav-bar-content-after`
  - `nav-screen-content-before`
  - `nav-screen-content-after`

## Использование View Transitions API {#using-view-transitions-api}

### Переключение внешнего вида {#on-appearance-toggle}

Вы можете расширить стандартную тему, чтобы обеспечить пользовательский переход при переключении цветового режима. Пример:

<<< @/components/AppearanceToggleTransition.vue [.vitepress/theme/Layout.vue]

Результат (**предупреждение!**: мигающие цвета, резкие движения, яркий свет):

<details>
<summary>Демонстрация</summary>

![Демонстрация переходов](/appearance-toggle-transition.webp)

</details>

Более подробно о переходах между представлениями читайте в [документации Chrome](https://developer.chrome.com/docs/web-platform/view-transitions/).

### Изменение маршрута {#on-route-change}

Скоро будет.

## Переопределение внутренних компонентов {#overriding-internal-components}

Вы можете использовать [псевдонимы](https://vite-docs.ru/config/shared-options.html#resolve-alias) Vite, чтобы заменить стандартные компоненты темы на свои собственные:

```ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitepress'

export default defineConfig({
  vite: {
    resolve: {
      alias: [
        {
          find: /^.*\/VPNavBar\.vue$/,
          replacement: fileURLToPath(
            new URL('./components/CustomNavBar.vue', import.meta.url)
          )
        }
      ]
    }
  }
})
```

Чтобы узнать точное название компонента, обратитесь к [нашему исходному коду](https://github.com/vuejs/vitepress/tree/main/src/client/theme-default/components). Поскольку компоненты являются внутренними, есть небольшая вероятность того, что их название будет обновлено между минорными выпусками.
