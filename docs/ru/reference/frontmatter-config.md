---
outline: deep
---

# Конфигурация метаданных {#frontmatter-config}

Метаданные обеспечивают настройку отдельных страниц. В каждом файле Markdown можно использовать метаданные, чтобы переопределить параметры конфигурации сайта или темы. Кроме того, есть параметры конфигурации, которые можно задать только через метаданные.

Пример использования:

```md
---
title: Документация с VitePress
editLink: true
---
```

Вы можете получить доступ к метаданным через глобальный объект `$frontmatter` в выражениях Vue:

```md
{{ $frontmatter.title }}
```

## title {#title}

- Тип: `string`

Заголовок страницы. Это то же самое, что [config.title](./site-config#title), и оно переопределяет конфигурацию сайта.

```yaml
---
title: VitePress
---
```

## titleTemplate {#titletemplate}

- Тип: `string | boolean`

Суффикс для названия. Это то же самое, что и [config.titleTemplate](./site-config#titletemplate), и оно переопределяет конфигурацию сайта.

```yaml
---
title: VitePress
titleTemplate: Генератор статических сайтов на основе Vite и Vue
---
```

## description {#description}

- Тип: `string`

Описание для страницы. Это то же самое, что и [config.description](./site-config#description), и оно переопределяет конфигурацию сайта.

```yaml
---
description: VitePress
---
```

## head {#head}

- Тип: `HeadConfig[]`

Укажите дополнительные теги, которые будут выводиться для текущей страницы. Они будут добавляться после других тегов внутри блока head, введённых в конфигурации сайта.

```yaml
---
head:
  - - meta
    - name: description
      content: привет
  - - meta
    - name: keywords
      content: супер-пупер SEO
---
```

```ts
type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string]
```

## Только для темы по умолчанию {#default-theme-only}

Следующие параметры метаданных применимы только при использовании темы по умолчанию.

### layout {#layout}

- Тип: `doc | home | page`
- По умолчанию: `doc`

Определяет макет страницы.

- `doc` - Применяет стили документации по умолчанию к содержимому Markdown.
- `home` - Вы можете добавить дополнительные параметры, такие как `hero` и `features`, чтобы быстро создать красивую целевую страницу.
- `page` - Ведет себя аналогично `doc`, но не применяет стили к содержимому. Полезно, если вы хотите создать полностью настраиваемую страницу.

```yaml
---
layout: doc
---
```

### hero <Badge type="info" text="только для страниц с макетом home" /> {#hero}

Определяет содержимое секции `hero`, когда `layout` имеет значение `home`. Подробнее в главе [Тема по умолчанию: Главная страница](./default-theme-home-page).

### features <Badge type="info" text="только для страниц с макетом home" /> {#features}

Определяет элементы для отображения в секции `features`, когда `layout` имеет значение `home`. Подробнее в главе [Тема по умолчанию: Главная страница](./default-theme-home-page).

### navbar {#navbar}

- Тип: `boolean`
- По умолчанию: `true`

Отображать ли [панель навигации](./default-theme-nav).

```yaml
---
navbar: false
---
```

### sidebar {#sidebar}

- Тип: `boolean`
- По умолчанию: `true`

Отображать ли [сайдбар](./default-theme-sidebar).

```yaml
---
sidebar: false
---
```

### aside {#aside}

- Тип: `boolean | 'left'`
- По умолчанию: `true`

Определяет расположение компонента aside в макете `doc`.

Установка этого значения в `false` предотвращает отрисовку контейнера сайдбара.\
Установка этого значения в `true` приведёт к отображению сайдбара справа.\
Установка этого значения в `left` приведёт к отображению сайдбара слева.

```yaml
---
aside: false
---
```

### outline {#outline}

- Тип: `number | [number, number] | 'deep' | false`
- По умолчанию: `2`

Уровни заголовков в оглавлении для отображения на странице. Это то же самое, что и [config.themeConfig.outline.level](./default-theme-config#outline), и оно переопределяет значение, установленное в конфигурации сайта.

```yaml
---
outline: [2, 4]
---
```

### lastUpdated {#lastupdated}

- Тип: `boolean | Date`
- По умолчанию: `true`

Отображать ли текст [Обновлено](./default-theme-last-updated) в футере текущей страницы. Если указано время даты, оно будет отображаться вместо временной метки последнего изменения git.

```yaml
---
lastUpdated: false
---
```

### editLink {#editlink}

- Тип: `boolean`
- По умолчанию: `true`

Отображать ли [ссылку для редактирования](./default-theme-edit-link) в футере текущей страницы.

```yaml
---
editLink: false
---
```

### footer {#footer}

- Тип: `boolean`
- По умолчанию: `true`

Отображать ли [футер](./default-theme-footer).

```yaml
---
footer: false
---
```

### pageClass {#pageclass}

- Тип: `string`

Добавьте дополнительное имя класса на определённую страницу.

```yaml
---
pageClass: custom-page-class
---
```

Вы также можете настроить стили этой конкретной страницы в файле `.vitepress/theme/custom.css`:

```css
.custom-page-class {
  /* стили для конкретной страницы */
}
```
