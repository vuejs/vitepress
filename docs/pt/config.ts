import { createRequire } from 'module'
import { defineAdditionalConfig, type DefaultTheme } from 'vitepress'

const require = createRequire(import.meta.url)
const pkg = require('vitepress/package.json')

export default defineAdditionalConfig({
  description: 'Gerador de Site Estático desenvolvido com Vite e Vue.',

  themeConfig: {
    nav: nav(),

    search: { options: searchOptions() },

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
      text: 'Atualizado em'
    },

    notFound: {
      title: 'PÁGINA NÃO ENCONTRADA',
      quote:
        'Mas se você não mudar de direção e continuar procurando, pode acabar onde está indo.',
      linkLabel: 'ir para a página inicial',
      linkText: 'Me leve para casa'
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
          text: '1.6.4',
          link: 'https://vuejs.github.io/vitepress/v1/pt/'
        },
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

function searchOptions(): Partial<DefaultTheme.AlgoliaSearchOptions> {
  return {
    translations: {
      button: {
        buttonText: 'Buscar',
        buttonAriaLabel: 'Buscar'
      },
      modal: {
        searchBox: {
          clearButtonTitle: 'Limpar',
          clearButtonAriaLabel: 'Limpar a consulta',
          closeButtonText: 'Fechar',
          closeButtonAriaLabel: 'Fechar',
          placeholderText: 'Buscar na documentação ou perguntar ao Ask AI',
          placeholderTextAskAi: 'Faça outra pergunta...',
          placeholderTextAskAiStreaming: 'Respondendo...',
          searchInputLabel: 'Buscar',
          backToKeywordSearchButtonText:
            'Voltar para a busca por palavra-chave',
          backToKeywordSearchButtonAriaLabel:
            'Voltar para a busca por palavra-chave',
          newConversationPlaceholder: 'Faça uma pergunta',
          conversationHistoryTitle: 'Meu histórico de conversas',
          startNewConversationText: 'Iniciar uma nova conversa',
          viewConversationHistoryText: 'Histórico de conversas',
          threadDepthErrorPlaceholder: 'Limite de conversa atingido'
        },
        newConversation: {
          newConversationTitle: 'Como posso ajudar hoje?',
          newConversationDescription:
            'Eu busco na sua documentação para ajudar a encontrar guias de configuração, detalhes de funcionalidades e dicas de solução de problemas rapidamente.'
        },
        footer: {
          selectText: 'Selecionar',
          submitQuestionText: 'Enviar pergunta',
          selectKeyAriaLabel: 'Tecla Enter',
          navigateText: 'Navegar',
          navigateUpKeyAriaLabel: 'Seta para cima',
          navigateDownKeyAriaLabel: 'Seta para baixo',
          closeText: 'Fechar',
          backToSearchText: 'Voltar à busca',
          closeKeyAriaLabel: 'Tecla Escape',
          poweredByText: 'Com tecnologia de'
        },
        errorScreen: {
          titleText: 'Não foi possível obter resultados',
          helpText: 'Talvez você queira verificar sua conexão de rede.'
        },
        startScreen: {
          recentSearchesTitle: 'Recentes',
          noRecentSearchesText: 'Nenhuma pesquisa recente',
          saveRecentSearchButtonTitle: 'Salvar esta pesquisa',
          removeRecentSearchButtonTitle: 'Remover esta pesquisa do histórico',
          favoriteSearchesTitle: 'Favoritos',
          removeFavoriteSearchButtonTitle:
            'Remover esta pesquisa dos favoritos',
          recentConversationsTitle: 'Conversas recentes',
          removeRecentConversationButtonTitle:
            'Remover esta conversa do histórico'
        },
        noResultsScreen: {
          noResultsText: 'Nenhum resultado encontrado para',
          suggestedQueryText: 'Tente pesquisar por',
          reportMissingResultsText:
            'Acha que esta consulta deveria retornar resultados?',
          reportMissingResultsLinkText: 'Avise-nos.'
        },
        resultsScreen: {
          askAiPlaceholder: 'Perguntar à IA: ',
          noResultsAskAiPlaceholder:
            'Não encontrou nos documentos? Peça ajuda ao Ask AI: '
        },
        askAiScreen: {
          disclaimerText:
            'As respostas são geradas por IA e podem conter erros. Verifique.',
          relatedSourcesText: 'Fontes relacionadas',
          thinkingText: 'Pensando...',
          copyButtonText: 'Copiar',
          copyButtonCopiedText: 'Copiado!',
          copyButtonTitle: 'Copiar',
          likeButtonTitle: 'Curtir',
          dislikeButtonTitle: 'Não curtir',
          thanksForFeedbackText: 'Obrigado pelo seu feedback!',
          preToolCallText: 'Buscando...',
          duringToolCallText: 'Buscando...',
          afterToolCallText: 'Pesquisado',
          stoppedStreamingText: 'Você interrompeu esta resposta',
          errorTitleText: 'Erro no chat',
          threadDepthExceededMessage:
            'Esta conversa foi encerrada para manter respostas precisas.',
          startNewConversationButtonText: 'Iniciar uma nova conversa'
        }
      }
    },
    askAi: {
      sidePanel: {
        button: {
          translations: {
            buttonText: 'Perguntar à IA',
            buttonAriaLabel: 'Perguntar à IA'
          }
        },
        panel: {
          translations: {
            header: {
              title: 'Perguntar à IA',
              conversationHistoryTitle: 'Meu histórico de conversas',
              newConversationText: 'Iniciar uma nova conversa',
              viewConversationHistoryText: 'Histórico de conversas'
            },
            promptForm: {
              promptPlaceholderText: 'Faça uma pergunta',
              promptAnsweringText: 'Respondendo...',
              promptAskAnotherQuestionText: 'Faça outra pergunta',
              promptDisclaimerText:
                'As respostas são geradas por IA e podem conter erros.',
              promptLabelText:
                'Pressione Enter para enviar ou Shift+Enter para nova linha.',
              promptAriaLabelText: 'Entrada do prompt'
            },
            conversationScreen: {
              preToolCallText: 'Buscando...',
              searchingText: 'Buscando...',
              toolCallResultText: 'Pesquisado',
              conversationDisclaimer:
                'As respostas são geradas por IA e podem conter erros. Verifique.',
              reasoningText: 'Raciocinando...',
              thinkingText: 'Pensando...',
              relatedSourcesText: 'Fontes relacionadas',
              stoppedStreamingText: 'Você interrompeu esta resposta',
              copyButtonText: 'Copiar',
              copyButtonCopiedText: 'Copiado!',
              likeButtonTitle: 'Curtir',
              dislikeButtonTitle: 'Não curtir',
              thanksForFeedbackText: 'Obrigado pelo seu feedback!',
              errorTitleText: 'Erro no chat'
            },
            newConversationScreen: {
              titleText: 'Como posso ajudar hoje?',
              introductionText:
                'Eu busco na sua documentação para ajudar a encontrar guias de configuração, detalhes de funcionalidades e dicas de solução de problemas rapidamente.'
            },
            logo: {
              poweredByText: 'Com tecnologia de'
            }
          }
        }
      }
    }
  }
}
