# Загрузка данных в режиме реального времени {#build-time-data-loading}

VitePress предоставляет функцию **загрузчиков данных**, которая позволяет загружать произвольные данные и импортировать их со страниц или компонентов. Загрузка данных выполняется **только во время сборки**: Полученные данные будут сериализованы в виде JSON в финальной сборке JavaScript.

Загрузчики данных могут использоваться для получения удалённых данных или генерирования метаданных на основе локальных файлов. Например, вы можете использовать загрузчики данных для анализа всех локальных страниц API и автоматического создания индекса всех записей API.

## Пример использования {#basic-usage}

Файл загрузчика данных должен заканчиваться либо `.data.js`, либо `.data.ts`. Файл должен предоставлять экспорт объекта по умолчанию с помощью метода `load()`:

```js [example.data.js]
export default {
  load() {
    return {
      hello: 'мир'
    }
  }
}
```

Модуль загрузчика выполняется только в Node.js, поэтому вы можете импортировать любые API Node и зависимости npm по мере необходимости.

Затем вы можете импортировать данные из этого файла в страницы `.md` и компоненты `.vue` с помощью экспорта с именем `data`:

```vue
<script setup>
import { data } from './example.data.js'
</script>

<pre>{{ data }}</pre>
```

Результат:

```json
{
  "hello": "мир"
}
```

Вы заметите, что сам загрузчик данных не экспортирует `data`. Это VitePress вызывает метод `load()` за кулисами и неявно раскрывает результат через именованный экспорт `data`.

Это работает, даже если загрузчик асинхронный:

```js
export default {
  async load() {
    // получение удалённых данных
    return (await fetch('...')).json()
  }
}
```

## Данные из локальных файлов {#data-from-local-files}

Если вам нужно генерировать данные на основе локальных файлов, используйте опцию `watch` в загрузчике данных, чтобы изменения, внесённые в эти файлы, вызывали горячие обновления.

Опция `watch` удобна ещё и тем, что вы можете использовать [шаблоны glob](https://github.com/mrmlnc/fast-glob#pattern-syntax) для соответствия нескольким файлам. Шаблоны могут быть относительными к самому файлу загрузчика, а функция `load()` будет получать совпадающие файлы в виде абсолютных путей.

В следующем примере показана загрузка CSV-файлов и их преобразование в JSON с помощью [csv-parse](https://github.com/adaltas/node-csv/tree/master/packages/csv-parse/). Поскольку этот файл выполняется только во время сборки, вы не будете передавать CSV-парсер клиенту!

```js
import fs from 'node:fs'
import { parse } from 'csv-parse/sync'

export default {
  watch: ['./data/*.csv'],
  load(watchedFiles) {
    // watchedFiles будет представлять собой массив абсолютных путей к найденным файлам.
    // Формируем массив метаданных записи блога, которые можно использовать для визуализации списка в макете темы
    return watchedFiles.map((file) => {
      return parse(fs.readFileSync(file, 'utf-8'), {
        columns: true,
        skip_empty_lines: true
      })
    })
  }
}
```

## `createContentLoader` {#createcontentloader}

При создании сайта, ориентированного на контент, нам часто приходится создавать страницы типа «архив», или «индекс», на которых мы перечисляем все доступные записи в нашей коллекции контента. Например, записи в блоге или страницы API. Мы **можем** реализовать это напрямую с помощью API загрузчика данных, но поскольку это очень распространённый случай использования, VitePress также предоставляет функцию `createContentLoader`, чтобы упростить эту задачу:

```js [posts.data.js]
import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/*.md' /* параметры */)
```

Эта функция принимает шаблон glob относительно [исходного каталога](./routing#source-directory) и возвращает объект `{ watch, load }` загрузчика данных, который может быть использован в качестве экспорта по умолчанию в файле загрузчика данных. В нем также реализовано кэширование на основе временных меток изменения файлов для повышения производительности dev.

Обратите внимание, что загрузчик работает только с файлами Markdown — совпадающие файлы, не относящиеся к Markdown, будут пропущены.

Загруженные данные будут представлять собой массив с типом `ContentData[]`:

```ts
interface ContentData {
  // отображаемый URL-адрес страницы, например: /posts/hello.html (не включает `base`)
  // выполните итерацию вручную или используйте пользовательскую `трансформацию` для нормализации путей
  url: string
  // метаданные страницы
  frontmatter: Record<string, any>

  // следующие параметры присутствуют только в том случае, если соответствующие опции включены
  // мы рассмотрим их ниже
  src: string | undefined
  html: string | undefined
  excerpt: string | undefined
}
```

По умолчанию указываются только `url` и `frontmatter`. Это связано с тем, что загруженные данные будут вложены в клиентский пакет в виде JSON, поэтому нам нужно быть осторожными с их размером. Вот пример использования этих данных для создания минимальной индексной страницы блога:

```vue
<script setup>
import { data as posts } from './posts.data.js'
</script>

<template>
  <h1>Все записи блога</h1>
  <ul>
    <li v-for="post of posts">
      <a :href="post.url">{{ post.frontmatter.title }}</a>
      <span>by {{ post.frontmatter.author }}</span>
    </li>
  </ul>
</template>
```

### Параметры {#options}

Данные по умолчанию могут не соответствовать всем требованиям — вы можете изменить данные с помощью параметров:

```js [posts.data.js]
import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/*.md', {
  includeSrc: true, // включить исходный текст в формате Markdown?
  render: true, // включать в себя полный HTML страницы?
  excerpt: true, // включить отрывок?
  transform(rawData) {
    // составляйте карты, сортируйте или фильтруйте исходные данные по своему усмотрению.
    // конечный результат — это то, что будет отправлено клиенту.
    return rawData
      .sort((a, b) => {
        return +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date)
      })
      .map((page) => {
        page.src // исходный текст в формате Markdown
        page.html // отображение полной страницы HTML
        page.excerpt // отображаемый отрывок HTML (содержимое выше первого `---`)
        return {
          /* ... */
        }
      })
  }
})
```

Посмотрите, как он используется в [блоге Vue.js](https://github.com/vuejs/blog/blob/main/.vitepress/theme/posts.data.ts).

API `createContentLoader` также можно использовать внутри [хуков сборки](../reference/site-config#build-hooks):

```js [.vitepress/config.js]
export default {
  async buildEnd() {
    const posts = await createContentLoader('posts/*.md').load()
    // генерируем файлы на основе метаданных сообщений, например, RSS-канал
  }
}
```

**Типы**

```ts
interface ContentOptions<T = ContentData[]> {
  /**
   * Включаем src?
   * @default false
   */
  includeSrc?: boolean

  /**
   * Преобразовываем src в HTML и включаем в данные?
   * @default false
   */
  render?: boolean

  /**
   * Если `boolean`, то следует ли разбирать и включать отрывок? (отображается как HTML)
   *
   * Если `function`, то управляйте тем, как отрывок извлекается из содержимого.
   *
   * Если `string`, определите пользовательский разделитель, который будет использоваться для извлечения
   * отрывка. Разделителем по умолчанию является `---`, если `excerpt` имеет значение `true`.
   *
   * @see https://github.com/jonschlinkert/gray-matter#optionsexcerpt
   * @see https://github.com/jonschlinkert/gray-matter#optionsexcerpt_separator
   *
   * @default false
   */
  excerpt?:
    | boolean
    | ((
        file: {
          data: { [key: string]: any }
          content: string
          excerpt?: string
        },
        options?: any
      ) => void)
    | string

  /**
   * Преобразуйте данные. Обратите внимание, что при импорте из компонентов или файлов
   * с разметкой данные будут вложены в клиентский пакет в виде JSON.
   */
  transform?: (data: ContentData[]) => T | Promise<T>
}
```

## Загрузчики типизированных данных {#typed-data-loaders}

При использовании TypeScript можно ввести свой загрузчик и экспортировать `data` следующим образом:

```ts
import { defineLoader } from 'vitepress'

export interface Data {
  // тип данных
}

declare const data: Data
export { data }

export default defineLoader({
  // тип проверенных опций загрузчика
  watch: ['...'],
  async load(): Promise<Data> {
    // ...
  }
})
```

## Конфигурация {#configuration}

Чтобы получить информацию о конфигурации внутри загрузчика, вы можете использовать код, подобный этому:

```ts
import type { SiteConfig } from 'vitepress'

const config: SiteConfig = (globalThis as any).VITEPRESS_CONFIG
```
