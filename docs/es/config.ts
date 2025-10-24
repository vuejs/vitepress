import { createRequire } from 'module'
import { defineAdditionalConfig, type DefaultTheme } from 'vitepress'

const require = createRequire(import.meta.url)
const pkg = require('vitepress/package.json')

export default defineAdditionalConfig({
  description: 'Generador de Sitios Estáticos desarrollado con Vite y Vue.',

  themeConfig: {
    nav: nav(),

    search: { options: searchOptions() },

    sidebar: {
      '/es/guide/': { base: '/es/guide/', items: sidebarGuide() },
      '/es/reference/': { base: '/es/reference/', items: sidebarReference() }
    },

    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
      text: 'Editar esta página en GitHub'
    },

    footer: {
      message: 'Liberado bajo la licencia MIT',
      copyright: 'Todos los derechos reservados © 2019-PRESENTE Evan You'
    },

    docFooter: {
      prev: 'Anterior',
      next: 'Siguiente'
    },

    outline: {
      label: 'En esta página'
    },

    lastUpdated: {
      text: 'Actualizado el'
    },

    notFound: {
      title: 'PÁGINA NO ENCONTRADA',
      quote:
        'Pero si no cambias de dirección y sigues buscando, podrías terminar donde te diriges.',
      linkLabel: 'ir a inicio',
      linkText: 'Llévame a inicio'
    },

    langMenuLabel: 'Cambiar Idioma',
    returnToTopLabel: 'Volver arriba',
    sidebarMenuLabel: 'Menu Lateral',
    darkModeSwitchLabel: 'Tema Oscuro',
    lightModeSwitchTitle: 'Cambiar a modo claro',
    darkModeSwitchTitle: 'Cambiar a modo oscuro',
    skipToContentLabel: 'Saltar al contenido'
  }
})

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: 'Guía',
      link: '/es/guide/what-is-vitepress',
      activeMatch: '/es/guide/'
    },
    {
      text: 'Referencia',
      link: '/es/reference/site-config',
      activeMatch: '/es/reference/'
    },
    {
      text: pkg.version,
      items: [
        {
          text: '1.6.4',
          link: 'https://vuejs.github.io/vitepress/v1/es/'
        },
        {
          text: 'Registro de cambios',
          link: 'https://github.com/vuejs/vitepress/blob/main/CHANGELOG.md'
        },
        {
          text: 'Contribuir',
          link: 'https://github.com/vuejs/vitepress/blob/main/.github/contributing.md'
        }
      ]
    }
  ]
}

function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Introducción',
      collapsed: false,
      items: [
        { text: '¿Qué es VitePress？', link: 'what-is-vitepress' },
        { text: 'Iniciando', link: 'getting-started' },
        { text: 'Enrutamiento', link: 'routing' },
        { text: 'Despliegue', link: 'deploy' }
      ]
    },
    {
      text: 'Escribiendo',
      collapsed: false,
      items: [
        { text: 'Extensiones Markdown', link: 'markdown' },
        { text: 'Manejo de assets', link: 'asset-handling' },
        { text: 'Frontmatter', link: 'frontmatter' },
        { text: 'Usando Vue en Markdown', link: 'using-vue' },
        { text: 'Internacionalización', link: 'i18n' }
      ]
    },
    {
      text: 'Pesonalización',
      collapsed: false,
      items: [
        { text: 'Usando un tema personalizado', link: 'custom-theme' },
        {
          text: 'Extendiendo el tema por defecto',
          link: 'extending-default-theme'
        },
        {
          text: 'Carga de datos en tiempo de compilación',
          link: 'data-loading'
        },
        { text: 'Compatibilidad SSR', link: 'ssr-compat' },
        { text: 'Conectando a un CMS', link: 'cms' }
      ]
    },
    {
      text: 'Experimental',
      collapsed: false,
      items: [
        { text: 'Modo MPA', link: 'mpa-mode' },
        { text: 'Generación de Sitemap', link: 'sitemap-generation' }
      ]
    },
    {
      text: 'Configuración y Referencia de la API',
      base: '/es/reference/',
      link: 'site-config'
    }
  ]
}

function sidebarReference(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Referencia',
      items: [
        { text: 'Configuración del sitio', link: 'site-config' },
        { text: 'Configuración Frontmatter', link: 'frontmatter-config' },
        { text: 'API de tiempo de ejecución', link: 'runtime-api' },
        { text: 'CLI', link: 'cli' },
        {
          text: 'Tema por defecto',
          base: '/es/reference/default-theme-',
          items: [
            { text: 'Visión general', link: 'config' },
            { text: 'Navegación', link: 'nav' },
            { text: 'Barra Lateral', link: 'sidebar' },
            { text: 'Página Inicial', link: 'home-page' },
            { text: 'Pie de página', link: 'footer' },
            { text: 'Layout', link: 'layout' },
            { text: 'Distintivo', link: 'badge' },
            { text: 'Página del equipo', link: 'team-page' },
            { text: 'Links Anterior / Siguiente', link: 'prev-next-links' },
            { text: 'Editar Link', link: 'edit-link' },
            { text: 'Sello temporal de actualización', link: 'last-updated' },
            { text: 'Búsqueda', link: 'search' },
            { text: 'Carbon Ads', link: 'carbon-ads' }
          ]
        }
      ]
    }
  ]
}

function searchOptions(): Partial<DefaultTheme.AlgoliaSearchOptions> {
  return {
    placeholder: 'Buscar documentos',
    translations: {
      button: {
        buttonText: 'Buscar',
        buttonAriaLabel: 'Buscar'
      },
      modal: {
        searchBox: {
          clearButtonTitle: 'Limpiar búsqueda',
          clearButtonAriaLabel: 'Limpiar búsqueda',
          closeButtonText: 'Cerrar',
          closeButtonAriaLabel: 'Cerrar',
          placeholderText: undefined,
          placeholderTextAskAi: undefined,
          placeholderTextAskAiStreaming: 'Respondiendo...',
          backToKeywordSearchButtonText:
            'Volver a la búsqueda por palabras clave',
          backToKeywordSearchButtonAriaLabel:
            'Volver a la búsqueda por palabras clave'
        },
        startScreen: {
          recentSearchesTitle: 'Historial de búsqueda',
          noRecentSearchesText: 'Ninguna búsqueda reciente',
          saveRecentSearchButtonTitle: 'Guardar en el historial de búsqueda',
          removeRecentSearchButtonTitle: 'Borrar del historial de búsqueda',
          favoriteSearchesTitle: 'Favoritos',
          removeFavoriteSearchButtonTitle: 'Borrar de favoritos',
          recentConversationsTitle: 'Conversaciones recientes',
          removeRecentConversationButtonTitle:
            'Eliminar esta conversación del historial'
        },
        errorScreen: {
          titleText: 'No fue posible obtener resultados',
          helpText: 'Verifique su conexión de red'
        },
        noResultsScreen: {
          noResultsText: 'No fue posible encontrar resultados',
          suggestedQueryText: 'Puede intentar una nueva búsqueda',
          reportMissingResultsText:
            '¿Deberían haber resultados para esta consulta?',
          reportMissingResultsLinkText: 'Click para enviar feedback'
        },
        resultsScreen: {
          askAiPlaceholder: 'Preguntar a la IA: '
        },
        askAiScreen: {
          disclaimerText:
            'Las respuestas son generadas por IA y pueden contener errores. Verifica las respuestas.',
          relatedSourcesText: 'Fuentes relacionadas',
          thinkingText: 'Pensando...',
          copyButtonText: 'Copiar',
          copyButtonCopiedText: '¡Copiado!',
          copyButtonTitle: 'Copiar',
          likeButtonTitle: 'Me gusta',
          dislikeButtonTitle: 'No me gusta',
          thanksForFeedbackText: '¡Gracias por tu opinión!',
          preToolCallText: 'Buscando...',
          duringToolCallText: 'Buscando ',
          afterToolCallText: 'Búsqueda de',
          aggregatedToolCallText: 'Búsqueda de'
        },
        footer: {
          selectText: 'Seleccionar',
          submitQuestionText: 'Enviar pregunta',
          selectKeyAriaLabel: 'Tecla Enter',
          navigateText: 'Navegar',
          navigateUpKeyAriaLabel: 'Flecha arriba',
          navigateDownKeyAriaLabel: 'Flecha abajo',
          closeText: 'Cerrar',
          backToSearchText: 'Volver a la búsqueda',
          closeKeyAriaLabel: 'Tecla Escape',
          poweredByText: 'Búsqueda por'
        }
      }
    }
  }
}
