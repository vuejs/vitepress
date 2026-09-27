---
description: Lade beliebige Daten zur Build-Zeit mit VitePress Data Loadern und importiere sie in Seiten oder Komponenten.
---

# Daten zur Build-Zeit laden

VitePress stellt eine Funktion namens **Data Loader** bereit, mit der du beliebige Daten laden und in Seiten oder Komponenten importieren kannst. Das Laden der Daten wird **nur zur Build-Zeit** ausgeführt: Die resultierenden Daten werden als JSON im endgültigen JavaScript-Bundle serialisiert.

Data Loader können verwendet werden, um entfernte Daten abzurufen oder Metadaten auf Grundlage lokaler Dateien zu erzeugen. Zum Beispiel kannst du damit deine lokalen API-Seiten analysieren und automatisch einen Index aller API-Einträge erzeugen.

## Grundlegende Verwendung

Eine Data-Loader-Datei muss mit `.data.js` or `.data.ts`. enden. Die Datei sollte ein Objekt als Standardexport bereitstellen, das die `load()` method:

```js [example.data.js]
export default {
  load() {
    return {
      hello: 'world'
    }
  }
}
```

Das Loader-Modul wird nur in Node.js ausgewertet. Du kannst daher nach Bedarf Node-APIs und npm-Abhängigkeiten importieren.

Du kannst anschließend Daten aus dieser Datei in `.md`-Seiten und `.vue`-Komponenten mit dem `data` named export:

```vue
<script setup>
import { data } from './example.data.js'
</script>

<pre>{{ data }}</pre>
```

Ausgabe:

```json
{
  "hello": "world"
}
```

Du wirst feststellen, dass der Data Loader selbst `data` nicht exportiert. Stattdessen ruft VitePress im Hintergrund die Methode `load()` auf und stellt das Ergebnis implizit über den benannten Export `data` bereit.

Das funktioniert auch, wenn der Loader asynchron ist:

```js
export default {
  async load() {
    // entfernte Daten abrufen
    return (await fetch('...')).json()
  }
}
```

## Daten aus lokalen Dateien

Wenn du Daten auf Grundlage lokaler Dateien erzeugen musst, solltest du die `watch` Option im Data Loader verwenden, damit Änderungen an diesen Dateien Hot-Updates auslösen können.

Die Option `watch` ist außerdem praktisch, weil du [glob patterns](https://github.com/mrmlnc/fast-glob#pattern-syntax) verwenden kannst, um mehrere Dateien zu finden. Die Muster können relativ zur Loader-Datei angegeben werden, und die Funktion `load()` erhält die gefundenen Dateien als absolute Pfade.

Das folgende Beispiel zeigt, wie CSV-Dateien geladen und mit [csv-parse](https://github.com/adaltas/node-csv/tree/master/packages/csv-parse/). Da diese Datei nur zur Build-Zeit ausgeführt wird, wird der CSV-Parser nicht an den Client ausgeliefert!

```js
import fs from 'node:fs'
import { parse } from 'csv-parse/sync'

export default {
  watch: ['./data/*.csv'],
  load(watchedFiles) {
    // watchedFiles ist ein Array mit den absoluten Pfaden der gefundenen Dateien.
    // Erzeuge ein Array mit Metadaten von Blogbeiträgen, das zum Rendern
    // einer Liste im Theme-Layout verwendet werden kann
    return watchedFiles.map((file) => {
      return parse(fs.readFileSync(file, 'utf-8'), {
        columns: true,
        skip_empty_lines: true
      })
    })
  }
}
```

## `createContentLoader`

Beim Erstellen einer inhaltsorientierten Website müssen wir häufig eine „Archiv“- oder „Index“-Seite erstellen: eine Seite, auf der wir alle verfügbaren Einträge unserer Inhaltssammlung auflisten, beispielsweise Blogbeiträge oder API-Seiten. Wir **können** dies direkt mit der Data-Loader-API umsetzen. Da dies jedoch ein sehr häufiger Anwendungsfall ist, stellt VitePress den Helper `createContentLoader` bereit, der dies vereinfacht:

```js [posts.data.js]
import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/*.md', /* options */)
```

Der Helper akzeptiert ein Glob-Muster relativ zum [Quellverzeichnis](./routing#source-directory), und gibt ein `{ watch, load }`-Data-Loader-Objekt zurück, das als Standardexport in einer Data-Loader-Datei verwendet werden kann. Außerdem wird ein Cache auf Grundlage der Änderungszeitpunkte von Dateien verwendet, um die Leistung während der Entwicklung zu verbessern.

Hinweis: Der Loader funktioniert nur mit Markdown-Dateien – gefundene Dateien ohne Markdown-Endung werden übersprungen.

Die geladenen Daten sind ein Array vom Typ `ContentData[]`:

```ts
interface ContentData {
  // Zugeordnete URL der Seite, z. B. /posts/hello.html (enthält base nicht)
  // Pfade manuell durchlaufen oder mit `transform` normalisieren
  url: string
  // Frontmatter-Daten der Seite
  frontmatter: Record<string, any>

  // Die folgenden Eigenschaften sind nur vorhanden, wenn die entsprechenden Optionen aktiviert sind
  // Wir besprechen sie weiter unten
  src: string | undefined
  html: string | undefined
  excerpt: string | undefined
}
```

Standardmäßig werden nur `url` und `frontmatter` bereitgestellt. Da die geladenen Daten als JSON in das Client-Bundle eingebettet werden, müssen wir auf ihre Größe achten. Hier ist ein Beispiel dafür, wie du die Daten für eine minimale Blog-Indexseite verwendest:

```vue
<script setup>
import { data as posts } from './posts.data.js'
</script>

<template>
  <h1>Alle Blogbeiträge</h1>
  <ul>
    <li v-for="post of posts">
      <a :href="post.url">{{ post.frontmatter.title }}</a>
      <span>von {{ post.frontmatter.author }}</span>
    </li>
  </ul>
</template>
```

### Optionen

Die Standarddaten sind möglicherweise nicht für alle Anwendungsfälle geeignet. Du kannst die Daten mithilfe von Optionen transformieren:

```js [posts.data.js]
import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/*.md', {
  includeSrc: true, // Rohquelle des Markdown einschließen?
  render: true,     // Gerendertes vollständiges HTML der Seite einschließen?
  excerpt: true,    // Auszug einschließen?
  transform(rawData) {
    // Rohdaten nach Bedarf abbilden, sortieren oder filtern.
    // Das Endergebnis wird an den Client ausgeliefert.
    return rawData.sort((a, b) => {
      return +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date)
    }).map((page) => {
      page.src     // Rohquelle des Markdown
      page.html    // Gerendertes vollständiges HTML der Seite
      page.excerpt // Gerendertes HTML des Auszugs (Inhalt vor dem ersten `---`)
      return {/* ... */}
    })
  }
})
```

Sieh dir an, wie dies im [Vue.js blog](https://github.com/vuejs/blog/blob/main/.vitepress/theme/posts.data.ts).

Die `createContentLoader`-API kann auch innerhalb von [build hooks](../reference/site-config#build-hooks):

```js [.vitepress/config.js]
export default {
  async buildEnd() {
    const posts = await createContentLoader('posts/*.md').load()
    // Dateien anhand der Beitragsmetadaten erzeugen, z. B. einen RSS-Feed
  }
}
```

**Typen**

```ts
interface ContentOptions<T = ContentData[]> {
  /**
   * src einschließen?
   * @default false
   */
  includeSrc?: boolean

  /**
   * src in HTML rendern und in die Daten aufnehmen?
   * @default false
   */
  render?: boolean

  /**
   * Wenn `boolean`: ob ein Auszug verarbeitet und aufgenommen werden soll (als HTML gerendert).
   *
   * Wenn `function`: steuert, wie der Auszug aus dem Inhalt extrahiert wird.
   *
   * Wenn `string`: definiert ein benutzerdefiniertes Trennzeichen zum Extrahieren des
   * excerpt. Das Standardtrennzeichen ist `---` if `excerpt` is `true`.
   *
   * @see https://github.com/jonschlinkert/gray-matter#optionsexcerpt
   * @see https://github.com/jonschlinkert/gray-matter#optionsexcerpt_separator
   *
   * @default false
   */
  excerpt?:
    | boolean
    | ((file: { data: { [key: string]: any }; content: string; excerpt?: string }, options?: any) => void)
    | string

  /**
   * Daten transformieren. Beachte, dass die Daten als JSON im Client-Bundle eingebettet werden, wenn sie aus Komponenten oder Markdown-Dateien
   * importiert werden.
   */
  transform?: (data: ContentData[]) => T | Promise<T>
}
```

## Typisierte Data Loader

Bei Verwendung von TypeScript kannst du deinen Loader und den `data`-Export wie folgt typisieren:

```ts
import { defineLoader } from 'vitepress'

export interface Data {
  // Datentyp
}

declare const data: Data
export { data }

export default defineLoader({
  // Typgeprüfte Loader-Optionen
  watch: ['...'],
  async load(): Promise<Data> {
    // ...
  }
})
```

## Konfiguration

Um innerhalb eines Loaders auf die Konfigurationsinformationen zuzugreifen, kannst du beispielsweise folgenden Code verwenden:

```ts
import type { SiteConfig } from 'vitepress'

const config: SiteConfig = (globalThis as any).VITEPRESS_CONFIG
```
