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
  zurückgeben [
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
  zurückgeben [
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
  zurückgeben [
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
            { text: 'Fußzeile', link: 'footer' },
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
  zurückgeben {
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
          newConversationTitle: 'Wie kann ich dir heute helfen?',
          newConversationDescription:
            'Ich werde die Dokumentation durchsuchen, um schnell Einrichtungsanleitungen, Details zu Funktionen und Tipps zur Fehlerbehebung zu finden.'
        },
        footer: {
          selectText: 'Auswählen',
          submitQuestionText: 'Frage absenden',
          selectKeyAriaLabel: 'Eingabetaste', //unsure
          navigateText: 'Navigieren',
          navigateUpKeyAriaLabel: 'Pfeil hoch',
          navigateDownKeyAriaLabel: 'Pfeil runter',
          closeText: 'Schließen',
          backToSearchText: 'Zurück zur Suche',
          closeKeyAriaLabel: 'Escape-Taste',
          poweredByText: 'Angetrieben von'
        },
        errorScreen: {
          titleText: 'Ergebnisse konnten nicht abgerufen werden.',
          helpText: 'Möglicherweise müssen Sie Ihre Netzwerkverbindung überprüfen.'
        },
        startScreen: {
          recentSearchesTitle: 'Zuletzt',
          noRecentSearchesText: 'Keine kürzlichen Suchanfragen',
          saveRecentSearchButtonTitle: 'Diese Suche speichern',
          removeRecentSearchButtonTitle: 'Diese Suche aus dem Verlauf entfernen',
          favoriteSearchesTitle: 'Favoriten',
          removeFavoriteSearchButtonTitle: 'Diese Suche von Favoriten entfernen',
          recentConversationsTitle: 'Kürzliche Konversationen',
          removeRecentConversationButtonTitle:
            'Diese Unterhaltung aus dem Verlauf entfernen'
        },
        noResultsScreen: {
          noResultsText: 'Keine Ergebnisse für',
          suggestedQueryText: 'Versuchen Sie',
          reportMissingResultsText:
            'Glaubst du, diese Suche sollte Ergebnisse liefern?',
          reportMissingResultsLinkText: 'Lass es uns wissen.'
        },
        resultsScreen: {
          askAiPlaceholder: 'Frag KI: ',
          noResultsAskAiPlaceholder:
            'Nicht in der Dokumentation fündig geworden? Fragen Sie die KI: '
        },
        askAiScreen: {
          disclaimerText:
            'Die Antworten werden von einer KI generiert und können ungenau sein. Bitte überprüfen Sie diese.',
          relatedSourcesText: 'Verwandte Quellen',
          thinkingText: 'Denken...',
          copyButtonText: 'Kopieren',
          copyButtonCopiedText: 'Kopiert!',
          copyButtonTitle: 'Kopieren',
          likeButtonTitle: 'Hilfreich',
          dislikeButtonTitle: 'Nicht Hilfreich',
          thanksForFeedbackText: 'Danke für Ihr Feedback!',
          preToolCallText: 'Suchen...',
          duringToolCallText: 'Suchen...',
          afterToolCallText: 'Suche nach',
          stoppedStreamingText: 'Du hast diese Antwort angehalten',
          errorTitleText: 'Konversationsfehler',
          startNewConversationButtonText: 'Neue Konversation beginnen'
        }
      }
    },
    askAi: {
      sidePanel: {
        button: {
          translations: {
            buttonText: 'Frag KI',
            buttonAriaLabel: 'Frag KI'
          }
        },
        panel: {
          translations: {
            header: {
              title: 'Frag KI',
              conversationHistoryTitle: 'Mein Gesprächsverlauf',
              newConversationText: 'Neue Konversation beginnen',
              viewConversationHistoryText: 'Gesprächsverlauf'
            },
            promptForm: {
              promptPlaceholderText: 'Frage eine Frage',
              promptAnsweringText: 'Antwort generieren...',
              promptAskAnotherQuestionText: 'Frage eine weitere Frage',
              promptDisclaimerText:
                'Die Antworten werden von einer KI generiert und können ungenau sein.',
              promptLabelText:
                'Drücken Sie die Eingabetaste zum Absenden oder Umschalt+Eingabetaste für eine neue Zeile.',
              promptAriaLabelText: 'Frageeingabe'
            },
            conversationScreen: {
              preToolCallText: 'Suchen...',
              searchingText: 'Suchen...',
              toolCallResultText: 'Siche nach',
              conversationDisclaimer:
                'Die Antworten werden von einer KI generiert und können ungenau sein. Bitte überprüfen Sie diese.',
              reasoningText: 'Nachdenken...',
              thinkingText: 'Denken...',
              relatedSourcesText: 'Ähnliche Quellen',
              stoppedStreamingText: 'Du hast diese Antwort angehalten',
              copyButtonText: 'Kopieren',
              copyButtonCopiedText: 'Kopiert!',
              likeButtonTitle: 'Hilfreich',
              dislikeButtonTitle: 'Nicht Hilfreich',
              thanksForFeedbackText: 'Danke für dein Feedback!',
              errorTitleText: 'Konversationsfehler'
            },
            newConversationScreen: {
              titleText: 'Wie kann ich dir heute helfen?',
              introductionText:
                'Ich werde Ihre Dokumentation durchsuchen, um schnell Einrichtungsanleitungen, Details zu Funktionen und Tipps zur Fehlerbehebung zu finden.'
            },
            logo: {
              poweredByText: 'Angetrieben von'
            }
          }
        }
      }
    }
  }
}
