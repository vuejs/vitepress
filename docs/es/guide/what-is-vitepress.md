# Qué es VitePress? {#what-is-vitepress}

VitePress es un [Generador de Sitios Estáticos](https://en.wikipedia.org/wiki/Static_site_generator) (SSG) proyectado para crear sitios rápidos y centrados en contenido. En suma, VitePress utiliza su contenido fuente escrito en [Markdown](https://en.wikipedia.org/wiki/Markdown), aplica un tema a el y genera páginas HTML estáticas que pueden ser facilmente implantadas en cualquier lugar.

<div class="tip custom-block" style="padding-top: 8px">
  
Quiere apenas experimentar? Valla al [Início Rápido](./getting-started).

</div>

## Casos de Uso {#use-cases}

- **Documentación**

  VitePress viene con un tema por defecto proyectado para documentación técnica. El alimenta esta página que está leyendo ahora, juntamente con la documentación [Vite](https://vitejs.dev/), [Rollup](https://rollupjs.org/), [Pinia](https://pinia.vuejs.org/), [VueUse](https://vueuse.org/), [Vitest](https://vitest.dev/), [D3](https://d3js.org/), [UnoCSS](https://unocss.dev/), [Iconify](https://iconify.design/) e [muchos otros](https://www.vuetelescope.com/explore?framework.slug=vitepress).

  La [documentación oficial Vue.js](https://vuejs.org/) también está basada en VitePress, pero usa un tema personalizado compartido entre varias traducciones.

- **Blogs, Portfólios y sitios de Marketing**

  VitePress soporta [temas totalmente personalizables](./custom-theme), con la experiencia de desarrollador por defecto de una aplicaciónn Vite + Vue. La construcción con Vite significa que puede aprovechar directamente plugins Vite de su rico ecosistema. Adicionalmente, VitePress proporciona APIs flexibles para[cargar datos](./data-loading) (locales o remotos) y [generar rutas dinámicamente](./routing#dynamic-routes). Puede usarlo para construir practicamente cualquier cosa desde que los datos puedan ser determinados en el momento del build.

  El [blog oficial Vue.js](https://blog.vuejs.org/) es un blog simple que genera su página inicial basada en contenido local.

## Experiencia de Desarrollador {#developer-experience}

VitePress visa proporcionar excelente Experiencia de Desarrollador (DX) al trabajar con contenido en Markdown.

- **[Alimentado por Vite:](https://vitejs.dev/)** inicialización instantánea del servidor, con ediciones siempre reflejadas instantáneamente (<100ms) sin recarga de página.

- **[Extensiones Markdown Integradas:](./markdown)** Frontmatter, tablas, destaque de sintaxis... usted escoje. Especificamente, VitePress proporciona muchos recursos para trabajar con bloques de código, tornandolo ideal para documentación altamente técnica.

- **[Markdown Mejorado por Vue:](./using-vue)** cada página Markdown es también un [Componente de Archivo único](https://pt.vuejs.org/guide/scaling-up/sfc.html), gracias a la compatibilidad de sintaxis de 100% del template Vue con HTML. Puede también incorporar iteractividad con su contenido estático usando recursos de template Vue o componentes Vue importados.

## Desempeño {#performance}

Al contrario de muchos SSGs tradicionales, un sitio generado por VitePress es la verdad una [Single Page Application](https://en.wikipedia.org/wiki/Single-page_application) (SPA).

- **Carga Inicial Rápida**

  La visita inicial a cualquier página será servida con el HTML estático pré-renderizado para velocidad de carga rápida y SEO optimizado. La página entonces carga un paquete JavaScript que transforma la página en una SPA Vue ("hidratación"). El proceso de hidratación es extremadamente rápido: en [PageSpeed Insights](https://pagespeed.web.dev/report?url=https%3A%2F%2Fvitepress.dev%2F), sitios típicos VitePress alcanzan puntuaciones de desempeño casi perfectas, incluso en dispositivos móbiles de bajo desempeño con una red lenta.

- **Navegación Rápida pos-carga**

  Más importante todavía, el modelo SPA lleva a una mejor experiencia del usuario **después** de la carga inicial. La navegación subsequente dentro del sitio no causará una recarga adicional completa de la página. En vez de eso, el contenido de la página de entrada será buscado y actualizado dinámicamente. VitePress también pre-carga automáticamente pedazos de página para links que están dentro del viewport. En la mayoría de los casos, la navegación pos-carga parecerá instantánea.

- **Interactividad Sin Penalidades**

  Para ser capaz de hidratar las partes dinámicas Vue incorporadas dentro del Markdown estático, cada página Markdown es procesada como un componente Vue y compilada en JavaScript. Esto puede parecer ineficiente, pero el compilador Vue es suficientemente inteligente para separar las partes estáticas y dinámicas, minimizando tanto el costo de hidratación así como el tamaño de carga. Para la carga inicial de la página, las partes estáticas son automáticamente eliminadas de la carga JavaScript y omitidas durante la hidratación.

## Y VuePress? {#what-about-vuepress}

VitePress es el sucesor espiritual de VuePress. VuePress era orginalmente basado en Vue 2 y webpack. Con Vue 3 y Vite, VitePress ofrece una experiencia de desarrollador significamente mejor, mejor desempeño en producción, un tema por defecto más pulido y un API de personalización más flexible.

A diferencia del API entre VitePress y VuePress reside principalmente en temas y personalización. Si estuviera usando VuePress 1 con el tema por defecto, la migración para VitePress debe ser relativamente simple.

También hubo esfuerzo invertido en VuePress 2, que también soporta Vue 3 y Vite con mejor compatibilidad que con VuePress 1. Sin embargo, mantener dos SSGs en paralelo no es sustentable, entonces el equipo Vue decidió enfocarse en VitePress como el principal SSG recomendado a largo plazo.
