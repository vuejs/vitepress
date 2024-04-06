# Сайдбар {#sidebar}

Сайдбар (боковая панель) — основной навигационный блок вашей документации. Меню боковой панели можно настроить в секции [`themeConfig.sidebar`](./default-theme-config#sidebar).

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Руководство',
        items: [
          { text: 'Введение', link: '/ru/introduction' },
          { text: 'Первые шаги', link: '/ru/getting-started' },
          ...
        ]
      }
    ]
  }
}
```

## Основы {#the-basics}

Простейшая форма сайдбара — это передача массива ссылок. Элемент первого уровня определяет «секцию» сайдбара. Он должен содержать `text`, который является заголовком секции, и `items`, которые являются фактическими навигационными ссылками.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Заголовок секции A',
        items: [
          { text: 'Пункт A', link: '/item-a' },
          { text: 'Пункт B', link: '/item-b' },
          ...
        ]
      },
      {
        text: 'Заголовок секции B',
        items: [
          { text: 'Пункт C', link: '/item-c' },
          { text: 'Пункт D', link: '/item-d' },
          ...
        ]
      }
    ]
  }
}
```

Каждый элемент `link` должен указывать путь к фактическому файлу, начинающийся с `/`. Если добавить в конец ссылки косую черту, то будет показан `index.md` соответствующего каталога.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Руководство',
        items: [
          // Ссылка на страницу `/ru/guide/index.md`
          { text: 'Введение', link: '/ru/guide/' }
        ]
      }
    ]
  }
}
```

Вы можете вложить элементы боковой панели на 6 уровней вглубь, считая от корневого уровня. Обратите внимание, что более 6 уровней вложенных элементов будут игнорироваться и не отображаться на боковой панели.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Уровень 1',
        items: [
          {
            text: 'Уровень 2',
            items: [
              {
                text: 'Уровень 3',
                items: [
                  ...
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

## Несколько сайдбаров {#multiple-sidebars}

Вы можете показывать разные боковые панели в зависимости от текущего маршрута. Например, как показано на этом сайте, вы можете создать в документации отдельные разделы, например, «Руководство» и «Настройка».

Для этого сначала организуйте страницы в каталоги для каждого нужного раздела:

```
.
├─ guide/
│  ├─ index.md
│  ├─ one.md
│  └─ two.md
└─ config/
   ├─ index.md
   ├─ three.md
   └─ four.md
```

Затем обновите конфигурацию, чтобы определить боковую панель для каждого раздела. На этот раз вместо массива нужно передать объект.

```js
export default {
  themeConfig: {
    sidebar: {
      // Эта боковая панель отображается, когда пользователь находится в директории `guide`
      '/guide/': [
        {
          text: 'Руководство',
          items: [
            { text: 'Index', link: '/guide/' },
            { text: 'One', link: '/guide/one' },
            { text: 'Two', link: '/guide/two' }
          ]
        }
      ],

      // Эта боковая панель отображается, когда пользователь находится в директории `config`
      '/config/': [
        {
          text: 'Настройка',
          items: [
            { text: 'Index', link: '/config/' },
            { text: 'Three', link: '/config/three' },
            { text: 'Four', link: '/config/four' }
          ]
        }
      ]
    }
  }
}
```

## Сворачиваемые группы {#collapsible-sidebar-groups}

Добавив опцию `collapsed` внутри группы `sidebar`, вы увидите кнопку переключения для скрытия/показа каждой секции.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Заголовок секции A',
        collapsed: false,
        items: [...]
      }
    ]
  }
}
```

Все секции «развёрнуты» по умолчанию. Если вы хотите, чтобы они были «свёрнуты» при первоначальной загрузке страницы, установите для опции `collapsed` значение `true`.

```js
export default {
  themeConfig: {
    sidebar: [
      {
        text: 'Заголовок секции A',
        collapsed: true,
        items: [...]
      }
    ]
  }
}
```

## `useSidebar` <Badge type="info" text="композабл" /> {#usesidebar}

Возвращает данные, связанные с сайдбаром. Возвращаемый объект имеет следующий тип:

```ts
export interface DocSidebar {
  isOpen: Ref<boolean>
  sidebar: ComputedRef<DefaultTheme.SidebarItem[]>
  sidebarGroups: ComputedRef<DefaultTheme.SidebarItem[]>
  hasSidebar: ComputedRef<boolean>
  hasAside: ComputedRef<boolean>
  leftAside: ComputedRef<boolean>
  isSidebarEnabled: ComputedRef<boolean>
  open: () => void
  close: () => void
  toggle: () => void
}
```

**Пример:**

```vue
<script setup>
import { useSidebar } from 'vitepress/theme'

const { hasSidebar } = useSidebar()
</script>

<template>
  <div v-if="hasSidebar">Показывать только при наличии сайдбара</div>
</template>
```
