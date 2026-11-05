---
outline: deep
description: Referenz aller verfügbaren Frontmatter-Konfigurationsoptionen für VitePress-Markdown-Seiten.
---

# Frontmatter-Konfiguration

Frontmatter ermöglicht die Konfiguration einzelner Seiten. In jeder Markdown-Datei kannst du Frontmatter verwenden, um Konfigurationsoptionen auf Website- oder Theme-Ebene zu überschreiben. Außerdem gibt es Optionen, die nur im Frontmatter definiert werden können.

Beispiel usage:

```md
---
title: Dokumentation mit VitePress
editLink: true
---
```

Du kannst über das globale `$frontmatter` in Vue-Ausdrücken auf Frontmatter-Daten zugreifen:

```md
{{ $frontmatter.title }}
```

## title

- Type: `string`

Titel der Seite. Entspricht [config.title](./site-config#title) und überschreibt die Konfiguration auf Websiteebene.

```yaml
---
title: VitePress
---
```

## titleTemplate

- Type: `string | boolean`

Suffix für den Titel. Entspricht [config.titleTemplate](./site-config#titletemplate) und überschreibt die Konfiguration auf Websiteebene.

```yaml
---
title: VitePress
titleTemplate: Statischer Website-Generator auf Basis von Vite und Vue
---
```

## description

- Type: `string`

Beschreibung der Seite. Entspricht [config.description](./site-config#description) und überschreibt die Konfiguration auf Websiteebene.

```yaml
---
description: VitePress
---
```

## head

- Type: `HeadConfig[]`

Gibt zusätzliche Head-Tags an, die für die aktuelle Seite eingefügt werden. Sie werden mit den über die Konfiguration auf Websiteebene eingefügten Head-Tags [zusammengeführt](./site-config#head).

```yaml
---
head:
  - - meta
    - name: description
      content: hello
  - - meta
    - name: keywords
      content: super duper SEO
---
```

```ts
type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string]
```

## dir

- Type: `'ltr' | 'rtl' | 'auto'`

Überschreibt die [Schreibrichtung](./site-config#dir) der Website für die aktuelle Seite.

```yaml
---
dir: rtl
---
```

## Standard-Theme Only

Die folgenden Frontmatter-Optionen gelten nur bei Verwendung des Standard-Themes.

### layout

- Type: `doc | home | page`
- Default: `doc`

Legt das Layout der Seite fest.

- `doc` - Wendet die standardmäßigen Dokumentationsstile auf den Markdown-Inhalt an.
- `home` - Spezielles Layout für die „Startseite“. Du kannst zusätzliche Optionen wie `hero` und `features` hinzufügen, um schnell ansprechende Startseiten zu erstellen.
- `page` - Verhält sich ähnlich wie `doc`, wendet jedoch keine Stile auf den Inhalt an. Nützlich, wenn du eine vollständig eigene Seite erstellen möchtest.

```yaml
---
layout: doc
---
```

### hero <Badge type="info" text="home page only" />

Definiert den Inhalt des Hero-Bereichs der Startseite, wenn `layout` auf `home` gesetzt ist. Weitere Details findest du unter [Standard-Theme: Startseite](./default-theme-home-page).

### features <Badge type="info" text="home page only" />

Definiert die im Feature-Bereich anzuzeigenden Elemente, wenn `layout` auf `home` gesetzt ist. Weitere Details findest du unter [Standard-Theme: Startseite](./default-theme-home-page).

### navbar

- Type: `boolean`
- Default: `true`

Ob [navbar](./default-theme-nav).

```yaml
---
navbar: false
---
```

### sidebar

- Type: `boolean`
- Default: `true`

Ob [sidebar](./default-theme-sidebar).

```yaml
---
sidebar: false
---
```

### aside

- Type: `boolean | 'left'`
- Default: `true`

Definiert die Position der Aside-Komponente im `doc`-Layout.

Bei `false` wird der Aside-Container nicht gerendert.\
Bei `true` wird der Aside-Container rechts gerendert.\
Bei `'left'` wird der Aside-Container links gerendert.

```yaml
---
aside: false
---
```

### outline

- Type: `number | [number, number] | 'deep' | false`
- Default: `2`

Die Überschriftenebenen, die in der Seitenübersicht für die Seite angezeigt werden. Entspricht [config.themeConfig.outline.level](./default-theme-config#outline) und überschreibt den Wert der Konfiguration auf Websiteebene.

```yaml
---
outline: [2, 4]
---
```

### lastUpdated

- Type: `boolean | Date`
- Default: `true`

Ob der Text für die [letzte Aktualisierung](./default-theme-last-updated) in der Fußzeile der aktuellen Seite angezeigt wird. Wenn ein Zeitpunkt angegeben ist, wird dieser anstelle des letzten Änderungszeitpunkts aus Git angezeigt.

```yaml
---
lastUpdated: false
---
```

### editLink

- Type: `boolean`
- Default: `true`

Ob ein [Bearbeitungslink](./default-theme-edit-link) in der Fußzeile der aktuellen Seite angezeigt wird.

```yaml
---
editLink: false
---
```

### footer

- Type: `boolean`
- Default: `true`

Ob die [Fußzeile](./default-theme-footer) angezeigt wird.

```yaml
---
footer: false
---
```

### pageClass

- Type: `string`

Füge einer bestimmten Seite einen zusätzlichen Klassennamen hinzu.

```yaml
---
pageClass: custom-page-class
---
```

Anschließend kannst du die Stile dieser bestimmten Seite in der Datei `.vitepress/theme/custom.css` anpassen:

```css
.custom-page-class {
  /* page-specific styles */
}
```

### isHome

- Type: `boolean`

Das Standard-Theme verwendet Prüfungen wie `frontmatter.layout === 'home'`, um festzustellen, ob die aktuelle Seite die Startseite ist.\
Dies ist nützlich, wenn du die Startseitenelemente in einem eigenen Layout erzwingen möchtest.

```yaml
---
isHome: true
---
```
