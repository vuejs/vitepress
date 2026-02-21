import { createRequire } from 'module'
import { defineAdditionalConfig, type DefaultTheme } from 'vitepress'

const require = createRequire(import.meta.url)
const pkg = require('vitepress/package.json')

export default defineAdditionalConfig({
  description: 'Vite と Vue による静的サイトジェネレーター',

  themeConfig: {
    nav: nav(),

    search: { options: searchOptions() },

    sidebar: {
      '/ja/guide/': { base: '/ja/guide/', items: sidebarGuide() },
      '/ja/reference/': { base: '/ja/reference/', items: sidebarReference() }
    },

    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
      text: 'GitHub でこのページを編集'
    },

    footer: {
      message: 'MIT ライセンスの下で公開されています。',
      copyright: 'Copyright © 2019-present Evan You'
    }
  }
})

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: 'ガイド',
      link: '/ja/guide/what-is-vitepress',
      activeMatch: '/guide/'
    },
    {
      text: 'リファレンス',
      link: '/ja/reference/site-config',
      activeMatch: '/reference/'
    },
    {
      text: pkg.version,
      items: [
        {
          text: '1.6.4',
          link: 'https://vuejs.github.io/vitepress/v1/'
        },
        {
          text: '更新履歴',
          link: 'https://github.com/vuejs/vitepress/blob/main/CHANGELOG.md'
        },
        {
          text: 'コントリビュート方法',
          link: 'https://github.com/vuejs/vitepress/blob/main/.github/contributing.md'
        }
      ]
    }
  ]
}

function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: '導入',
      collapsed: false,
      items: [
        { text: 'VitePress とは？', link: 'what-is-vitepress' },
        { text: 'はじめに', link: 'getting-started' },
        { text: 'ルーティング', link: 'routing' },
        { text: 'デプロイ', link: 'deploy' }
      ]
    },
    {
      text: '執筆',
      collapsed: false,
      items: [
        { text: 'Markdown 拡張', link: 'markdown' },
        { text: 'アセットの取り扱い', link: 'asset-handling' },
        { text: 'フロントマター', link: 'frontmatter' },
        { text: 'Markdown で Vue を使う', link: 'using-vue' },
        { text: '多言語対応', link: 'i18n' }
      ]
    },
    {
      text: 'カスタマイズ',
      collapsed: false,
      items: [
        { text: 'カスタムテーマを使う', link: 'custom-theme' },
        {
          text: 'デフォルトテーマの拡張',
          link: 'extending-default-theme'
        },
        { text: 'ビルド時のデータ読み込み', link: 'data-loading' },
        { text: 'SSR 互換性', link: 'ssr-compat' },
        { text: 'CMS との接続', link: 'cms' }
      ]
    },
    {
      text: '実験的機能',
      collapsed: false,
      items: [
        { text: 'MPA モード', link: 'mpa-mode' },
        { text: 'サイトマップ生成', link: 'sitemap-generation' }
      ]
    },
    {
      text: '設定 & API リファレンス',
      base: '/ja/reference/',
      link: 'site-config'
    }
  ]
}

function sidebarReference(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'リファレンス',
      items: [
        { text: 'サイト設定', link: 'site-config' },
        { text: 'Frontmatter 設定', link: 'frontmatter-config' },
        { text: 'ランタイム API', link: 'runtime-api' },
        { text: 'CLI', link: 'cli' },
        {
          text: 'デフォルトテーマ',
          base: '/ja/reference/default-theme-',
          items: [
            { text: '概要', link: 'config' },
            { text: 'ナビゲーション', link: 'nav' },
            { text: 'サイドバー', link: 'sidebar' },
            { text: 'ホームページ', link: 'home-page' },
            { text: 'フッター', link: 'footer' },
            { text: 'レイアウト', link: 'layout' },
            { text: 'バッジ', link: 'badge' },
            { text: 'チームページ', link: 'team-page' },
            { text: '前 / 次 リンク', link: 'prev-next-links' },
            { text: '編集リンク', link: 'edit-link' },
            { text: '最終更新日時', link: 'last-updated' },
            { text: '検索', link: 'search' },
            { text: 'Carbon 広告', link: 'carbon-ads' }
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
        buttonText: '検索',
        buttonAriaLabel: '検索'
      },
      modal: {
        searchBox: {
          clearButtonTitle: 'クリア',
          clearButtonAriaLabel: 'クエリをクリア',
          closeButtonText: '閉じる',
          closeButtonAriaLabel: '閉じる',
          placeholderText: 'ドキュメントを検索するか Ask AI に質問',
          placeholderTextAskAi: '別の質問をする...',
          placeholderTextAskAiStreaming: '回答中...',
          searchInputLabel: '検索',
          backToKeywordSearchButtonText: 'キーワード検索に戻る',
          backToKeywordSearchButtonAriaLabel: 'キーワード検索に戻る',
          newConversationPlaceholder: '質問する',
          conversationHistoryTitle: '自分の会話履歴',
          startNewConversationText: '新しい会話を開始',
          viewConversationHistoryText: '会話履歴',
          threadDepthErrorPlaceholder: '会話上限に達しました'
        },
        newConversation: {
          newConversationTitle: '今日はどのようにお手伝いできますか？',
          newConversationDescription:
            'ドキュメントを検索して、設定ガイド、機能の詳細、トラブルシューティングのヒントをすばやく見つけるお手伝いをします。'
        },
        footer: {
          selectText: '選択',
          submitQuestionText: '質問を送信',
          selectKeyAriaLabel: 'Enter キー',
          navigateText: '移動',
          navigateUpKeyAriaLabel: '上矢印',
          navigateDownKeyAriaLabel: '下矢印',
          closeText: '閉じる',
          backToSearchText: '検索に戻る',
          closeKeyAriaLabel: 'Escape キー',
          poweredByText: '提供'
        },
        errorScreen: {
          titleText: '結果を取得できませんでした',
          helpText: 'ネットワーク接続を確認してください。'
        },
        startScreen: {
          recentSearchesTitle: '最近',
          noRecentSearchesText: '最近の検索はありません',
          saveRecentSearchButtonTitle: 'この検索を保存',
          removeRecentSearchButtonTitle: '履歴からこの検索を削除',
          favoriteSearchesTitle: 'お気に入り',
          removeFavoriteSearchButtonTitle: 'お気に入りからこの検索を削除',
          recentConversationsTitle: '最近の会話',
          removeRecentConversationButtonTitle: '履歴からこの会話を削除'
        },
        noResultsScreen: {
          noResultsText: '次の検索結果はありません',
          suggestedQueryText: '次を検索してみてください',
          reportMissingResultsText:
            'この検索には結果があるべきだと思いますか？',
          reportMissingResultsLinkText: 'お知らせください。'
        },
        resultsScreen: {
          askAiPlaceholder: 'AI に質問：',
          noResultsAskAiPlaceholder:
            'ドキュメントに見つかりませんでしたか？ Ask AI に相談：'
        },
        askAiScreen: {
          disclaimerText:
            '回答は AI により生成され、誤りが含まれる場合があります。内容をご確認ください。',
          relatedSourcesText: '関連ソース',
          thinkingText: '考え中...',
          copyButtonText: 'コピー',
          copyButtonCopiedText: 'コピーしました！',
          copyButtonTitle: 'コピー',
          likeButtonTitle: 'いいね',
          dislikeButtonTitle: 'よくないね',
          thanksForFeedbackText: 'フィードバックありがとうございます！',
          preToolCallText: '検索中...',
          duringToolCallText: '検索中...',
          afterToolCallText: '検索しました',
          stoppedStreamingText: 'この応答を停止しました',
          errorTitleText: 'チャットエラー',
          threadDepthExceededMessage:
            '回答の正確性を保つため、この会話は終了しました。',
          startNewConversationButtonText: '新しい会話を開始'
        }
      }
    },
    askAi: {
      sidePanel: {
        button: {
          translations: {
            buttonText: 'AI に質問',
            buttonAriaLabel: 'AI に質問'
          }
        },
        panel: {
          translations: {
            header: {
              title: 'AI に質問',
              conversationHistoryTitle: '自分の会話履歴',
              newConversationText: '新しい会話を開始',
              viewConversationHistoryText: '会話履歴'
            },
            promptForm: {
              promptPlaceholderText: '質問する',
              promptAnsweringText: '回答中...',
              promptAskAnotherQuestionText: '別の質問をする',
              promptDisclaimerText:
                '回答は AI により生成され、誤りが含まれる場合があります。',
              promptLabelText: 'Enterで送信、Shift+Enterで改行。',
              promptAriaLabelText: 'プロンプト入力'
            },
            conversationScreen: {
              preToolCallText: '検索中...',
              searchingText: '検索中...',
              toolCallResultText: '検索しました',
              conversationDisclaimer:
                '回答は AI により生成され、誤りが含まれる場合があります。内容をご確認ください。',
              reasoningText: '推論中...',
              thinkingText: '考え中...',
              relatedSourcesText: '関連ソース',
              stoppedStreamingText: 'この応答を停止しました',
              copyButtonText: 'コピー',
              copyButtonCopiedText: 'コピーしました！',
              likeButtonTitle: 'いいね',
              dislikeButtonTitle: 'よくないね',
              thanksForFeedbackText: 'フィードバックありがとうございます！',
              errorTitleText: 'チャットエラー'
            },
            newConversationScreen: {
              titleText: '今日はどのようにお手伝いできますか？',
              introductionText:
                'ドキュメントを検索して、設定ガイド、機能の詳細、トラブルシューティングのヒントをすばやく見つけるお手伝いをします。'
            },
            logo: {
              poweredByText: '提供'
            }
          }
        }
      }
    }
  }
}
