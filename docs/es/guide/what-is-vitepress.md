# ¿Qué es VitePress? {#what-is-vitepress}

VitePress es un [Generador de Sitios Estáticos](https://en.wikipedia.org/wiki/Static_site_generator) (SSG) diseñado para construir sitios web rápidos y enfocados en el contenido. En pocas palabras, VitePress toma tu contenido fuente escrito en [Markdown](https://en.wikipedia.org/wiki/Markdown), le aplica un tema y genera páginas HTML estáticas que se pueden desplegar fácilmente en cualquier lugar.

<div class="tip custom-block" style="padding-top: 8px">
  
¿Quieres probarlo? Ve directo al [Inicio Rápido](./getting-started).

</div>

## Casos de Uso {#use-cases}

- **Documentación**

  VitePress incluye un tema por defecto diseñado para documentación técnica. Este tema es el que se utiliza en la página que estás leyendo ahora, así como en la documentación de [Vite](https://vitejs.dev/), [Rollup](https://rollupjs.org/), [Pinia](https://pinia.vuejs.org/), [VueUse](https://vueuse.org/), [Vitest](https://vitest.dev/), [D3](https://d3js.org/), [UnoCSS](https://unocss.dev/), [Iconify](https://iconify.design/) y [muchos otros](https://github.com/search?q=/%22vitepress%22:+/+path:/(?:package%7Cdeno)%5C.jsonc?$/+NOT+is:fork+NOT+is:archived&type=code).

  La [documentación oficial Vue.js](https://vuejs.org/) también está basada en VitePress, pero utiliza un tema personalizado compartido entre varias traducciones.

- **Blogs, Portfolios y sitios de Marketing**

  VitePress soporta [temas completamente personalizables](./custom-theme), con la experiencia de desarrollo de una aplicación estándar de Vite + Vue. Al estar construido sobre Vite, también puedes aprovechar directamente los plugins de su rico ecosistema. Adicionalmente, VitePress proporciona APIs flexibles para [cargar datos](./data-loading) (locales o remotos) y [generar rutas dinámicamente](./routing#dynamic-routes). Puedes usarlo para construir prácticamente cualquier cosa, siempre y cuando los datos puedan ser determinados en el momento de la construcción.

  El [blog oficial Vue.js](https://blog.vuejs.org/) es un blog simple que genera su página de inicio basándose en contenido local.

## Experiencia de Desarrollador {#developer-experience}

VitePress busca ofrecer una excelente Experiencia de Desarrollador (DX) al trabajar con contenido Markdown.

- **[Con tecnología Vite:](https://vitejs.dev/)** inicio instantáneo del servidor, con los cambios reflejados al instante (<100ms) sin recargar la página.

- **[Extensiones Markdown Integradas:](./markdown)** Frontmatter, tablas, destaque de sintaxis... tú decides. Específicamente, VitePress proporciona muchos recursos para trabajar con bloques de código, tornándolo ideal para documentación altamente técnica.

- **[Markdown Mejorado con Vue:](./using-vue)** cada página Markdown es también un [Componente de Archivo único](https://vuejs.org/guide/scaling-up/sfc.html) de Vue, gracias a la compatibilidad del 100% de la sintaxis de las plantillas de Vue con HTML.  Puedes incrustar interactividad en tu contenido estático usando las funciones de plantillas de Vue o componentes de Vue importados.

## Desempeño {#performance}

A diferencia de muchos SSG tradicionales donde cada navegación resulta en una recarga completa de la página, un sitio web generado por VitePress sirve HTML estático en la visita inicial, pero se convierte en una [Single Page Application](https://en.wikipedia.org/wiki/Single-page_application) (SPA) para las navegaciones posteriores dentro del sitio. Este modelo, en nuestra opinión, ofrece un equilibrio óptimo para el rendimiento:

- **Carga Inicial Rápida**

  La visita inicial a cualquier página será servida con el HTML estático pre-renderizado para una velocidad de carga rápida y SEO óptimo. La página entonces carga un paquete JavaScript que transforma la página en una SPA de Vue (a este proceso se le llama "hidratación"). A diferencia de la creencia popular de que la hidratación de una SPA es lenta, este proceso es de hecho extremadamente rápido gracias al rendimiento nativo y a las optimizaciones del compilador de Vue 3. En [PageSpeed Insights](https://pagespeed.web.dev/report?url=https%3A%2F%2Fvitepress.dev%2F), los sitios típicos VitePress alcanzan puntuaciones de desempeño casi perfectas, incluso en dispositivos móbiles de gama baja con una red lenta.

- **Navegación Rápida pos-carga**

  Más importante aún, el modelo SPA conduce a una mejor experiencia de usuario **después** de la carga inicial. Las navegaciones posteriores dentro del sitio ya no causarán una recarga completa de la página. En vez de eso, el contenido de la página a la que se accede se buscará y actualizará dinámicamente. VitePress también pre-carga automáticamente fragmentos de las páginas para los enlaces que están dentro del viewport. En la mayoría de los casos, la navegación pos-carga se sentirá instantánea.

- **Interactividad Sin Penalización**

  Para ser capaz de hidratar las partes dinámicas de Vue incrustadas dentro del Markdown estático, cada página Markdown es procesada como un componente Vue y compilada en JavaScript. Esto puede parecer ineficiente, pero el compilador de Vue es lo suficientemente inteligente como para separar las partes estáticas y dinámicas, minimizando tanto el costo de hidratación así como el tamaño de carga útil (payload). Para la carga inicial de la página, las partes estáticas son automáticamente eliminadas del payload de JavaScript y se omiten durante la hidratación.

## ¿Y VuePress? {#what-about-vuepress}

VitePress es el sucesor espiritual de VuePress. El VuePress original se basó en Vue 2 y webpack. Con Vue 3 y Vite como base, VitePress ofrece una Experiencia de Desarrollador (DX) significativamente mejor, un mejor rendimiento en producción, un tema por defecto más pulido y una API de personalización más flexible.

La diferencia entre la API de VitePress y VuePress radica principalmente en los temas y la personalización. Si estás usando VuePress 1 con el tema por defecto, debería ser relativamente sencillo migrar a VitePress.

También se ha invertido esfuerzo en VuePress 2, que también es compatible con Vue 3 y Vite, y tiene mayor compatibilidad con VuePress 1. Sin embargo, mantener dos SSG en paralelo no es sostenible, por lo que el equipo de Vue ha decidido centrarse en VitePress como el principal SSG recomendado a largo plazo.
