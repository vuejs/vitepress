import { createRequire } from 'module'
import { defineAdditionalConfig, type DefaultTheme } from 'vitepress'

const require = createRequire(import.meta.url)
const pkg = require('vitepress/package.json')

export default defineAdditionalConfig({
  description: '由 Vite 和 Vue 驱动的静态站点生成器',

  themeConfig: {
    nav: nav(),

    search: { options: searchOptions() },

    sidebar: {
      '/zh/guide/': { base: '/zh/guide/', items: sidebarGuide() },
      '/zh/reference/': { base: '/zh/reference/', items: sidebarReference() }
    },

    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页面'
    },

    footer: {
      message: '基于 MIT 许可发布',
      copyright: '版权所有 © 2019-至今 尤雨溪'
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    outline: {
      label: '页面导航'
    },

    lastUpdated: {
      text: '最后更新于'
    },

    notFound: {
      title: '页面未找到',
      quote:
        '但如果你不改变方向，并且继续寻找，你可能最终会到达你所前往的地方。',
      linkLabel: '前往首页',
      linkText: '带我回首页'
    },

    langMenuLabel: '多语言',
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    skipToContentLabel: '跳转到内容'
  }
})

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: '指南',
      link: '/zh/guide/what-is-vitepress',
      activeMatch: '/zh/guide/'
    },
    {
      text: '参考',
      link: '/zh/reference/site-config',
      activeMatch: '/zh/reference/'
    },
    {
      text: pkg.version,
      items: [
        {
          text: '1.6.4',
          link: 'https://vuejs.github.io/vitepress/v1/zh/'
        },
        {
          text: '更新日志',
          link: 'https://github.com/vuejs/vitepress/blob/main/CHANGELOG.md'
        },
        {
          text: '参与贡献',
          link: 'https://github.com/vuejs/vitepress/blob/main/.github/contributing.md'
        }
      ]
    }
  ]
}

function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: '简介',
      collapsed: false,
      items: [
        { text: '什么是 VitePress？', link: 'what-is-vitepress' },
        { text: '快速开始', link: 'getting-started' },
        { text: '路由', link: 'routing' },
        { text: '部署', link: 'deploy' }
      ]
    },
    {
      text: '写作',
      collapsed: false,
      items: [
        { text: 'Markdown 扩展', link: 'markdown' },
        { text: '资源处理', link: 'asset-handling' },
        { text: 'frontmatter', link: 'frontmatter' },
        { text: '在 Markdown 使用 Vue', link: 'using-vue' },
        { text: '国际化', link: 'i18n' }
      ]
    },
    {
      text: '自定义',
      collapsed: false,
      items: [
        { text: '自定义主题', link: 'custom-theme' },
        { text: '扩展默认主题', link: 'extending-default-theme' },
        { text: '构建时数据加载', link: 'data-loading' },
        { text: 'SSR 兼容性', link: 'ssr-compat' },
        { text: '连接 CMS', link: 'cms' }
      ]
    },
    {
      text: '实验性功能',
      collapsed: false,
      items: [
        { text: 'MPA 模式', link: 'mpa-mode' },
        { text: 'sitemap 生成', link: 'sitemap-generation' }
      ]
    },
    { text: '配置和 API 参考', base: '/zh/reference/', link: 'site-config' }
  ]
}

function sidebarReference(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: '参考',
      items: [
        { text: '站点配置', link: 'site-config' },
        { text: 'frontmatter 配置', link: 'frontmatter-config' },
        { text: '运行时 API', link: 'runtime-api' },
        { text: 'CLI', link: 'cli' },
        {
          text: '默认主题',
          base: '/zh/reference/default-theme-',
          items: [
            { text: '概览', link: 'config' },
            { text: '导航栏', link: 'nav' },
            { text: '侧边栏', link: 'sidebar' },
            { text: '主页', link: 'home-page' },
            { text: '页脚', link: 'footer' },
            { text: '布局', link: 'layout' },
            { text: '徽章', link: 'badge' },
            { text: '团队页', link: 'team-page' },
            { text: '上下页链接', link: 'prev-next-links' },
            { text: '编辑链接', link: 'edit-link' },
            { text: '最后更新时间戳', link: 'last-updated' },
            { text: '搜索', link: 'search' },
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
        buttonText: '搜索',
        buttonAriaLabel: '搜索'
      },
      modal: {
        searchBox: {
          clearButtonTitle: '清除',
          clearButtonAriaLabel: '清除查询',
          closeButtonText: '关闭',
          closeButtonAriaLabel: '关闭',
          placeholderText: '搜索文档或向 AI 提问',
          placeholderTextAskAi: '再问一个问题...',
          placeholderTextAskAiStreaming: '正在回答...',
          searchInputLabel: '搜索',
          backToKeywordSearchButtonText: '返回关键词搜索',
          backToKeywordSearchButtonAriaLabel: '返回关键词搜索',
          newConversationPlaceholder: '提问',
          conversationHistoryTitle: '我的对话历史',
          startNewConversationText: '开始新的对话',
          viewConversationHistoryText: '对话历史',
          threadDepthErrorPlaceholder: '对话已达上限'
        },
        newConversation: {
          newConversationTitle: '我今天能帮你什么？',
          newConversationDescription:
            '我会搜索你的文档，快速帮你找到设置指南、功能细节和故障排除提示。'
        },
        footer: {
          selectText: '选择',
          submitQuestionText: '提交问题',
          selectKeyAriaLabel: '回车键',
          navigateText: '导航',
          navigateUpKeyAriaLabel: '向上箭头',
          navigateDownKeyAriaLabel: '向下箭头',
          closeText: '关闭',
          backToSearchText: '返回搜索',
          closeKeyAriaLabel: 'Esc 键',
          poweredByText: '由…提供支持'
        },
        errorScreen: {
          titleText: '无法获取结果',
          helpText: '你可能需要检查网络连接。'
        },
        startScreen: {
          recentSearchesTitle: '最近',
          noRecentSearchesText: '暂无最近搜索',
          saveRecentSearchButtonTitle: '保存此搜索',
          removeRecentSearchButtonTitle: '从历史记录中移除此搜索',
          favoriteSearchesTitle: '收藏',
          removeFavoriteSearchButtonTitle: '从收藏中移除此搜索',
          recentConversationsTitle: '最近对话',
          removeRecentConversationButtonTitle: '从历史记录中移除此对话'
        },
        noResultsScreen: {
          noResultsText: '未找到相关结果',
          suggestedQueryText: '尝试搜索',
          reportMissingResultsText: '认为此查询应该有结果？',
          reportMissingResultsLinkText: '告诉我们。'
        },
        resultsScreen: {
          askAiPlaceholder: '询问 AI：',
          noResultsAskAiPlaceholder: '文档里没找到？让 Ask AI 帮忙：'
        },
        askAiScreen: {
          disclaimerText: '回答由 AI 生成，可能会出错。请核实。',
          relatedSourcesText: '相关来源',
          thinkingText: '思考中...',
          copyButtonText: '复制',
          copyButtonCopiedText: '已复制！',
          copyButtonTitle: '复制',
          likeButtonTitle: '喜欢',
          dislikeButtonTitle: '不喜欢',
          thanksForFeedbackText: '感谢你的反馈！',
          preToolCallText: '搜索中...',
          duringToolCallText: '搜索中...',
          afterToolCallText: '已搜索',
          stoppedStreamingText: '你已停止此回复',
          errorTitleText: '聊天错误',
          threadDepthExceededMessage: '为保持回答准确，此对话已关闭。',
          startNewConversationButtonText: '开始新的对话'
        }
      }
    },
    askAi: {
      sidePanel: {
        button: {
          translations: {
            buttonText: '询问 AI',
            buttonAriaLabel: '询问 AI'
          }
        },
        panel: {
          translations: {
            header: {
              title: '询问 AI',
              conversationHistoryTitle: '我的对话历史',
              newConversationText: '开始新的对话',
              viewConversationHistoryText: '对话历史'
            },
            promptForm: {
              promptPlaceholderText: '提问',
              promptAnsweringText: '正在回答...',
              promptAskAnotherQuestionText: '再问一个问题',
              promptDisclaimerText: '回答由 AI 生成，可能会出错。',
              promptLabelText: '按回车发送，Shift+回车换行。',
              promptAriaLabelText: '问题输入'
            },
            conversationScreen: {
              preToolCallText: '搜索中...',
              searchingText: '搜索中...',
              toolCallResultText: '已搜索',
              conversationDisclaimer: '回答由 AI 生成，可能会出错。请核实。',
              reasoningText: '推理中...',
              thinkingText: '思考中...',
              relatedSourcesText: '相关来源',
              stoppedStreamingText: '你已停止此回复',
              copyButtonText: '复制',
              copyButtonCopiedText: '已复制！',
              likeButtonTitle: '喜欢',
              dislikeButtonTitle: '不喜欢',
              thanksForFeedbackText: '感谢你的反馈！',
              errorTitleText: '聊天错误'
            },
            newConversationScreen: {
              titleText: '我今天能帮你什么？',
              introductionText:
                '我会搜索你的文档，快速帮你找到设置指南、功能细节和故障排除提示。'
            },
            logo: {
              poweredByText: '由…提供支持'
            }
          }
        }
      }
    }
  }
}
