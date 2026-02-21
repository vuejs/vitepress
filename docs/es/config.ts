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
    translations: {
      button: {
        buttonText: 'Buscar',
        buttonAriaLabel: 'Buscar'
      },
      modal: {
        searchBox: {
          clearButtonTitle: 'Limpiar',
          clearButtonAriaLabel: 'Borrar la consulta',
          closeButtonText: 'Cerrar',
          closeButtonAriaLabel: 'Cerrar',
          placeholderText: 'Buscar en la documentación o preguntar a Ask AI',
          placeholderTextAskAi: 'Haz otra pregunta...',
          placeholderTextAskAiStreaming: 'Respondiendo...',
          searchInputLabel: 'Buscar',
          backToKeywordSearchButtonText:
            'Volver a la búsqueda por palabras clave',
          backToKeywordSearchButtonAriaLabel:
            'Volver a la búsqueda por palabras clave',
          newConversationPlaceholder: 'Haz una pregunta',
          conversationHistoryTitle: 'Mi historial de conversaciones',
          startNewConversationText: 'Iniciar una nueva conversación',
          viewConversationHistoryText: 'Historial de conversaciones',
          threadDepthErrorPlaceholder: 'Se alcanzó el límite de conversación'
        },
        newConversation: {
          newConversationTitle: '¿Cómo puedo ayudarte hoy?',
          newConversationDescription:
            'Busco en tu documentación para ayudarte a encontrar guías de configuración, detalles de funciones y consejos de solución de problemas rápidamente.'
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
          poweredByText: 'Con la tecnología de'
        },
        errorScreen: {
          titleText: 'No se pueden obtener resultados',
          helpText: 'Puede que quieras comprobar tu conexión de red.'
        },
        startScreen: {
          recentSearchesTitle: 'Recientes',
          noRecentSearchesText: 'No hay búsquedas recientes',
          saveRecentSearchButtonTitle: 'Guardar esta búsqueda',
          removeRecentSearchButtonTitle: 'Eliminar esta búsqueda del historial',
          favoriteSearchesTitle: 'Favoritos',
          removeFavoriteSearchButtonTitle:
            'Eliminar esta búsqueda de favoritos',
          recentConversationsTitle: 'Conversaciones recientes',
          removeRecentConversationButtonTitle:
            'Eliminar esta conversación del historial'
        },
        noResultsScreen: {
          noResultsText: 'No se encontraron resultados para',
          suggestedQueryText: 'Intenta buscar',
          reportMissingResultsText:
            '¿Crees que esta consulta debería devolver resultados?',
          reportMissingResultsLinkText: 'Avísanos.'
        },
        resultsScreen: {
          askAiPlaceholder: 'Preguntar a la IA: ',
          noResultsAskAiPlaceholder:
            '¿No lo encontraste en la documentación? Pide ayuda a Ask AI: '
        },
        askAiScreen: {
          disclaimerText:
            'Las respuestas se generan con IA y pueden contener errores. Verifícalas.',
          relatedSourcesText: 'Fuentes relacionadas',
          thinkingText: 'Pensando...',
          copyButtonText: 'Copiar',
          copyButtonCopiedText: '¡Copiado!',
          copyButtonTitle: 'Copiar',
          likeButtonTitle: 'Me gusta',
          dislikeButtonTitle: 'No me gusta',
          thanksForFeedbackText: '¡Gracias por tu comentario!',
          preToolCallText: 'Buscando...',
          duringToolCallText: 'Buscando...',
          afterToolCallText: 'Buscado',
          stoppedStreamingText: 'Has detenido esta respuesta',
          errorTitleText: 'Error de chat',
          threadDepthExceededMessage:
            'Esta conversación se ha cerrado para mantener respuestas precisas.',
          startNewConversationButtonText: 'Iniciar una nueva conversación'
        }
      }
    },
    askAi: {
      sidePanel: {
        button: {
          translations: {
            buttonText: 'Preguntar a la IA',
            buttonAriaLabel: 'Preguntar a la IA'
          }
        },
        panel: {
          translations: {
            header: {
              title: 'Preguntar a la IA',
              conversationHistoryTitle: 'Mi historial de conversaciones',
              newConversationText: 'Iniciar una nueva conversación',
              viewConversationHistoryText: 'Historial de conversaciones'
            },
            promptForm: {
              promptPlaceholderText: 'Haz una pregunta',
              promptAnsweringText: 'Respondiendo...',
              promptAskAnotherQuestionText: 'Haz otra pregunta',
              promptDisclaimerText:
                'Las respuestas se generan con IA y pueden contener errores.',
              promptLabelText:
                'Pulsa Enter para enviar, o Shift+Enter para una nueva línea.',
              promptAriaLabelText: 'Entrada de prompt'
            },
            conversationScreen: {
              preToolCallText: 'Buscando...',
              searchingText: 'Buscando...',
              toolCallResultText: 'Buscado',
              conversationDisclaimer:
                'Las respuestas se generan con IA y pueden contener errores. Verifícalas.',
              reasoningText: 'Razonando...',
              thinkingText: 'Pensando...',
              relatedSourcesText: 'Fuentes relacionadas',
              stoppedStreamingText: 'Has detenido esta respuesta',
              copyButtonText: 'Copiar',
              copyButtonCopiedText: '¡Copiado!',
              likeButtonTitle: 'Me gusta',
              dislikeButtonTitle: 'No me gusta',
              thanksForFeedbackText: '¡Gracias por tu comentario!',
              errorTitleText: 'Error de chat'
            },
            newConversationScreen: {
              titleText: '¿Cómo puedo ayudarte hoy?',
              introductionText:
                'Busco en tu documentación para ayudarte a encontrar guías de configuración, detalles de funciones y consejos de solución de problemas rápidamente.'
            },
            logo: {
              poweredByText: 'Con la tecnología de'
            }
          }
        }
      }
    }
  }
}
