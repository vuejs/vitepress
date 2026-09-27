import {
  defineAdditionalConfig,
  type DefaultTheme,
  type MarkdownLocaleOptions
} from 'vitepress'
import pkg from 'vitepress/package.json' with { type: 'json' }

export const markdown: MarkdownLocaleOptions = {
  container: {
    tipLabel: 'TIP',
    infoLabel: 'INFO',
    warningLabel: 'WARNING',
    dangerLabel: 'DANGER',
    detailsLabel: 'DETAILS',
    noteLabel: 'NOTE',
    importantLabel: 'IMPORTANT',
    cautionLabel: 'CAUTION'
  },
  codeCopyButton: {
    tooltipText: 'Copy code',
    copiedText: 'Copied'
  }
}

export default defineAdditionalConfig({
  description: 'Static site generator with Vite and Vue',

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
      '/fa/guide/': { base: '/fa/guide/', items: sidebarGuide() },
      '/fa/reference/': { base: '/fa/reference/', items: sidebarReference() }
    },

    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    footer: {
      message: 'Released under the MIT License',
      copyright: 'Copyright © 2019-present Evan You'
    },

    docFooter: {
      prev: 'Previous',
      next: 'Next'
    },

    outline: {
      label: 'On this page'
    },

    lastUpdated: {
      text: 'Last updated'
    },

    notFound: {
      title: 'Page not found',
      quote:
        'But if you do not change your direction, and if you keep looking, you may end up where you are heading.',
      linkLabel: 'Go to home',
      linkText: 'Take me home'
    },

    langMenuLabel: 'Change language',
    returnToTopLabel: 'Return to top',
    sidebarMenuLabel: 'Sidebar menu',
    darkModeSwitchLabel: 'Dark mode',
    lightModeSwitchTitle: 'Switch to light mode',
    darkModeSwitchTitle: 'Switch to dark mode',
    siteTitle: 'VitePress'
  }
})

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: 'Guide',
      link: 'fa/guide/what-is-vitepress',
      activeMatch: '/guide/'
    },
    {
      text: 'Reference',
      link: 'fa/reference/site-config',
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
          text: 'Changelog',
          link: 'https://github.com/vuejs/vitepress/blob/main/CHANGELOG.md'
        },
        {
          text: 'Contributing',
          link: 'https://github.com/vuejs/vitepress/blob/main/.github/contributing.md'
        }
      ]
    }
  ]
}

function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Introduction',
      collapsed: false,
      items: [
        { text: 'What is VitePress?', link: 'what-is-vitepress' },
        { text: 'Getting Started', link: 'getting-started' },
        { text: 'Routing', link: 'routing' },
        { text: 'Deployment', link: 'deploy' }
      ]
    },
    {
      text: 'Writing',
      collapsed: false,
      items: [
        { text: 'Markdown Extensions', link: 'markdown' },
        { text: 'Asset Handling', link: 'asset-handling' },
        { text: 'Frontmatter', link: 'frontmatter' },
        { text: 'Using Vue in Markdown', link: 'using-vue' },
        { text: 'Internationalization', link: 'i18n' }
      ]
    },
    {
      text: 'Customization',
      collapsed: false,
      items: [
        { text: 'Using a Custom Theme', link: 'custom-theme' },
        {
          text: 'Extending the Default Theme',
          link: 'extending-default-theme'
        },
        { text: 'Data Loading', link: 'data-loading' },
        { text: 'SSR Compatibility', link: 'ssr-compat' },
        { text: 'Connecting to a CMS', link: 'cms' }
      ]
    },
    {
      text: 'Experimental',
      collapsed: false,
      items: [
        { text: 'MPA Mode', link: 'mpa-mode' },
        { text: 'Sitemap Generation', link: 'sitemap-generation' }
      ]
    },
    { text: 'Configuration and API Reference', base: 'fa/reference/', link: 'site-config' }
  ]
}

function sidebarReference(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Reference',
      base: 'fa/reference/',
      items: [
        { text: 'Site Config', link: 'site-config' },
        { text: 'Frontmatter Config', link: 'frontmatter-config' },
        { text: 'Runtime API', link: 'runtime-api' },
        { text: 'CLI', link: 'cli' },
        {
          text: 'Default Theme',
          base: 'fa/reference/default-theme-',
          items: [
            { text: 'Overview', link: 'config' },
            { text: 'Navigation', link: 'nav' },
            { text: 'Sidebar', link: 'sidebar' },
            { text: 'Home Page', link: 'home-page' },
            { text: 'Footer', link: 'footer' },
            { text: 'Layout', link: 'layout' },
            { text: 'Badge', link: 'badge' },
            { text: 'Team Page', link: 'team-page' },
            { text: 'Prev / Next Links', link: 'prev-next-links' },
            { text: 'Edit Link', link: 'edit-link' },
            { text: 'Last Updated Timestamp', link: 'last-updated' },
            { text: 'Search', link: 'search' },
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
        buttonText: 'Search',
        buttonAriaLabel: 'Search'
      },
      modal: {
        searchBox: {
          clearButtonTitle: 'Clear',
          clearButtonAriaLabel: 'Clear search query',
          closeButtonText: 'Close',
          closeButtonAriaLabel: 'Close',
          placeholderText: 'Search the documentation or ask AI',
          placeholderTextAskAi: 'Ask another question...',
          placeholderTextAskAiStreaming: 'Generating answer...',
          searchInputLabel: 'Search',
          backToKeywordSearchButtonText: 'Back to keyword search',
          backToKeywordSearchButtonAriaLabel: 'Back to keyword search',
          newConversationPlaceholder: 'Ask a question',
          conversationHistoryTitle: 'My conversation history',
          startNewConversationText: 'Start a new conversation',
          viewConversationHistoryText: 'Conversation history',
          threadDepthErrorPlaceholder: 'Conversation limit reached'
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
