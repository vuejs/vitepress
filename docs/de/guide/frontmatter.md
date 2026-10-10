---
description: Erfahre, wie du YAML-Frontmatter in VitePress-Markdown-Dateien verwendest, um Metadaten und Verhalten einzelner Seiten zu steuern.
---

# Frontmatter

## Verwendung

VitePress unterstützt YAML frontmatter in allen Markdown-Dateien und verarbeitet sie mit [gray-matter](https://github.com/jonschlinkert/gray-matter). Das Frontmatter muss am Anfang der Markdown-Datei stehen (vor allen Elementen einschließlich `<script>`-Tags) und aus gültigem YAML zwischen drei Bindestrichzeilen bestehen. Beispiel:

```md
---
title: Dokumentation mit VitePress
editLink: true
---
```

Viele Optionen der Website- oder Standard-Theme-Konfiguration besitzen entsprechende Optionen im Frontmatter. Du kannst Frontmatter verwenden, um bestimmtes Verhalten nur für die aktuelle Seite zu überschreiben. Einzelheiten findest du in [Referenz zur Frontmatter-Konfiguration](../reference/frontmatter-config).

Du kannst außerdem eigene Frontmatter-Daten definieren und sie in dynamischen Vue-Ausdrücken auf der Seite verwenden.

## Zugriff auf Frontmatter-Daten

Auf Frontmatter-Daten kannst du über die spezielle globale Variable `$frontmatter` zugreifen:

Hier ist ein Beispiel dafür, wie du sie in deiner Markdown-Datei verwenden kannst:

```md
---
title: Dokumentation mit VitePress
editLink: true
---

# {{ $frontmatter.title }}

Inhalt der Anleitung
```

Zugriffe auf Eigenschaften wie `{{ $frontmatter.title }}` werden beim Rendern von Markdown aufgelöst. Der Wert landet dadurch auch im lokalen Suchindex, in der Ausgabe des [Datenladers](./data-loading#createcontentloader), in Überschriftenankern – die obige Überschrift erhält `id="docs-mit-vitepress"` – und in Linkzielen, die ohne Leerzeichen um den Ausdruck geschrieben werden, etwa `[text]({{$frontmatter.link}})`. Andere Ausdrücke werden wie gewohnt zur Laufzeit von Vue ausgewertet. Wenn du einen Ausdruck in [`v-pre`](./Verwendung-vue#escaping) einschließt, wird er wörtlich angezeigt.

Du kannst außerdem in `<script setup>` mit dem [`useData()`](../reference/runtime-api#usedata)-Helper auf die Frontmatter-Daten der aktuellen Seite zugreifen.

## Alternative Frontmatter-Formate

VitePress unterstützt auch die JSON-Frontmatter-Syntax, die mit geschweiften Klammern beginnt und endet:

```json
---
{
  "title": "Bloggen wie ein Hacker",
  "editLink": true
}
---
```
