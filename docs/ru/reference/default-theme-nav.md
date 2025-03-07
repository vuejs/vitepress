# Навигация {#nav}

Ключ `nav` в конфигурации — это панель навигации, отображаемая в верхней части страницы. Она содержит заголовок сайта, ссылки глобального меню и т. д.

## Название и логотип сайта {#site-title-and-logo}

По умолчанию навигация отображает название сайта, ссылаясь на значение [`config.title`](./site-config#title). Если вы хотите изменить то, что отображается в панели навигации, задайте пользовательский текст в опции `themeConfig.siteTitle`.

```js
export default {
  themeConfig: {
    siteTitle: 'Мой заголовок'
  }
}
```

Если у вас есть логотип для вашего сайта, вы можете отобразить его, передав путь к изображению. Вы должны поместить логотип непосредственно в директорию `public` и указать абсолютный путь к нему.

```js
export default {
  themeConfig: {
    logo: '/my-logo.svg'
  }
}
```

При добавлении логотипа он отображается вместе с названием сайта. Если вам нужен только логотип и вы хотите скрыть текст заголовка сайта, установите `false` для параметра `SiteTitle`.

```js
export default {
  themeConfig: {
    logo: '/my-logo.svg',
    siteTitle: false
  }
}
```

Вы также можете передать объект в качестве логотипа, если хотите добавить атрибут `alt` или настроить его в зависимости от тёмного/светлого режима. Подробности смотрите в [`themeConfig.logo`](./default-theme-config#logo).

## Навигационные ссылки {#navigation-links}

Вы можете определить опцию `themeConfig.nav`, чтобы добавить ссылки в панель навигации:

```js
export default {
  themeConfig: {
    nav: [
      { text: 'Руководство', link: '/guide' },
      { text: 'Настройка', link: '/config' },
      { text: 'Изменения', link: 'https://github.com/...' }
    ]
  }
}
```

`text` — это текст, отображаемый в навигации, а `link` — это ссылка, на которую будет осуществлён переход при нажатии на текст. Для ссылки задайте путь к фактическому файлу без префикса `.md` и всегда начинайте с `/`.

Навигационные ссылки также могут быть выпадающими меню. Для этого установите ключ `items` вместо ключа `link`:

```js
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

Обратите внимание, что заголовок выпадающего меню (`Выпадающее меню` в примере выше) не может иметь свойство `link`, так как он становится кнопкой для открытия выпадающего диалога.

Вы можете добавить «секции» в пункты выпадающего меню, передавая больше вложенных элементов:

```js
export default {
  themeConfig: {
    nav: [
      { text: 'Руководство', link: '/guide' },
      {
        text: 'Выпадающее меню',
        items: [
          {
            // Заголовок секции
            text: 'Секция A',
            items: [
              { text: 'Пункт A в секции A', link: '...' },
              { text: 'Пункт B в секции A', link: '...' }
            ]
          }
        ]
      },
      {
        text: 'Выпадающее меню',
        items: [
          {
            // Заголовок можно опустить
            items: [
              { text: 'Пункт A в секции A', link: '...' },
              { text: 'Пункт B в секции A', link: '...' }
            ]
          }
        ]
      }
    ]
  }
}
```

### Настройка «активного» состояния ссылки {#customize-link-s-active-state}

Пункты меню навигации будут выделены, если текущая страница находится под соответствующим путём. Если вы хотите настроить сопоставление путей, определите свойство `activeMatch` и регулярное выражение в качестве строкового значения.

```js
export default {
  themeConfig: {
    nav: [
      // Эта ссылка получает активное состояние, когда пользователь
      // переходит по пути `/config/`.
      {
        text: 'Руководство',
        link: '/guide',
        activeMatch: '/config/'
      }
    ]
  }
}
```

::: warning ПРЕДУПРЕЖДЕНИЕ
Ожидается, что `activeMatch` будет регулярным выражением, но вы должны определить его как строку. Мы не можем использовать здесь реальный объект RegExp, потому что он не сериализуется во время сборки.
:::

### Настройка атрибутов «target» и «rel» {#customize-link-s-target-and-rel-attributes}

По умолчанию VitePress автоматически определяет атрибуты `target` и `rel` в зависимости от того, является ли ссылка внешней. Но при желании их можно настроить и вручную.

```js
export default {
  themeConfig: {
    nav: [
      {
        text: 'Товары',
        link: 'https://www.thegithubshop.com/',
        target: '_self',
        rel: 'sponsored'
      }
    ]
  }
}
```

## Социальные ссылки {#social-links}

См. [`socialLinks`](./default-theme-config#sociallinks).

## Пользовательские компоненты

Вы можете добавить пользовательские компоненты в панель навигации с помощью опции `component`. Ключ `component` должен быть именем компонента Vue и должен быть зарегистрирован глобально с помощью [Theme.enhanceApp](../guide/custom-theme#theme-interface).

```js [.vitepress/config.js]
export default {
  themeConfig: {
    nav: [
      {
        text: 'Мое меню',
        items: [
          {
            component: 'MyCustomComponent',
            // Необязательные параметры для передачи компоненту
            props: {
              title: 'Мой пользовательский компонент'
            }
          }
        ]
      },
      {
        component: 'AnotherCustomComponent'
      }
    ]
  }
}
```

Затем необходимо зарегистрировать компонент глобально:

```js [.vitepress/theme/index.js]
import DefaultTheme from 'vitepress/theme'

import MyCustomComponent from './components/MyCustomComponent.vue'
import AnotherCustomComponent from './components/AnotherCustomComponent.vue'

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('MyCustomComponent', MyCustomComponent)
    app.component('AnotherCustomComponent', AnotherCustomComponent)
  }
}
```

Ваш компонент будет отображаться на панели навигации. VitePress предоставляет следующие дополнительные параметры компонента:

- `screenMenu`: необязательное булево значение, указывающее, находится ли компонент внутри мобильного навигационного меню

Пример можно посмотреть в тестах e2e [здесь](https://github.com/vuejs/vitepress/tree/main/__tests__/e2e/.vitepress).
