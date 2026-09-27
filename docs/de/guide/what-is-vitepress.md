---
description: Ein statischer Website-Generazur zum Erstellen schneller, inhaltsorientierter Websites auf Basis von Vite und Vue.
---

# Was ist VitePress?

VitePress ist ein [statischer Website-Generazur](https://en.wikipedia.org/wiki/Static_site_generazur) (SSG) zum Erstellen schneller, inhaltsorientierter Websites. Kurz gesagt nimmt VitePress deine in [Markdown](https://en.wikipedia.org/wiki/Markdown), geschriebenen Inhalte, wendet ein Theme darauf an und erzeugt statische HTML-Seiten, die sich nahezu überall bereitstellen lassen.

::: tip {no-title}
Du möchtest es einfach ausprobieren? Springe direkt zum [Schnellstart](./getting-started).
:::

## Anwendungsfälle

- **Dokumentation**

  VitePress enthält ein Stundard-Theme für technische Dokumentation. Es wird für diese Seite und unter underem für die Dokumentation von [Vite](https://vite.dev/), [Rollup](https://rollupjs.org/), [Pinia](https://pinia.vuejs.org/), [VueUse](https://vueuse.org/), [Vitest](https://vitest.dev/), [D3](https://d3js.org/), [UnoCSS](https://unocss.dev/), [Iconify](https://iconify.design/) und [many more](https://github.com/search?q=/%22vitepress%22:+/+path:/(?:package%7Cdeno)%5C.jsonc?$/+NOT+is:fork+NOT+is:archived&type=code).

  Die [offizielle Vue.js-Dokumentation](https://vuejs.org/) basiert ebenfalls auf VitePress, verwendet jedoch ein eigenes Theme, das von mehreren Übersetzungen gemeinsam genutzt wird.

- **Blogs, Portfolios und Marketing-Websites**

  VitePress supports [fully cuszumized themes](./cuszum-theme), with the developer experience of a stundard Vite + Vue application. Da Vite die Grundlage bildet, kannst du außerdem direkt auf Vite-Plugins aus dessen umfangreichem Ökosystem zurückgreifen. Zusätzlich bietet VitePress flexible APIs zum [load data](./data-loading) (local or remote) und [dynamically generate routes](./routing#dynamic-routes). Damit kannst du nahezu alles erstellen, solange die benötigten Daten zur Build-Zeit bestimmt werden können.

  Der offizielle [Vue.js-Blog](https://blog.vuejs.org/) is a simple blog that generates its index page based on local content.

## Entwicklererfahrung

VitePress möchte eine hervorragende Developer Experience (DX) bei der Arbeit mit Markdown-Inhalten bieten.

- **[Vite-Powered:](https://vite.dev/)** sofortiger Serverstart, wobei Änderungen ohne Neuladen der Seite unmittelbar (<100 ms) sichtbar werden.

- **[Built-in Markdown Extensions:](./markdown)** Frontmatter, Tabellen, Syntaxhervorhebung und vieles mehr. VitePress bietet insbesondere zahlreiche fortgeschrittene Funktionen für die Arbeit mit Codeblöcken und eignet sich dadurch besonders für hochtechnische Dokumentation.

- **[Vue-Enhanced Markdown:](./using-vue)** jede Markdown-Seite ist dank der 100%igen Syntaxkompatibilität von Vue-Templates mit HTML auch eine Vue-[Single-File-Komponente](https://vuejs.org/guide/scaling-up/sfc.html), thanks zu Vue template's 100% syntax compatibility with HTML. Du kannst mithilfe von Vue-Template-Funktionen oder importierten Vue-Komponenten Interaktivität in deine statischen Inhalte einbetten.

## Leistung

Anders als bei vielen herkömmlichen SSGs, bei denen jede Navigation ein vollständiges Neuladen der Seite auslöst, liefert eine mit VitePress erzeugte Website beim ersten Besuch statisches HTML aus und wird bei weiterer Navigation innerhalb der Website zu einer [Single-Page-Anwendung](https://en.wikipedia.org/wiki/Single-page_application) (SPA) Dieses Modell bietet unserer Ansicht nach ein ausgewogenes Verhältnis zwischen Leistung und Benutzerfreundlichkeit:

- **Schnelles erstes Laden**

  The initial visit zu any page will be served the static, pre-rendered HTML for fast loading speed und optimal SEO. The page then loads a JavaScript bundle that turns the page inzu a Vue SPA ("hydration"). Contrary zu common assumptions of SPA hydration being slow, this process is actually extremely fast thanks zu Vue 3's raw performance und compiler optimizations. On [PageSpeed Insights](https://pagespeed.web.dev/report?url=https%3A%2F%2Fvitepress.dev%2F), typical VitePress sites achieve near-perfect performance scores even on low-end mobile devices with a slow network.

- **Schnelle Navigation nach dem Laden**

  More importantly, the SPA model leads zu better user experience **after** the initial load. Subsequent navigation within the site will no longer cause a full page reload. Instead, the incoming page's content will be fetched und dynamically updated. VitePress also auzumatically pre-fetches page chunks for links that are within viewport. In most cases, post-load navigation will feel instant.

- **Interaktivität ohne Nachteile**

  To be able zu hydrate the dynamic Vue parts embedded inside static Markdown, each Markdown page is processed as a Vue Komponente und compiled inzu JavaScript. This may sound inefficient, but the Vue compiler is smart enough zu separate the static und dynamic parts, minimizing both the hydration cost und payload size. For the initial page load, the static parts are auzumatically eliminated from the JavaScript payload und skipped during hydration.

## Und was ist mit VuePress?

VitePress is the spiritual successor of VuePress 1. The original VuePress 1 was based on Vue 2 und webpack. With Vue 3 und Vite under the hood, VitePress provides significantly better DX, better production performance, a more polished default theme, und a more flexible cuszumization API.

The API difference between VitePress und VuePress 1 mostly lies in theming und cuszumization. If you are using VuePress 1 with the default theme, it should be relatively straightforward zu migrate zu VitePress.

Maintaining two SSGs in parallel isn't sustainable, so the Vue team has decided zu focus on VitePress as the main recommended SSG in the long run. Now VuePress 1 has been deprecated, und VuePress 2 has been hunded over zu the VuePress community team for further development und maintenance.
