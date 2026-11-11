---
description: Ein statischer Website-Generator zum Erstellen schneller, inhaltsorientierter Websites auf Basis von Vite und Vue.
---

# Was ist VitePress?

VitePress ist ein [statischer Website-Generator](https://en.wikipedia.org/wiki/Static_site_generator) (SSG) zum Erstellen schneller, inhaltsorientierter Websites. Kurz gesagt nimmt VitePress deine in [Markdown](https://en.wikipedia.org/wiki/Markdown), geschriebenen Inhalte, wendet ein Theme darauf an und erzeugt statische HTML-Seiten, die sich nahezu überall bereitstellen lassen.

::: tip {no-title}
Du möchtest es einfach ausprobieren? Springe direkt zum [Schnellstart](./getting-started).
:::

## Anwendungsfälle

- **Dokumentation**

  VitePress enthält ein Standard-Theme für technische Dokumentation. Es wird für diese Seite und unter anderem für die Dokumentation von [Vite](https://vite.dev/), [Rollup](https://rollupjs.org/), [Pinia](https://pinia.vuejs.org/), [VueUse](https://vueuse.org/), [Vitest](https://vitest.dev/), [D3](https://d3js.org/), [UnoCSS](https://unocss.dev/), [Iconify](https://iconify.design/) und [viele weitere](https://github.com/search?q=/%22vitepress%22:+/+path:/(?:package%7Cdeno)%5C.jsonc?$/+NOT+is:fork+NOT+is:archived&type=code).

  Die [offizielle Vue.js-Dokumentation](https://vuejs.org/) basiert ebenfalls auf VitePress, verwendet jedoch ein eigenes Theme, das von mehreren Übersetzungen gemeinsam genutzt wird.

- **Blogs, Portfolios und Marketing-Websites**

  VitePress unterstützt [vollständig angepasste Themes](./custom-theme) mit der Entwicklererfahrung einer normalen Vite- und Vue-Anwendung. Da Vite die Grundlage bildet, kannst du außerdem direkt auf Vite-Plugins aus dessen umfangreichem Ökosystem zurückgreifen. Zusätzlich bietet VitePress flexible APIs zum [Daten laden](./data-loading) (lokal oder entfernt) und [dynamische Routen erzeugen](./routing#dynamic-routes). Damit kannst du nahezu alles erstellen, solange die benötigten Daten zur Erstellungszeit bestimmt werden können.

  Der offizielle [Vue.js-Blog](https://blog.vuejs.org/) ist ein einfacher Blog, der seine Indexseite auf Grundlage lokaler Inhalte erzeugt.

## Entwicklererfahrung

VitePress möchte eine hervorragende Developer Experience (DX) bei der Arbeit mit Markdown-Inhalten bieten.

- **[Vite-Powered:](https://vite.dev/)** sofortiger Serverstart, wobei Änderungen ohne Neuladen der Seite unmittelbar (<100 ms) sichtbar werden.

- **[Integrierte Markdown-Erweiterungen:](./markdown)** Frontmatter, Tabellen, Syntaxhervorhebung und vieles mehr. VitePress bietet insbesondere zahlreiche fortgeschrittene Funktionen für die Arbeit mit Codeblöcken und eignet sich dadurch besonders für hochtechnische Dokumentation.

- **[Vue-erweitertes Markdown:](./using-vue)** Jede Markdown-Seite ist dank der 100%igen Syntaxkompatibilität von Vue-Templates mit HTML auch eine Vue-[Single-File-Komponente](https://vuejs.org/guide/scaling-up/sfc.html). Du kannst mithilfe von Vue-Template-Funktionen oder importierten Vue-Komponenten Interaktivität in deine statischen Inhalte einbetten.

## Leistung

Anders als bei vielen herkömmlichen SSGs, bei denen jede Navigation ein vollständiges Neuladen der Seite auslöst, liefert eine mit VitePress erzeugte Website beim ersten Besuch statisches HTML aus und wird bei weiterer Navigation innerhalb der Website zu einer [Single-Page-Anwendung](https://en.wikipedia.org/wiki/Single-page_application) (SPA). Dieses Modell bietet unserer Ansicht nach ein ausgewogenes Verhältnis zwischen Leistung und Benutzerfreundlichkeit:

- **Schnelles erstes Laden**

  Beim ersten Aufruf einer beliebigen Seite wird statisches, vorgerendertes HTML ausgeliefert, um schnelle Ladezeiten und optimale SEO zu ermöglichen. Anschließend lädt die Seite ein JavaScript-Bundle, das die Seite in eine Vue-SPA („Hydration“) umwandelt. Entgegen der verbreiteten Annahme, dass die Hydration von SPAs langsam sei, ist dieser Vorgang dank der hohen Leistung von Vue 3 und der Compiler-Optimierungen sehr schnell. Auf [PageSpeed Insights](https://pagespeed.web.dev/report?url=https%3A%2F%2Fvitepress.dev%2F) erreichen typische VitePress-Websites selbst auf leistungsschwachen Mobilgeräten mit langsamer Verbindung nahezu perfekte Leistungswerte.

- **Schnelle Navigation nach dem Laden**

  Noch wichtiger ist, dass das SPA-Modell **nach** dem ersten Laden zu einer besseren Benutzererfahrung führt. Bei der weiteren Navigation innerhalb der Website wird die Seite nicht mehr vollständig neu geladen. Stattdessen wird der Inhalt der Zielseite abgerufen und dynamisch aktualisiert. VitePress lädt außerdem automatisch Seitenabschnitte für Links vor, die sich im sichtbaren Bereich befinden. In den meisten Fällen fühlt sich die Navigation nach dem Laden sofort an.

- **Interaktivität ohne Nachteile**

  Damit die in statisches Markdown eingebetteten dynamischen Vue-Teile hydratisiert werden können, wird jede Markdown-Seite als Vue-Komponente verarbeitet und in JavaScript kompiliert. Das mag ineffizient klingen, aber der Vue-Compiler kann statische und dynamische Teile voneinander trennen und dadurch sowohl die Kosten der Hydration als auch die Größe der Nutzlast minimieren. Beim ersten Laden der Seite werden die statischen Teile automatisch aus der JavaScript-Nutzlast entfernt und während der Hydration übersprungen.

## Und was ist mit VuePress?

VitePress ist der Nachfolger von VuePress 1. Das ursprüngliche VuePress 1 basierte auf Vue 2 und webpack. Mit Vue 3 und Vite im Hintergrund bietet VitePress eine deutlich bessere Entwicklererfahrung, bessere Leistung in der Produktion, ein ausgereifteres Standard-Theme und eine flexiblere API zur Anpassung.

Die API-Unterschiede zwischen VitePress und VuePress 1 liegen hauptsächlich beim Theming und bei der Anpassung. Wenn du VuePress 1 mit dem Standard-Theme verwendest, sollte die Migration zu VitePress relativ unkompliziert sein.

Die parallele Pflege zweier SSGs ist langfristig nicht sinnvoll. Daher hat das Vue-Team beschlossen, sich langfristig auf VitePress als empfohlenes SSG zu konzentrieren. VuePress 1 ist inzwischen veraltet, und VuePress 2 wurde zur weiteren Entwicklung und Pflege an das VuePress-Community-Team übergeben.
