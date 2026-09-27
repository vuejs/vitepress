---
description: Konfiguriere das Startseitenlayout des VitePress-Standard-Themes mit Hero-Bereichen, Features und eigenen Inhalten.
---

# Startseite

Das VitePress-Standard-Theme stellt ein Startseitenlayout bereit, das du auch auf [der Startseite dieser Website](../) sehen kannst. Du kannst es auf jeder deiner Seiten verwenden, indem du `layout: home` im [Frontmatter](./frontmatter-config) angibst.

```yaml
---
layout: home
---
```

Diese Option allein bewirkt jedoch noch nicht viel. Du kannst der Startseite verschiedene vorgefertigte „Bereiche“ hinzufügen, indem du zusätzliche Optionen wie `hero` und `features` setzt.

## Hero-Bereich

Der Hero-Bereich befindet sich oben auf der Startseite. So kannst du ihn konfigurieren.

```yaml
---
layout: home

hero:
  name: VitePress
  text: Vite & Vue powered static site generator.
  tagline: Lorem ipsum...
  image:
    src: /logo.png
    alt: VitePress
  actions:
    - theme: brand
      text: Get Started
      link: /guide/what-is-vitepress
    - theme: alt
      text: View on GitHub
      link: https://github.com/vuejs/vitepress
---
```

```ts
interface Hero {
  // Die Zeichenkette, die oberhalb von `text` angezeigt wird. Verwendet die Markenfarbe
  // Sie sollte kurz sein, beispielsweise der Produktname.
  name?: string

  // Der Haupttext des Hero-Bereichs. Dieser wird definiert
  // as `h1` tag.
  text: string

  // Unter `text` angezeigter Untertitel.
  tagline?: string

  // Das Bild wird neben dem Text- und Untertitelbereich angezeigt.
  image?: ThemeableImage

  // Aktionsschaltflächen, die im Hero-Bereich der Startseite angezeigt werden.
  actions?: HeroAction[]
}

type ThemeableImage =
  | string
  | { src: string; alt?: string }
  | { light: string; dark: string; alt?: string }

interface HeroAction {
  // Farbvariante der Schaltfläche. Standardmäßig `brand`.
  theme?: 'brand' | 'alt'

  // Beschriftung der Schaltfläche.
  text: string

  // Ziellink der Schaltfläche.
  link: string

  // Zielattribut des Links.
  target?: string

  // Link rel attribute.
  rel?: string
}
```

### Farbe des Namens anpassen

VitePress verwendet für `name` die Markenfarbe (`--vp-c-brand-1`). Du kannst diese Farbe jedoch durch Überschreiben der Variable `--vp-home-hero-name-color` anpassen.

```css
:root {
  --vp-home-hero-name-color: blue;
}
```

Du kannst es außerdem weiter anpassen, indem du `--vp-home-hero-name-background` to give the `name` gradient color.

```css
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe, #41d1ff);
}
```

## Feature-Bereich

Im Feature-Bereich kannst du beliebig viele Features auflisten, die direkt nach dem Hero-Bereich angezeigt werden sollen. Übergebe dazu die Option `features` im Frontmatter.

Du kannst für jedes Feature ein Symbol angeben, which can be an emoji or any type of image. When the configured icon is an image (svg, png, jpeg...), you must provide the icon with the proper width and height; you can also provide the description, its intrinsic size as well as its variants for dark and light theme wenn erforderlich.

```yaml
---
layout: home

features:
  - icon: 🛠️
    title: Simple and minimal, always
    details: Lorem ipsum...
  - icon:
      src: /cool-feature-icon.svg
    title: Another cool feature
    details: Lorem ipsum...
  - icon:
      dark: /dark-feature-icon.svg
      light: /light-feature-icon.svg
    title: Another cool feature
    details: Lorem ipsum...
---
```

```ts
interface Feature {
  // Show icon on each feature box.
  icon?: FeatureIcon

  // Title of the feature.
  title: string

  // Details of the feature.
  details: string

  // Link when clicked on feature component. The link can
  // be both internal or external.
  //
  // e.g. `guide/reference/default-theme-home-page` or `https://example.com`
  link?: string

  // Link text to be shown inside feature component. Best
  // used with `link` option.
  //
  // e.g. `Learn more`, `Visit page`, etc.
  linkText?: string

  // Link rel attribute for the `link` option.
  //
  // e.g. `external`
  rel?: string

  // Link target attribute for the `link` option.
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

## Markdown-Inhalt

Du kannst zusätzliche Inhalte zur Startseite deiner Website hinzufügen, indem du einfach unterhalb der `---`-Frontmatter-Trennlinie Markdown hinzufügst.

````md
---
layout: home

hero:
  name: VitePress
  text: Vite & Vue powered static site generator.
---

## Getting Started

You can get started using VitePress right away using `npx`!

```sh
npm init
npx vitepress init
```
````

::: info
VitePress hat zusätzliche Inhalte einer Seite mit `layout: home` nicht immer automatisch gestaltet. Um das frühere Verhalten wiederherzustellen, kannst du `markdownStyles: false` im Frontmatter setzen.
:::
