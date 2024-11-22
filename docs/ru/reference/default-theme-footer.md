# Футер {#footer}

VitePress будет отображать блок футера внизу страницы, если присутствует объект `themeConfig.footer`.

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
  // Сообщение, отображаемое прямо перед копирайтом.
  message?: string

  // Уведомление об авторских правах.
  copyright?: string
}
```

Приведённая выше конфигурация также поддерживает строки HTML. Так, например, если вы хотите разместить в футере несколько ссылок, можно настроить конфигурацию следующим образом:

```ts
export default {
  themeConfig: {
    footer: {
      message:
        'Опубликовано под <a href="https://github.com/vuejs/vitepress/blob/main/LICENSE">лицензией MIT</a>.',
      copyright:
        '© 2019 – настоящее время, <a href="https://github.com/yyx990803">Эван Ю</a>'
    }
  }
}
```

::: warning ПРЕДУПРЕЖДЕНИЕ
В `message` и `copyright` можно использовать только встроенные элементы, поскольку они отображаются внутри элемента `<p>`. Если вы хотите добавить блочные элементы, рассмотрите возможность использования слота [`layout-bottom`](../guide/extending-default-theme#layout-slots).
:::

Обратите внимание, что футер не будет отображаться, если виден [Сайдбар](./default-theme-sidebar).

## Настройка в метаданных {#frontmatter-config}

Отображение футера можно отключить на конкретной странице с помощью опции `footer` в метаданных:

```yaml
---
footer: false
---
```
