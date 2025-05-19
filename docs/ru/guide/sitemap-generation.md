# Генерация карты сайта {#sitemap-generation}

VitePress поставляется с готовой поддержкой генерации файла `sitemap.xml` для вашего сайта. Чтобы включить её, добавьте следующее в файл `.vitepress/config.js`:

```ts
export default {
  sitemap: {
    hostname: 'https://example.com'
  }
}
```

Чтобы теги `<lastmod>` присутствовали в вашем файле `sitemap.xml`, вы можете включить опцию [`lastUpdated`](../reference/default-theme-last-updated).

## Параметры {#options}

Поддержка карты сайта осуществляется с помощью модуля [`sitemap`](https://www.npmjs.com/package/sitemap). Вы можете передать любые поддерживаемые им параметры в опцию `sitemap` в вашем конфигурационном файле. Они будут переданы непосредственно в конструктор `SitemapStream`. Более подробную информацию см. в документации [`sitemap`](https://www.npmjs.com/package/sitemap#options-you-can-pass). Пример:

```ts
export default {
  sitemap: {
    hostname: 'https://example.com',
    lastmodDateOnly: false
  }
}
```

При использовании параметра `base` в своей конфигурации обязательно добавьте его в адрес `hostname`:

```ts
export default {
  base: '/my-site/',
  sitemap: {
    hostname: 'https://example.com/my-site/'
  }
}
```

## Хук `transformItems` {#transformitems-hook}

Вы можете использовать хук `sitemap.transformItems` для изменения элементов карты сайта перед их записью в файл `sitemap.xml`. Этот хук вызывается с массивом элементов sitemap и ожидает возвращения массива элементов sitemap. Пример:

```ts
export default {
  sitemap: {
    hostname: 'https://example.com',
    transformItems: (items) => {
      // добавляем новые элементы или изменяем/фильтруем существующие
      items.push({
        url: '/extra-page',
        changefreq: 'monthly',
        priority: 0.8
      })
      return items
    }
  }
}
```
