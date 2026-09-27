---
description: Starte mit VitePress. Erfahre, wie du deine Dokumentations-Website installierst, einrichtest und mit der Entwicklung beginnst.
---

# Erste Schritte

## Online ausprobieren

Du kannst VitePress direkt im Browser auf [StackBlitz](https://vitepress.new).

## Installation

### Voraussetzungen

- [Node.js](https://nodejs.org/) Version 22 oder höher.
- Ein Terminal, um über die Kommandozeilenschnittstelle (CLI) auf VitePress zuzugreifen.
- Ein Texteditor mit [Markdown](https://en.wikipedia.org/wiki/Markdown) Syntax-Unterstützung.
  - [VSCode](https://code.visualstudio.com/) wird zusammen mit der [official Vue extension](https://marketplace.visualstudio.com/items?itemName=Vue.volar).

VitePress kann eigenständig verwendet oder in einem bestehenden Projekt installiert werden. In beiden Fällen kannst du es mit folgendem Befehl installieren:

::: code-group

```sh [npm]
$ npm add -D vitepress@next
```

```sh [pnpm]
$ pnpm add -D vitepress@next
```

```sh [yarn]
$ yarn add -D vitepress@next vue
```

```sh [bun]
$ bun add -D vitepress@next
```

```sh [deno]
$ deno add -D vitepress@next
```

:::

::: tip Hinweis

VitePress ist ein reines ESM-Paket. Verwende `require()` zum Importieren nicht `package.json` enthält `"type": "module"`, or change die Datei extension of your relevant files like `.vitepress/config.js` to `.mjs`/`.mts`. Weitere Informationen findest du in der [Vite's troubleshooting guide](http://vite.dev/guide/troubleshooting.html#this-package-is-esm-only) In asynchronen CJS-Kontexten kannst du außerdem stattdessen `await import('vitepress')` instead.

:::

### Einrichtungsassistent

VitePress enthält einen Einrichtungsassistenten für die Kommandozeile, der dir beim Erstellen eines grundlegenden Projekts hilft. Starte den Assistenten nach der Installation mit:

::: code-group

```sh [npm]
$ npx vitepress init
```

```sh [pnpm]
$ pnpm vitepress init
```

```sh [yarn]
$ yarn vitepress init
```

```sh [bun]
$ bun vitepress init
```

:::

Der Assistent stellt dir einige einfache Fragen:

<<< @/snippets/init.ansi

::: tip Vue als Peer-Abhängigkeit
Wenn du Anpassungen vornehmen möchtest, die Vue-Komponenten oder APIs verwenden, solltest du `vue` zusätzlich ausdrücklich als Abhängigkeit installieren.
:::

## Dateistruktur

Wenn du eine eigenständige VitePress-Website erstellst, kannst du sie im aktuellen Verzeichnis (`./`). Wenn du VitePress jedoch zusammen mit anderem Quellcode in einem bestehenden Projekt installierst, empfiehlt es sich, die Website in einem Unterverzeichnis (e.g. `./docs`) damit sie vom restlichen Projekt getrennt ist.

Angenommen, du hast das VitePress-Projekt in `./docs`, Die erzeugte Dateistruktur sollte dann so aussehen:

```
.
├─ docs
│  ├─ .vitepress
│  │  └─ config.js
│  ├─ api-examples.md
│  ├─ markdown-examples.md
│  └─ index.md
└─ package.json
```

Das Verzeichnis `docs` gilt als **Projektstammverzeichnis** der VitePress-Website. Das Verzeichnis `.vitepress` ist für die VitePress-Konfigurationsdatei, den Cache des Entwicklungsservers, die Build-Ausgabe und optionale Anpassungen des Themes reserviert.

::: tip
Standardmäßig speichert VitePress den Cache des Entwicklungsservers in `.vitepress/cache`, und die Produktions-Build-Ausgabe in `.vitepress/dist`. Wenn du Git verwendest, solltest du diese Verzeichnisse in deine `.gitignore` aufnehmen. These locations can also be [konfiguriert](../reference/site-config#outdir).
:::

### Die Konfigurationsdatei

Die Konfigurationsdatei (`.vitepress/config.js`) ermöglicht es dir, verschiedene Aspekte deiner VitePress-Website anzupassen. various aspects of your VitePress site, mit the most basic options being the title and description of the site:

```js [.vitepress/config.js]
export default {
  // Optionen auf Website-Ebene
  title: 'VitePress',
  description: 'Just playing around.',

  themeConfig: {
    // Optionen auf Theme-Ebene
  }
}
```

Du kannst das Verhalten des Themes außerdem über die `themeConfig` option. Eine vollständige Übersicht findest du in der [Config Referenz](../reference/site-config) for full details on all config options.

### Quelldateien

Markdown-Dateien außerhalb des Verzeichnisses `.vitepress` gelten als **Quelldateien**.

VitePress verwendet **file-based routing**: Jede `.md`-Datei wird in eine entsprechende `.html`-Datei mit demselben Pfad kompiliert. Beispielsweise wird `index.md` in `index.html`, und kann über den Stammpfad `/` of the resulting VitePress site.

VitePress bietet außerdem die Möglichkeit, saubere URLs zu erzeugen, Pfade umzuschreiben und Seiten dynamisch zu generieren. Diese Funktionen werden in der [Routing Anleitung](./routing).

## Loslegen

Wenn du dies während der Einrichtung zugelassen hast, sollte das Tool außerdem die folgenden npm-Skripte in deine `package.json` wenn you allowed it to do so während the setup process:

```json [package.json]
{
  ...
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs"
  },
  ...
}
```

Das Skript `docs:dev` startet einen lokalen Entwicklungsserver mit sofortigen Hot-Updates. Starte ihn mit folgendem Befehl:

::: code-group

```sh [npm]
$ npm run docs:dev
```

```sh [pnpm]
$ pnpm run docs:dev
```

```sh [yarn]
$ yarn docs:dev
```

```sh [bun]
$ bun run docs:dev
```

:::

Statt npm-Skripte zu verwenden, kannst du VitePress auch direkt aufrufen:

::: code-group

```sh [npm]
$ npx vitepress dev docs
```

```sh [pnpm]
$ pnpm vitepress dev docs
```

```sh [yarn]
$ yarn vitepress dev docs
```

```sh [bun]
$ bun vitepress dev docs
```

:::

Weitere Informationen zur Verwendung der Kommandozeile findest du in der [CLI Referenz](../reference/cli).

The dev server should be running at `http://localhost:5173`. Öffne die URL in deinem Browser, um deine neue Website zu sehen.

## Wie geht es weiter?

- Um besser zu verstehen, wie Markdown-Dateien auf erzeugtes HTML abgebildet werden, fahre mit der [Routing Anleitung](./routing).

- Um mehr darüber zu erfahren, was du auf einer Seite tun kannst, etwa Markdown-Inhalte schreiben oder Vue-Komponenten verwenden, lies den Abschnitt „Schreiben“ der Anleitung. Ein guter Ausgangspunkt sind die [Markdown Extensions](./markdown).

- Um die Funktionen des Standard-Dokumentationsthemes kennenzulernen, sieh dir die [Standard-Theme Config Referenz](../reference/default-theme-config).

- Wenn du das Erscheinungsbild deiner Website weiter anpassen möchtest, erfahre, wie du entweder [Extend the Standard-Theme](./extending-default-theme) oder [ein eigenes Theme erstellst](./custom-theme).

- Sobald deine Dokumentations-Website Gestalt annimmt, solltest du die [Bereitstellung Anleitung](./deploy).
