---
outline: deep
description: Verstehe das dateibasierte Routing, dynamische Routen, saubere URLs und Pfadumschreibungen von VitePress.
---

# Routing

## Dateibasierte Routen

VitePress verwendet dateibasiertes Routing. Das bedeutet, dass die erzeugten HTML-Seiten aus der Verzeichnisstruktur der Markdown-Quelldateien abgeleitet werden. Zum Beispiel bei folgender Verzeichnisstruktur:

```
.
├─ guide
│  ├─ getting-started.md
│  └─ index.md
├─ index.md
└─ prologue.md
```

Die erzeugten HTML-Seiten sind:

```
index.md                  -->  /index.html (erreichbar unter /)
prologue.md               -->  /prologue.html
guide/index.md            -->  /guide/index.html (erreichbar unter /guide/)
guide/getting-started.md  -->  /guide/getting-started.html
```

The resulting HTML can be hosted on any web server that can serve static files.

## Stamm- und Quellverzeichnis

In der Dateistruktur eines VitePress-Projekts gibt es zwei wichtige Konzepte: das **Projektstammverzeichnis** und das **Quellverzeichnis**.

### Projektverzeichnis

Das Projektstammverzeichnis ist der Ort, an dem VitePress nach dem speziellen Verzeichnis `.vitepress` sucht. The `.vitepress` directory is a reserved location for VitePress' config file, dev server cache, build output, and optional theme customization code.

Wenn du `vitepress dev` oder `vitepress build` über die Kommandozeile ausführst, verwendet VitePress das aktuelle Arbeitsverzeichnis als Projektstammverzeichnis. Um ein Unterverzeichnis als Stammverzeichnis festzulegen, musst du den relativen Pfad an den Befehl übergeben. Wenn dein VitePress-Projekt beispielsweise in `./docs` liegt, solltest du `vitepress dev docs` ausführen:

```
.
├─ docs                    # Projektstammverzeichnis
│  ├─ .vitepress           # Konfigurationsverzeichnis
│  ├─ getting-started.md
│  └─ index.md
└─ ...
```

```sh
vitepress dev docs
```

Dies führt zu folgender Zuordnung von Quelle zu HTML:

```
docs/index.md            -->  /index.html (erreichbar unter /)
docs/getting-started.md  -->  /getting-started.html
```

### Quellverzeichnis

Das Quellverzeichnis ist der Ort, an dem deine Markdown-Quelldateien liegen. Standardmäßig entspricht es dem Projektstammverzeichnis. Du kannst es jedoch über die [`srcDir`](../reference/site-config#srcdir) Konfigurationsoption festlegen.

Die Option `srcDir` wird relativ zum Projektstammverzeichnis aufgelöst. Mit `srcDir: 'src'`, your file structure will look like this:

```
.                          # Projektstammverzeichnis
├─ .vitepress              # Konfigurationsverzeichnis
└─ src                     # source dir
   ├─ getting-started.md
   └─ index.md
```

The resulting source-to-HTML mapping:

```
src/index.md            -->  /index.html (erreichbar unter /)
src/getting-started.md  -->  /getting-started.html
```

## Zwischen Seiten verlinken

Du kannst sowohl absolute als auch relative Pfade verwenden, um zwischen Seiten zu verlinken. Beachte, dass sowohl die Endungen `.md` als auch `.html` funktionieren, es jedoch empfohlen wird, Dateiendungen wegzulassen, damit VitePress die endgültigen URLs anhand deiner Konfiguration erzeugen kann.

```md
<!-- Richtig -->
[Erste Schritte](./getting-started)
[Erste Schritte](../guide/getting-started)

<!-- Nicht empfohlen -->
[Erste Schritte](./getting-started.md)
[Erste Schritte](./getting-started.html)
```

Mehr über das Verlinken von Assets wie Bildern erfährst du unter [Asset-Verwaltung](./asset-handling).

### Auf Nicht-VitePress-Seiten verlinken

Wenn du auf eine Seite deiner Website verlinken möchtest, die nicht von VitePress erzeugt wird, musst du entweder die vollständige URL verwenden (öffnet einen neuen Tab) oder das Ziel ausdrücklich angeben:

**Input**

```md
[Link to pure.html](/pure.html){target="_self"}
```

**Ausgabe**

[Link to pure.html](/pure.html){target="_self"}

::: tip Hinweis

Bei Markdown-Links wird `base` automatisch der URL vorangestellt. Wenn du auf eine Seite außerhalb deines Basispfads verlinken möchtest, benötigst du daher beispielsweise `../../pure.html` in the link (resolved relative to the current page by the browser).

Alternativ kannst du direkt die Anchor-Tag-Syntax verwenden:

```md
<a href="/pure.html" target="_self">Link to pure.html</a>
```

:::

## Saubere URLs erzeugen

::: warning Server Support Required
Um saubere URLs mit VitePress bereitzustellen, ist Unterstützung auf Serverseite erforderlich.
:::

Standardmäßig löst VitePress eingehende Links in URLs auf, die mit `.html` enden. Manche Benutzer bevorzugen jedoch "Clean URLs" without the `.html` extension - for example, `example.com/path` instead of `example.com/path.html`.

Einige Server oder Hosting-Plattformen (beispielsweise Netlify, Vercel und GitHub Pages) können eine URL wie `/foo` ohne Weiterleitung auf `/foo.html` abbilden, wenn diese Datei existiert:

- Netlify and GitHub Seiten support this by default.
- Vercel requires enabling the [`cleanUrls` option in `vercel.json`](https://vercel.com/docs/concepts/projects/project-configuration#cleanurls).

Wenn diese Funktion verfügbar ist, kannst du auch VitePress' eigene [`cleanUrls`](../reference/site-config#cleanurls) config option so that:

- Inbound links between pages are generated without the `.html` extension.
- If current path ends with `.html`, the router will perform a client-side redirect to the extension-less path.

Wenn du deinen Server jedoch nicht entsprechend konfigurieren kannst, musst du stattdessen manuell die folgende Verzeichnisstruktur verwenden:

```
.
├─ getting-started
│  └─ index.md
├─ installation
│  └─ index.md
└─ index.md
```

## Routen umschreiben

Du kannst die Zuordnung zwischen der Quellverzeichnisstruktur und den erzeugten Seiten anpassen. Das ist bei komplexen Projektstrukturen hilfreich. Angenommen, du hast beispielsweise ein Monorepo mit mehreren Paketen und möchtest die Dokumentation zusammen mit den Quelldateien wie folgt ablegen:

```
.
└─ packages
   ├─ pkg-a
   │  └─ src
   │     ├─ foo.md
   │     └─ index.md
   └─ pkg-b
      └─ src
         ├─ bar.md
         └─ index.md
```

Und du möchtest, dass die VitePress-Seiten so erzeugt werden:

```
packages/pkg-a/src/index.md  -->  /pkg-a/index.html
packages/pkg-a/src/foo.md    -->  /pkg-a/foo.html
packages/pkg-b/src/index.md  -->  /pkg-b/index.html
packages/pkg-b/src/bar.md    -->  /pkg-b/bar.html
```

Du kannst dies durch Konfiguration der the [`rewrites`](../reference/site-config#rewrites) option like this:

```ts [.vitepress/config.js]
export default {
  rewrites: {
    'packages/pkg-a/src/index.md': 'pkg-a/index.md',
    'packages/pkg-a/src/foo.md': 'pkg-a/foo.md',
    'packages/pkg-b/src/index.md': 'pkg-b/index.md',
    'packages/pkg-b/src/bar.md': 'pkg-b/bar.md'
  }
}
```

Die Option `rewrites` unterstützt außerdem dynamische Routenparameter. In the above example, it would be verbose to list all the paths if you have many packages. Given that they all have the same file structure, you can simplify the config like this:

```ts
export default {
  rewrites: {
    'packages/:pkg/src/:slug*': ':pkg/:slug*'
  }
}
```

Die Rewrite-Pfade werden mit dem Paket `path-to-regexp` kompiliert – weitere Informationen findest du in [dessen Dokumentation](https://github.com/pillarjs/path-to-regexp/tree/6.x#parameters) for more advanced syntax.

`rewrites` can also be a function that receives the original path und gibt den neuen Pfad zurück:

```ts
export default {
  rewrites(id) {
    return id.replace(/^packages\/([^/]+)\/src\//, '$1/')
  }
}
```

::: warning Relative Links bei Rewrites

Wenn Rewrites aktiviert sind, sollten **relative Links auf den umgeschriebenen Pfaden basieren**. Um beispielsweise einen relativen Link from `packages/pkg-a/src/pkg-a-code.md` to `packages/pkg-b/src/pkg-b-code.md`, you should use:

```md
[Link to PKG B](../pkg-b/pkg-b-code)
```
:::

## Dynamische Routen

Du kannst mit einer einzigen Markdown-Datei und dynamischen Daten viele Seiten erzeugen. Zum Beispiel kannst du eine `packages/[pkg].md` file that generates a corresponding page for every package in a project. Hier ist das Segment `[pkg]` ein Routen-**Parameter**, der die einzelnen Seiten voneinander unterscheidet.

### Pfad-Loader-Datei

Da VitePress ein statischer Website-Generator ist, müssen die möglichen Seitenpfade zur Build-Zeit feststehen. Daher **muss** eine dynamische Routenseite von einer **Paths-Loader-Datei** begleitet werden. For `packages/[pkg].md`, we will need `packages/[pkg].paths.js` (`.ts` is also supported):

```
.
└─ packages
   ├─ [pkg].md         # Routenvorlage
   └─ [pkg].paths.js   # Loader für Routenpfade
```

Der Paths Loader sollte ein Objekt mit einer Methode `paths` als Standardexport bereitstellen. Die Methode `paths` sollte ein Array von Objekten mit einer Eigenschaft `params` zurückgeben. Jedes dieser Objekte erzeugt eine entsprechende Seite.

Given the following `paths` array:

```js
// packages/[pkg].paths.js
export default {
  paths() {
    return [
      { params: { pkg: 'foo' }},
      { params: { pkg: 'bar' }}
    ]
  }
}
```

Die erzeugten HTML-Seiten sind:

```
.
└─ packages
   ├─ foo.html
   └─ bar.html
```

### Typsicherer Loader mit `defineRoutes`

Wenn du TypeScript verwendest, kannst du den Loader mit `defineRoutes` aus `vitepress` umschließen, um Typ-Hinweise für Routen-Hooks wie `paths`, `watch` und `transformPageData` zu erhalten:

```ts
// packages/[pkg].paths.ts
import { defineRoutes } from 'vitepress'

export default defineRoutes({
  watch: ['../data/**/*.json'],
  async paths() {
    return [
      { params: { pkg: 'foo' } },
      { params: { pkg: 'bar' } }
    ]
  },
  async transformPageData(pageData) {
    pageData.title = `${pageData.title} · Packages`
  }
})
```

`defineRoutes` ist optional, wird beim Erstellen von `.paths.ts`-Dateien aber empfohlen.

### Mehrere Parameter

Eine dynamische Route kann mehrere Parameter enthalten:

**Dateistruktur**

```
.
└─ packages
   ├─ [pkg]-[version].md
   └─ [pkg]-[version].paths.js
```

**Paths Loader**

```js
export default {
  paths: () => [
    { params: { pkg: 'foo', version: '1.0.0' }},
    { params: { pkg: 'foo', version: '2.0.0' }},
    { params: { pkg: 'bar', version: '1.0.0' }},
    { params: { pkg: 'bar', version: '2.0.0' }}
  ]
}
```

**Ausgabe**

```
.
└─ packages
   ├─ foo-1.0.0.html
   ├─ foo-2.0.0.html
   ├─ bar-1.0.0.html
   └─ bar-2.0.0.html
```

### Pfade dynamisch erzeugen

Das Paths-Loader-Modul läuft in Node.js und wird nur zur Build-Zeit ausgeführt. Du kannst das `paths`-Array mit beliebigen lokalen oder entfernten Daten dynamisch erzeugen.

Pfade aus lokalen Dateien erzeugen:

```js
import fs from 'node:fs'

export default {
  paths() {
    return fs
      .readdirSync('packages')
      .map((pkg) => {
        return { params: { pkg }}
      })
  }
}
```

Pfade aus entfernten Daten erzeugen:

```js
export default {
  async paths() {
    const pkgs = await (await fetch('https://my-api.com/packages')).json()

    return pkgs.map((pkg) => {
      return {
        params: {
          pkg: pkg.name,
          version: pkg.version
        }
      }
    })
  }
}
```

### Vorlagen- und Datendateien überwachen

Wenn Seiteninhalte aus Vorlagen oder externen Datenquellen erzeugt werden, kannst du die Option `watch` verwenden, um Seiten während der Entwicklung automatisch neu zu erzeugen, wenn sich diese Dateien ändern:

```js
// posts/[slug].paths.js
import fs from 'node:fs'
import { renderTemplate } from './templates/renderer.js'

export default {
  // Änderungen an Vorlagendateien und Datenquellen überwachen
  watch: [
    './templates/**/*.njk',     // Vorlagendateien
    '../data/**/*.json'         // Datendateien
  ],

  paths(watchedFiles) {
    // watchedFiles ist ein Array mit den absoluten Pfaden der gefundenen Dateien
    // Datendateien lesen, um Routen zu erzeugen
    const dataFiles = watchedFiles.filter(file => file.endsWith('.json'))

    return dataFiles.map(file => {
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'))

      return {
        params: { slug: data.slug },
        content: renderTemplate(data)  // Use template to generate content
      }
    })
  }
}
```

Die Option `watch` funktioniert genauso wie bei [Data Loadern](./Daten-loading#Daten-from-local-files):

- Akzeptiert [Glob-Muster](https://github.com/mrmlnc/fast-glob#pattern-syntax) to match files
- Muster sind relativ zur `.paths.js`-Datei selbst
- Änderungen an überwachten Dateien lösen während der Entwicklung eine Seitengenerierung und HMR aus
- In Produktions-Builds werden alle Seiten unabhängig von der `watch`-Konfiguration einmal erzeugt

### Auf Parameter in Seiten zugreifen

Du kannst die Parameter verwenden, um jeder Seite zusätzliche Daten zu übergeben. The Markdown route file can access the current page params in Vue expressions via the `$params` global property:

```md
- package name: {{ $params.pkg }}
- version: {{ $params.version }}
```

Du kannst außerdem über die [`useData`](../reference/runtime-api#usedata) Runtime API auf die Parameter der aktuellen Seite zugreifen. Dies ist sowohl in Markdown-Dateien als auch in Vue-Komponenten verfügbar:

```vue
<script setup>
import { useData } from 'vitepress'

// params is a Vue ref
const { params } = useData()

console.log(params.value)
</script>
```

### Rohinhalt rendern

An die Seite übergebene Parameter werden in der JavaScript-Nutzlast des Clients serialisiert. Daher solltest du vermeiden, große Datenmengen als Parameter zu übergeben, beispielsweise rohes Markdown oder HTML aus einem entfernten CMS.

Stattdessen kannst du solche Inhalte jeder Seite über die Eigenschaft `content` des jeweiligen Pfadobjekts übergeben: `content` property on each path object:

```js
export default {
  async paths() {
    const posts = await (await fetch('https://my-cms.com/blog-posts')).json()

    return posts.map((post) => {
      return {
        params: { id: post.id },
        content: post.content // raw Markdown or HTML
      }
    })
  }
}
```

Verwende anschließend die folgende spezielle Syntax, um den Inhalt als Teil der Markdown-Datei selbst zu rendern:

```md
<!-- @content -->
```
