# Ссылка для редактирования {#edit-link}

## Настройка в файле конфигурации {#site-level-config}

Ссылка на редактирование позволяет отобразить ссылку для редактирования страницы на сервисах управления Git, таких как GitHub или GitLab. Чтобы включить её, добавьте опции `themeConfig.editLink` в свой конфиг:

```js
export default {
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path'
    }
  }
}
```

Параметр `pattern` задает структуру URL для ссылки, а `:path` будет заменён на путь к странице.

Вы также можете поместить чистую функцию, которая принимает [`PageData`](./runtime-api#usedata) в качестве аргумента и возвращает строку URL.

```js
export default {
  themeConfig: {
    editLink: {
      pattern: ({ filePath }) => {
        if (filePath.startsWith('packages/')) {
          return `https://github.com/acme/monorepo/edit/main/${filePath}`
        } else {
          return `https://github.com/acme/monorepo/edit/main/docs/${filePath}`
        }
      }
    }
  }
}
```

Она не должна иметь побочных эффектов или доступа к чему-либо за пределами своей области, поскольку будет сериализована и выполнена в браузере.

По умолчанию это добавит текст ссылки «Редактировать страницу» в нижней части документа. Вы можете настроить этот текст, определив опцию `text`.

```js
export default {
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
      text: 'Редактировать эту страницу на GitHub'
    }
  }
}
```

## Настройка в метаданных {#frontmatter-config}

Эту ссылку можно отключить на конкретной странице с помощью опции `editLink` в метаданных:

```yaml
---
editLink: false
---
```
