import { createRequire } from 'module'
import { defineConfig, type DefaultTheme } from 'vitepress'

const require = createRequire(import.meta.url)
const pkg = require('vitepress/package.json')

export const es = defineConfig({
  lang: 'es-CO',
  description: 'Generador de Sitios Estaticos desarrollado con Vite y Vue.',

  themeConfig: {
    nav: nav(),

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
      copyright: `Derechos reservados © 2019-${new Date().getFullYear()} Evan You`
    },

    docFooter: {
      prev: 'Anterior',
      next: 'Siguiente'
    },

    outline: {
      label: 'En esta página'
    },

    lastUpdated: {
      text: 'Actualizado en',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
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
      text: 'Guia',
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
        { text: 'Qué es VitePress？', link: 'what-is-vitepress' },
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
      text: 'Configuración y Referencia del API',
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
            { text: 'Busqueda', link: 'search' },
            { text: 'Carbon Ads', link: 'carbon-ads' }
          ]
        }
      ]
    }
  ]
}

export const search: DefaultTheme.AlgoliaSearchOptions['locales'] = {
  es: {
    placeholder: 'Buscar documentos',
    translations: {
      button: {
        buttonText: 'Buscar',
        buttonAriaLabel: 'Buscar'
      },
      modal: {
        searchBox: {
          resetButtonTitle: 'Limpiar búsqueda',
          resetButtonAriaLabel: 'Limpiar búsqueda',
          cancelButtonText: 'Cancelar',
          cancelButtonAriaLabel: 'Cancelar'
        },
        startScreen: {
          recentSearchesTitle: 'Historial de búsqueda',
          noRecentSearchesText: 'Ninguna búsqueda reciente',
          saveRecentSearchButtonTitle: 'Guardar en el historial de búsqueda',
          removeRecentSearchButtonTitle: 'Borrar del historial de búsqueda',
          favoriteSearchesTitle: 'Favoritos',
          removeFavoriteSearchButtonTitle: 'Borrar de favoritos'
        },
        errorScreen: {
          titleText: 'No fue posible obtener resultados',
          helpText: 'Verifique su conexión de red'
        },
        footer: {
          selectText: 'Seleccionar',
          navigateText: 'Navegar',
          closeText: 'Cerrar',
          searchByText: 'Busqueda por'
        },
        noResultsScreen: {
          noResultsText: 'No fue posible encontrar resultados',
          suggestedQueryText: 'Puede intentar una nueva búsqueda',
          reportMissingResultsText:
            'Deberian haber resultados para esa consulta?',
          reportMissingResultsLinkText: 'Click para enviar feedback'
        }
      }
    }
  }
}
