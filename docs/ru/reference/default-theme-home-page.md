---
description: Настройте макет главной страницы темы VitePress по умолчанию с секциями hero, функциями и пользовательским контентом.
---

# Главная страница {#home-page}

Тема VitePress по умолчанию предоставляет макет главной страницы, который вы также можете увидеть на [главной странице этого сайта](../). Вы можете использовать его на любой из своих страниц, указав `layout: home` в [метаданных](./frontmatter-config) страницы.

```yaml
---
layout: home
---
```

Однако сам по себе этот вариант мало что даст. Вы можете добавить несколько различных готовых «секций» на главную страницу, установив дополнительные опции, такие как `hero` и `features`.

## Секция `hero` {#hero-section}

Секция `hero` находится в верхней части главной страницы. Вот как можно её настроить:

```yaml
---
layout: home

hero:
  name: VitePress
  text: Генератор статических сайтов на основе Vite и Vue.
  tagline: Lorem ipsum...
  image:
    src: /logo.png
    alt: VitePress
  actions:
    - theme: brand
      text: Начать
      link: /guide/what-is-vitepress
    - theme: alt
      text: Посмотреть на GitHub
      link: https://github.com/vuejs/vitepress
---
```

```ts
interface Hero {
  // Строка, отображаемая поверх `text`. Поставляется в фирменном цвете и,
  // как ожидается, будет короткой — например, название продукта
  name?: string

  // Основной текст секции. Будет использоваться внутри тега `h1`
  text: string

  // Заголовок, отображаемый под `text`
  tagline?: string

  // Изображение отображается рядом с `text` и `tagline`
  image?: ThemeableImage

  // Кнопки действий для отображения в секции
  actions?: HeroAction[]
}

type ThemeableImage =
  | string
  | { src: string; alt?: string }
  | { light: string; dark: string; alt?: string }

interface HeroAction {
  // Цветовая тема кнопки. По умолчанию принимает значение `brand`.
  theme?: 'brand' | 'alt'

  // Метка кнопки.
  text: string

  // Ссылка назначения кнопки.
  link: string

  // Атрибут цели ссылки.
  target?: string

  // Атрибут rel ссылки.
  rel?: string
}
```

### Настройка цвета заголовка секции {#customizing-the-name-color}

VitePress использует фирменный цвет (`--vp-c-brand-1`) для атрибута `name` в секции `hero`. Однако вы можете настроить этот цвет, переопределив переменную `--vp-home-hero-name-color`.

```css
:root {
  --vp-home-hero-name-color: blue;
}
```

Также вы можете настроить его ещё больше, комбинируя `--vp-home-hero-name-background`, чтобы придать `name` градиентный цвет.

```css
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(
    120deg,
    #bd34fe,
    #41d1ff
  );
}
```

## Секция `features` {#features-section}

В секции `features` можно перечислить любое количество функций, которые вы хотели бы показать сразу после секции `hero`. Чтобы настроить её, передайте опцию `features` в метаданных страницы.

Для каждой функции можно указать иконку, который может быть эмодзи или любым другим изображением. Если настраиваемая иконка представляет собой изображение (svg, png, jpeg...), вы должны предоставить ей соответствующую ширину и высоту. При необходимости можно указать описание, собственный размер, а также варианты для тёмной и светлой темы.

```yaml
---
layout: home

features:
  - icon: 🛠️
    title: Просто и минималистично, всегда
    details: Lorem ipsum...
  - icon:
      src: /cool-feature-icon.svg
    title: Ещё одна интересная функция
    details: Lorem ipsum...
  - icon:
      dark: /dark-feature-icon.svg
      light: /light-feature-icon.svg
    title: Ещё одна интересная функция
    details: Lorem ipsum...
---
```

```ts
interface Feature {
  // Иконка
  icon?: FeatureIcon

  // Заголовок фичи
  title: string

  // Описание фичи
  details: string

  // Ссылка при нажатии на компонент функции. Ссылка может быть как внутренней, так и внешней.
  //
  // например, `guide/reference/default-theme-home-page` или `https://example.com`
  link?: string

  // Текст ссылки, который будет отображаться внутри компонента функции. Лучше всего использовать с опцией `link`.
  //
  // например, `Узнать подробнее`, `Посетить страницу` и т. д.
  linkText?: string

  // Атрибут rel для опции `link`
  //
  // например, `external`
  rel?: string

  // Атрибут target для опции `link`
  target?: string
}

type FeatureIcon =
  | string
  | { src: string; alt?: string; width?: string; height: string }
  | {
      light: string
      dark: string
      alt?: string
      width?: string
      height: string
    }
```

## Содержимое Markdown {#markdown-content}

Вы можете добавить дополнительный контент на главную страницу вашего сайта, просто добавив Markdown под разделителем `---`.

````md
---
layout: home

hero:
  name: VitePress
  text: Генератор статических сайтов на основе Vite и Vue.
---

## Начало работы

Вы можете начать использовать VitePress прямо сейчас, используя `npx`!

```sh
npm init
npx vitepress init
```
````

::: info ПРИМЕЧАНИЕ
VitePress не всегда автоматически стилизовал дополнительный контент страницы с макетом `layout: home`. Чтобы вернуться к старому поведению, добавьте `markdownStyles: false` в метаданных.
:::
