# O que é VitePress? {#what-is-vitepress}

O VitePress é um [Gerador de Site Estático](https://en.wikipedia.org/wiki/Static_site_generator) (SSG) projetado para criar sites rápidos e centrados em conteúdo. Em suma, VitePress utiliza seu conteúdo-fonte escrito em [Markdown](https://en.wikipedia.org/wiki/Markdown), aplica um tema a ele e gera páginas HTML estáticas que podem ser facilmente implantadas em qualquer lugar.

<div class="tip custom-block" style="padding-top: 8px">

Quer apenas experimentar? Pule para o [Início Rápido](./getting-started).

</div>

## Casos de Uso {#use-cases}

- **Documentação**

  VitePress vem com um tema padrão projetado para documentação técnica. Ele alimenta esta página que você está lendo agora, juntamente com a documentação [Vite](https://vitejs.dev/), [Rollup](https://rollupjs.org/), [Pinia](https://pinia.vuejs.org/), [VueUse](https://vueuse.org/), [Vitest](https://vitest.dev/), [D3](https://d3js.org/), [UnoCSS](https://unocss.dev/), [Iconify](https://iconify.design/) e [muitos outros](https://www.vuetelescope.com/explore?framework.slug=vitepress).

  A [documentação oficial Vue.js](https://vuejs.org/) também é baseada em VitePress, mas usa um tema personalizado compartilhado entre várias traduções.

- **Blogs, Portfólios e Sites de Marketing**

  VitePress suporta [temas totalmente personalizáveis](./custom-theme), com a experiência de desenvolvedor padrão de uma aplicação Vite + Vue. A construção com Vite significa que você pode aproveitar diretamente plugins Vite de seu rico ecossistema. Adicionalmente, VitePress fornece APIs flexíveis para [carregar dados](./data-loading) (locais ou remotos) e [gerar rotas dinamicamente](./routing#dynamic-routes). Você pode usá-lo para construir praticamente qualquer coisa desde que os dados possam ser determinados no momento da construção.

  O [blog oficial Vue.js](https://blog.vuejs.org/) é um blog simples que gera sua página inicial baseada em conteúdo local.

## Experiência de Desenvolvedor {#developer-experience}

VitePress visa proporcionar excelente Experiência de Desenvolvedor (DX) ao trabalhar com conteúdo em Markdown.

- **[Alimentado por Vite:](https://vitejs.dev/)** inicialização instantânea do servidor, com edições sempre refletidas instantaneamente (<100ms) sem recarregamento de página.

- **[Extensões Markdown Integradas:](./markdown)** Frontmatter, tabelas, destaque de sintaxe... você escolhe. Especificamente, VitePress fornece muitos recursos avançados para trabalhar com blocos de código, tornando-o ideal para documentação altamente técnica.

- **[Markdown Aprimorado por Vue:](./using-vue)** cada página Markdown é também um [Componente de Arquivo Único Vue](https://pt.vuejs.org/guide/scaling-up/sfc.html), graças à compatibilidade de sintaxe de 100% do template Vue com HTML. Você pode incorporar interatividade em seu conteúdo estático usando recursos de template Vue ou componentes Vue importados.

## Desempenho {#performance}

Ao contrário de muitos SSGs tradicionais, um site gerado pelo VitePress é na verdade uma [Aplicação de Página Única](https://en.wikipedia.org/wiki/Single-page_application) (SPA).

- **Carregamento Inicial Rápido**

  A visita inicial a qualquer página será servida com o HTML estático pré-renderizado para velocidade de carregamento rápida e SEO otimizado. A página então carrega um pacote JavaScript que transforma a página em uma SPA Vue ("hidratação"). O processo de hidratação é extremamente rápido: no [PageSpeed Insights](https://pagespeed.web.dev/report?url=https%3A%2F%2Fvitepress.dev%2F), sites típicos VitePress alcançam pontuações de desempenho quase perfeitas, mesmo em dispositivos móveis de baixo desempenho com uma rede lenta.

- **Navegação Rápida pós-carregamento**

  Mais importante ainda, o modelo SPA leva a uma melhor experiência do usuário **após** o carregamento inicial. A navegação subsequente dentro do site não causará mais uma recarga completa da página. Em vez disso, o conteúdo da página de entrada será buscado e atualizado dinamicamente. VitePress também pré-carrega automaticamente pedaços de página para links que estão dentro do viewport. Na maioria dos casos, a navegação pós-carregamento parecerá instantânea.

- **Interatividade Sem Penalidades**

  Para ser capaz de hidratar as partes dinâmicas Vue incorporadas dentro do Markdown estático, cada página Markdown é processada como um componente Vue e compilada em JavaScript. Isso pode parecer ineficiente, mas o compilador Vue é inteligente o suficiente para separar as partes estáticas e dinâmicas, minimizando tanto o custo de hidratação quanto o tamanho da carga. Para o carregamento inicial da página, as partes estáticas são automaticamente eliminadas da carga JavaScript e puladas durante a hidratação.

## E o VuePress? {#what-about-vuepress}

VitePress é o sucessor espiritual de VuePress. VuePress era orginalmente baseado em Vue 2 e webpack. Com Vue 3 e Vite, VitePress oferece uma experiência de desenvolvedor significativamente melhor, melhor desempenho em produção, um tema padrão mais polido e uma API de personalização mais flexível.

A diferença da API entre VitePress e VuePress reside principalmente em temas e personalização. Se você estiver usando VuePress 1 com o tema padrão, a migração para VitePress deve ser relativamente simples.

Também houve esforço investido em VuePress 2, que também suporta Vue 3 e Vite com melhor compatibilidade do que VuePress 1. No entanto, manter dois SSGs em paralelo não é sustentável, então a equipe Vue decidiu focar em VitePress como o principal SSG recomendado a longo prazo.
