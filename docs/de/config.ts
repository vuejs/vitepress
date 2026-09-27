import {
  defineAdditionalConfig,
  type DefaultTheme,
  type MarkdownLocaleOptions
} from 'vitepress'
import pkg from 'vitepress/package.json' with { type: 'json' }

export const markdown: MarkdownLocaleOptions = {
  container: {
    tipLabel: 'TIPP',
    infoLabel: 'INFO',
    warningLabel: 'WARNUNG',
    dangerLabel: 'GEFAHR',
    detailsLabel: 'DETAILS',
    noteLabel: 'NOTIZ',
    importantLabel: 'WICHTIG',
    cautionLabel: 'VORSICHT'
  },
  codeCopyButton: {
    tooltipText: 'Code kopieren',
    copiedText: 'Kopiert'
  }
}

export default defineAdditionalConfig({
  description: 'Static-Site-Generator mit Vue und Vite',

  head: [
    [
      'link',
      // for the vazirmatn font-face defined in .vitepress/theme/styles.css
      { rel: 'preconnect', href: 'https://cdn.jsdelivr.net', crossorigin: '' }
    ]
  ],

  themeConfig: {
    nav: nav(),

    search: { options: searchOptions() },

    sidebar: {
      '/de/guide/': { base: '/de/guide/', items: sidebarGuide() },
      '/de/reference/': { base: '/de/reference/', items: sidebarReference() }
    },

    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
      text: 'Bearbeite diese Seite auf GitHub'
    },

    footer: {
      message: 'Freigegeben unter MIT License',
      copyright: 'Copyright © 2019-heute Evan You'
    },

    docFooter: {
      prev: 'Vorheriger',
      next: 'Nächster'
    },

    outline: {
      label: 'Auf dieser Seite'
    },

    lastUpdated: {
      text: 'Zuletzt geupdated'
    },

    notFound: {
      title: 'Seite nicht gefunden',
      quote:
        'Doch wenn du deine Richtung nicht änderst und weiter in diese Richtung blickst, könntest du tatsächlich dort landen, worauf du zusteuerst.',
      linkLabel: 'Zur Startseite',
      linkText: 'Bring mich zur Startseite'
    },

    langMenuLabel: 'Sprache ändern',
    returnToTopLabel: 'Zurück nach oben',
    sidebarMenuLabel: 'Seitenleiste',
    darkModeSwitchLabel: 'Dunkelmodus',
    lightModeSwitchTitle: 'Zum Hellmodus wechseln',
    darkModeSwitchTitle: 'Zum Dunkelmodus wechseln',
    siteTitle: 'VitePress'
  }
})

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: 'Guide',
      link: 'de/guide/what-is-vitepress',
      activeMatch: '/guide/'
    },
    {
      text: 'Referenz',
      link: 'de/reference/site-config',
      activeMatch: '/reference/'
    },
    {
      text: pkg.version,
      items: [
        {
          text: '1.6.4',
          link: 'https://vuejs.github.io/vitepress/v1/fa/'
        },
        {
          text: 'Änderungen',
          link: 'https://github.com/vuejs/vitepress/blob/main/CHANGELOG.md'
        },
        {
          text: 'Mitwirken',
          link: 'https://github.com/vuejs/vitepress/blob/main/.github/contributing.md'
        }
      ]
    }
  ]
}

function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Einführung',
      collapsed: false,
      items: [
        { text: 'Was ist VitePress?', link: 'what-is-vitepress' },
        { text: 'Erste Schritte', link: 'getting-started' },
        { text: 'Routing', link: 'routing' },
        { text: 'Deployment', link: 'deploy' }
      ]
    },
    {
      text: 'Schreiben',
      collapsed: false,
      items: [
        { text: 'Markdown Erweiterungen', link: 'markdown' },
        { text: 'Asset-Handhabung', link: 'asset-handling' },
        { text: 'Frontmatter', link: 'frontmatter' },
        { text: 'Vue in Markdown benutzen', link: 'using-vue' },
        { text: 'Internationalisierung', link: 'i18n' }
      ]
    },
    {
      text: 'Anpassung',
      collapsed: false,
      items: [
        { text: 'Ein eigenes Theme nutzen', link: 'custom-theme' },
        {
          text: 'Standart-Theme erweitern',
          link: 'extending-default-theme'
        },
        { text: 'Datenladen', link: 'data-loading' },
        { text: 'SSR-Kompatibilität', link: 'ssr-compat' },
        { text: 'Mit einem CMS verbinden', link: 'cms' }
      ]
    },
    {
      text: 'Experimental',
      collapsed: false,
      items: [
        { text: 'MPA-Modus', link: 'mpa-mode' },
        { text: 'Sitemap-Generation', link: 'sitemap-generation' }
      ]
    },
    { text: 'Konfiguration und API-Referenz', base: 'de/reference/', link: 'site-config' }
  ]
}

function sidebarReference(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Referenz',
      base: 'de/reference/',
      items: [
        { text: 'Seiten-Konfiguration', link: 'site-config' },
        { text: 'Frontmatter-Konfiguration', link: 'frontmatter-config' },
        { text: 'Runtime-API', link: 'runtime-api' },
        { text: 'CLI', link: 'cli' },
        {
          text: 'Standart-Theme',
          base: 'de/reference/default-theme-',
          items: [
            { text: 'Übersicht', link: 'config' },
            { text: 'Navigation', link: 'nav' },
            { text: 'Seitenleiste', link: 'sidebar' },
            { text: 'Startseite', link: 'home-page' },
            { text: 'Footer', link: 'footer' },
            { text: 'Layout', link: 'layout' },
            { text: 'Badge', link: 'badge' },
            { text: 'Team-Seite', link: 'team-page' },
            { text: 'Vorher / Nachher Links', link: 'prev-next-links' },
            { text: 'Link bearbeiten', link: 'edit-link' },
            { text: 'Zuletzt geupdated Zeitstempel', link: 'last-updated' },
            { text: 'Suche', link: 'search' },
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
        buttonText: 'Suche',
        buttonAriaLabel: 'Suche'
      },
      modal: {
        searchBox: {
          clearButtonTitle: 'Löschen',
          clearButtonAriaLabel: 'Suchverlauf löschen',
          closeButtonText: 'Schließen',
          closeButtonAriaLabel: 'Schließen',
          placeholderText: 'Dokumentation durchsuchen oder KI fragen',
          placeholderTextAskAi: 'Stell noch eine Frage...',
          placeholderTextAskAiStreaming: 'Antwort generieren...',
          searchInputLabel: 'Suche',
          backToKeywordSearchButtonText: 'Zurück zur Stichwortsuche',
          backToKeywordSearchButtonAriaLabel: 'Zurück zur Stichwortsuche',
          newConversationPlaceholder: 'Eine Frage stellen',
          conversationHistoryTitle: 'Mein Gesprächsverlauf',
          startNewConversationText: 'Neue Konversation beginnen',
          viewConversationHistoryText: 'Gesprächsverlauf',
          threadDepthErrorPlaceholder: 'Gesprächslimit erreicht'
        },
        newConversation: {
          newConversationTitle: 'How can I help you today?',
          newConversationDescription:
            'I’ll search your documentation to quickly find setup guides, feature details, and troubleshooting tips.'
        },
        footer: {
          selectText: 'Select',
          submitQuestionText: 'Submit question',
          selectKeyAriaLabel: 'Enter key',
          navigateText: 'Navigate',
          navigateUpKeyAriaLabel: 'Arrow up',
          navigateDownKeyAriaLabel: 'Arrow down',
          closeText: 'Close',
          backToSearchText: 'Back to search',
          closeKeyAriaLabel: 'Escape key',
          poweredByText: 'Powered by'
        },
        errorScreen: {
          titleText: 'Unable to retrieve results',
          helpText: 'You may need to check your network connection.'
        },
        startScreen: {
          recentSearchesTitle: 'Recent',
          noRecentSearchesText: 'No recent searches',
          saveRecentSearchButtonTitle: 'Save this search',
          removeRecentSearchButtonTitle: 'Remove this search from history',
          favoriteSearchesTitle: 'Favorites',
          removeFavoriteSearchButtonTitle: 'Remove this search from favorites',
          recentConversationsTitle: 'Recent conversations',
          removeRecentConversationButtonTitle:
            'Remove this conversation from history'
        },
        noResultsScreen: {
          noResultsText: 'No results for',
          suggestedQueryText: 'Try searching for',
          reportMissingResultsText:
            'Think this search should have results?',
          reportMissingResultsLinkText: 'Let us know.'
        },
        resultsScreen: {
          askAiPlaceholder: 'Ask AI: ',
          noResultsAskAiPlaceholder:
            'Couldn’t find it in the documentation? Ask AI: '
        },
        askAiScreen: {
          disclaimerText:
            'Answers are generated by AI and may be inaccurate. Please verify.',
          relatedSourcesText: 'Related sources',
          thinkingText: 'Thinking...',
          copyButtonText: 'Copy',
          copyButtonCopiedText: 'Copied!',
          copyButtonTitle: 'Copy',
          likeButtonTitle: 'Helpful',
          dislikeButtonTitle: 'Not helpful',
          thanksForFeedbackText: 'Thanks for your feedback!',
          preToolCallText: 'Searching...',
          duringToolCallText: 'Searching...',
          afterToolCallText: 'Search for',
          stoppedStreamingText: 'You stopped this response',
          errorTitleText: 'Conversation error',
          startNewConversationButtonText: 'Start a new conversation'
        }
      }
    },
    askAi: {
      sidePanel: {
        button: {
          translations: {
            buttonText: 'Ask AI',
            buttonAriaLabel: 'Ask AI'
          }
        },
        panel: {
          translations: {
            header: {
              title: 'Ask AI',
              conversationHistoryTitle: 'My conversation history',
              newConversationText: 'Start a new conversation',
              viewConversationHistoryText: 'Conversation history'
            },
            promptForm: {
              promptPlaceholderText: 'Ask a question',
              promptAnsweringText: 'Generating answer...',
              promptAskAnotherQuestionText: 'Ask another question',
              promptDisclaimerText:
                'Answers are generated by AI and may be inaccurate.',
              promptLabelText:
                'Press Enter to submit, or Shift+Enter for a new line.',
              promptAriaLabelText: 'Question input'
            },
            conversationScreen: {
              preToolCallText: 'Searching...',
              searchingText: 'Searching...',
              toolCallResultText: 'Search for',
              conversationDisclaimer:
                'Answers are generated by AI and may be inaccurate. Please verify.',
              reasoningText: 'Reasoning...',
              thinkingText: 'Thinking...',
              relatedSourcesText: 'Related sources',
              stoppedStreamingText: 'You stopped this response',
              copyButtonText: 'Copy',
              copyButtonCopiedText: 'Copied!',
              likeButtonTitle: 'Helpful',
              dislikeButtonTitle: 'Not helpful',
              thanksForFeedbackText: 'Thanks for your feedback!',
              errorTitleText: 'Conversation error'
            },
            newConversationScreen: {
              titleText: 'How can I help you today?',
              introductionText:
                'I’ll search your documentation to quickly find setup guides, feature details, and troubleshooting tips.'
            },
            logo: {
              poweredByText: 'Powered by'
            }
          }
        }
      }
    }
  }
}
