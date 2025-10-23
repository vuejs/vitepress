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
    placeholder: 'ドキュメントを検索',
    translations: {
      button: {
        buttonText: '検索',
        buttonAriaLabel: '検索'
      },
      modal: {
        searchBox: {
          clearButtonTitle: '検索をクリア',
          clearButtonAriaLabel: '検索をクリア',
          closeButtonText: '閉じる',
          closeButtonAriaLabel: '閉じる',
          placeholderText: 'ドキュメントを検索',
          placeholderTextAskAi: 'AI に質問: ',
          placeholderTextAskAiStreaming: '回答を作成中...',
          searchInputLabel: '検索',
          backToKeywordSearchButtonText: 'キーワード検索に戻る',
          backToKeywordSearchButtonAriaLabel: 'キーワード検索に戻る'
        },
        startScreen: {
          recentSearchesTitle: '検索履歴',
          noRecentSearchesText: '最近の検索はありません',
          saveRecentSearchButtonTitle: '検索履歴に保存',
          removeRecentSearchButtonTitle: '検索履歴から削除',
          favoriteSearchesTitle: 'お気に入り',
          removeFavoriteSearchButtonTitle: 'お気に入りから削除',
          recentConversationsTitle: '最近の会話',
          removeRecentConversationButtonTitle: '会話履歴から削除'
        },
        errorScreen: {
          titleText: '結果を取得できません',
          helpText: 'ネットワーク接続を確認してください'
        },
        noResultsScreen: {
          noResultsText: '結果が見つかりません',
          suggestedQueryText: '別の検索語を試してください',
          reportMissingResultsText: '結果があるはずだと思いますか？',
          reportMissingResultsLinkText: 'フィードバックを送る'
        },
        resultsScreen: {
          askAiPlaceholder: 'AI に質問: '
        },
        askAiScreen: {
          disclaimerText:
            'AI が生成した回答には誤りが含まれる可能性があります。必ずご確認ください。',
          relatedSourcesText: '関連ソース',
          thinkingText: '考え中...',
          copyButtonText: 'コピー',
          copyButtonCopiedText: 'コピーしました！',
          copyButtonTitle: 'コピー',
          likeButtonTitle: 'いいね',
          dislikeButtonTitle: 'よくない',
          thanksForFeedbackText: 'フィードバックありがとうございます！',
          preToolCallText: '検索中...',
          duringToolCallText: '検索中 ',
          afterToolCallText: '検索完了',
          aggregatedToolCallText: '検索完了'
        },
        footer: {
          selectText: '選択',
          submitQuestionText: '質問を送信',
          selectKeyAriaLabel: 'Enter キー',
          navigateText: '移動',
          navigateUpKeyAriaLabel: '上矢印キー',
          navigateDownKeyAriaLabel: '下矢印キー',
          closeText: '閉じる',
          backToSearchText: '検索に戻る',
          closeKeyAriaLabel: 'Esc キー',
          poweredByText: '提供: '
        }
      }
    }
  }
}
