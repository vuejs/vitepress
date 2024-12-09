import { createRequire } from 'module'
import { defineConfig, type DefaultTheme } from 'vitepress'

const require = createRequire(import.meta.url)
const pkg = require('vitepress/package.json')

export const pt = defineConfig({
  lang: 'pt-BR',
  description: 'Gerador de Site Estático desenvolvido com Vite e Vue.',

  themeConfig: {
    nav: nav(),

    sidebar: {
      '/pt/guide/': { base: '/pt/guide/', items: sidebarGuide() },
      '/pt/reference/': { base: '/pt/reference/', items: sidebarReference() }
    },

    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
      text: 'Edite esta página no GitHub'
    },

    footer: {
      message: 'Lançado sob licença MIT',
      copyright: `Direitos reservados © 2019-${new Date().getFullYear()} Evan You`
    },

    docFooter: {
      prev: 'Anterior',
      next: 'Próximo'
    },

    outline: {
      label: 'Nesta página'
    },

    lastUpdated: {
      text: 'Atualizado em',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },

    langMenuLabel: 'Alterar Idioma',
    returnToTopLabel: 'Voltar ao Topo',
    sidebarMenuLabel: 'Menu Lateral',
    darkModeSwitchLabel: 'Tema Escuro',
    lightModeSwitchTitle: 'Mudar para Modo Claro',
    darkModeSwitchTitle: 'Mudar para Modo Escuro',
    skipToContentLabel: 'Pular para o Conteúdo'
  }
})

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: 'Guia',
      link: '/pt/guide/what-is-vitepress',
      activeMatch: '/pt/guide/'
    },
    {
      text: 'Referência',
      link: '/pt/reference/site-config',
      activeMatch: '/pt/reference/'
    },
    {
      text: pkg.version,
      items: [
        {
          text: 'Registro de Mudanças',
          link: 'https://github.com/vuejs/vitepress/blob/main/CHANGELOG.md'
        },
        {
          text: 'Contribuindo',
          link: 'https://github.com/vuejs/vitepress/blob/main/.github/contributing.md'
        }
      ]
    }
  ]
}

function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Introdução',
      collapsed: false,
      items: [
        { text: 'O que é VitePress？', link: 'what-is-vitepress' },
        { text: 'Iniciando', link: 'getting-started' },
        { text: 'Roteamento', link: 'routing' },
        { text: 'Implantação', link: 'deploy' }
      ]
    },
    {
      text: 'Escrevendo',
      collapsed: false,
      items: [
        { text: 'Extensões Markdown', link: 'markdown' },
        { text: 'Manipulando Ativos', link: 'asset-handling' },
        { text: 'Frontmatter', link: 'frontmatter' },
        { text: 'Usando Vue em Markdown', link: 'using-vue' },
        { text: 'Internacionalização', link: 'i18n' }
      ]
    },
    {
      text: 'Personalização',
      collapsed: false,
      items: [
        { text: 'Usando um tema personalizado', link: 'custom-theme' },
        { text: 'Estendendo o tema padrão', link: 'extending-default-theme' },
        {
          text: 'Carregamento de dados no momento da compilação',
          link: 'data-loading'
        },
        { text: 'Compatibilidade SSR', link: 'ssr-compat' },
        { text: 'Conectando a um CMS', link: 'cms' }
      ]
    },
    {
      text: 'Experimental',
      collapsed: false,
      items: [
        { text: 'Modo MPA', link: 'mpa-mode' },
        { text: 'Geração de Sitemap', link: 'sitemap-generation' }
      ]
    },
    {
      text: 'Configuração e Referência da API',
      base: '/pt/reference/',
      link: 'site-config'
    }
  ]
}

function sidebarReference(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Referência',
      items: [
        { text: 'Configuração do Site', link: 'site-config' },
        { text: 'Configuração Frontmatter', link: 'frontmatter-config' },
        { text: 'API do tempo de execução', link: 'runtime-api' },
        { text: 'CLI', link: 'cli' },
        {
          text: 'Tema padrão',
          base: '/pt/reference/default-theme-',
          items: [
            { text: 'Visão Geral', link: 'config' },
            { text: 'Navegação', link: 'nav' },
            { text: 'Barra Lateral', link: 'sidebar' },
            { text: 'Página Inicial', link: 'home-page' },
            { text: 'Rodapé', link: 'footer' },
            { text: 'Layout', link: 'layout' },
            { text: 'Distintivo', link: 'badge' },
            { text: 'Página da Equipe', link: 'team-page' },
            { text: 'Links Anterior / Próximo', link: 'prev-next-links' },
            { text: 'Editar Link', link: 'edit-link' },
            { text: 'Selo Temporal de Atualização', link: 'last-updated' },
            { text: 'Busca', link: 'search' },
            { text: 'Carbon Ads', link: 'carbon-ads' }
          ]
        }
      ]
    }
  ]
}

export const search: DefaultTheme.AlgoliaSearchOptions['locales'] = {
  pt: {
    placeholder: 'Pesquisar documentos',
    translations: {
      button: {
        buttonText: 'Pesquisar',
        buttonAriaLabel: 'Pesquisar'
      },
      modal: {
        searchBox: {
          resetButtonTitle: 'Limpar pesquisa',
          resetButtonAriaLabel: 'Limpar pesquisa',
          cancelButtonText: 'Cancelar',
          cancelButtonAriaLabel: 'Cancelar'
        },
        startScreen: {
          recentSearchesTitle: 'Histórico de Pesquisa',
          noRecentSearchesText: 'Nenhuma pesquisa recente',
          saveRecentSearchButtonTitle: 'Salvar no histórico de pesquisas',
          removeRecentSearchButtonTitle: 'Remover do histórico de pesquisas',
          favoriteSearchesTitle: 'Favoritos',
          removeFavoriteSearchButtonTitle: 'Remover dos favoritos'
        },
        errorScreen: {
          titleText: 'Não foi possível obter resultados',
          helpText: 'Verifique a sua conexão de rede'
        },
        footer: {
          selectText: 'Selecionar',
          navigateText: 'Navegar',
          closeText: 'Fechar',
          searchByText: 'Pesquisa por'
        },
        noResultsScreen: {
          noResultsText: 'Não foi possível encontrar resultados',
          suggestedQueryText: 'Você pode tentar uma nova consulta',
          reportMissingResultsText:
            'Deveriam haver resultados para essa consulta?',
          reportMissingResultsLinkText: 'Clique para enviar feedback'
        }
      }
    }
  }
}
