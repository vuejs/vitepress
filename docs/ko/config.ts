import { createRequire } from 'module'
import { defineAdditionalConfig, type DefaultTheme } from 'vitepress'

const require = createRequire(import.meta.url)
const pkg = require('vitepress/package.json')

export default defineAdditionalConfig({
  description: 'Vite 및 Vue 기반 정적 사이트 생성기.',

  themeConfig: {
    nav: nav(),

    search: { options: searchOptions() },

    sidebar: {
      '/ko/guide/': { base: '/ko/guide/', items: sidebarGuide() },
      '/ko/reference/': { base: '/ko/reference/', items: sidebarReference() }
    },

    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
      text: '이 페이지 편집 제안하기'
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2019-present Evan You'
    },

    docFooter: {
      prev: '이전',
      next: '다음'
    },

    outline: {
      label: '이 페이지 목차'
    },

    lastUpdated: {
      text: '업데이트 날짜'
    },

    notFound: {
      title: '페이지를 찾을 수 없습니다',
      quote:
        '방향을 바꾸지 않고 계속 찾다 보면 결국 당신이 가고 있는 곳에 도달할 수도 있습니다.',
      linkLabel: '홈으로 가기',
      linkText: '집으로 데려가줘'
    },

    langMenuLabel: '언어 변경',
    returnToTopLabel: '맨 위로 돌아가기',
    sidebarMenuLabel: '사이드바 메뉴',
    darkModeSwitchLabel: '다크 모드',
    lightModeSwitchTitle: '라이트 모드로 변경',
    darkModeSwitchTitle: '다크 모드로 변경',
    skipToContentLabel: '본문으로 건너뛰기'
  }
})

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: '가이드',
      link: '/ko/guide/what-is-vitepress',
      activeMatch: '/ko/guide/'
    },
    {
      text: '레퍼런스',
      link: '/ko/reference/site-config',
      activeMatch: '/ko/reference/'
    },
    {
      text: pkg.version,
      items: [
        {
          text: '1.6.4',
          link: 'https://vuejs.github.io/vitepress/v1/ko/'
        },
        {
          text: '변경 로그',
          link: 'https://github.com/vuejs/vitepress/blob/main/CHANGELOG.md'
        },
        {
          text: '기여',
          link: 'https://github.com/vuejs/vitepress/blob/main/.github/contributing.md'
        }
      ]
    }
  ]
}

function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: '소개',
      collapsed: false,
      items: [
        {
          text: 'VitePress란 무엇인가?',
          link: 'what-is-vitepress'
        },
        {
          text: '시작하기',
          link: 'getting-started'
        },
        {
          text: '라우팅',
          link: 'routing'
        },
        {
          text: '배포하기',
          link: 'deploy'
        }
      ]
    },
    {
      text: '글쓰기',
      collapsed: false,
      items: [
        {
          text: '마크다운 확장 기능',
          link: 'markdown'
        },
        {
          text: '에셋 핸들링',
          link: 'asset-handling'
        },
        {
          text: '전문(Front-matter)',
          link: 'frontmatter'
        },
        {
          text: '마크다운에서 Vue 사용하기',
          link: 'using-vue'
        },
        {
          text: 'i18n',
          link: 'i18n'
        }
      ]
    },
    {
      text: '커스텀',
      collapsed: false,
      items: [
        {
          text: '커스텀 테마 사용하기',
          link: 'custom-theme'
        },
        {
          text: '기본 테마 확장하기',
          link: 'extending-default-theme'
        },
        {
          text: '빌드할 때 데이터 로딩하기',
          link: 'data-loading'
        },
        {
          text: 'SSR 호환성',
          link: 'ssr-compat'
        },
        {
          text: 'CMS 연결하기',
          link: 'cms'
        }
      ]
    },
    {
      text: '실험적인',
      collapsed: false,
      items: [
        {
          text: 'MPA 모드',
          link: 'mpa-mode'
        },
        {
          text: '사이트맵 생성',
          link: 'sitemap-generation'
        }
      ]
    },
    {
      text: '구성 & API 레퍼런스',
      base: '/ko/reference/',
      link: 'site-config'
    }
  ]
}

function sidebarReference(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: '레퍼런스',
      items: [
        { text: '사이트 구성', link: 'site-config' },
        { text: '전문(front-matter) 구성', link: 'frontmatter-config' },
        { text: '런타임 API', link: 'runtime-api' },
        { text: 'CLI', link: 'cli' },
        {
          text: '기본 테마',
          base: '/ko/reference/default-theme-',
          items: [
            { text: '개요', link: 'config' },
            { text: '네비게이션 바', link: 'nav' },
            { text: '사이드바', link: 'sidebar' },
            { text: '홈 페이지', link: 'home-page' },
            { text: '푸터', link: 'footer' },
            { text: '레이아웃', link: 'layout' },
            { text: '배지(badge)', link: 'badge' },
            { text: '팀 페이지', link: 'team-page' },
            { text: '이전/다음 링크', link: 'prev-next-links' },
            { text: '편집 링크', link: 'edit-link' },
            { text: '마지막 업데이트 날짜', link: 'last-updated' },
            { text: '검색', link: 'search' },
            { text: '카본 광고', link: 'carbon-ads' }
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
        buttonText: '검색',
        buttonAriaLabel: '검색'
      },
      modal: {
        searchBox: {
          clearButtonTitle: '지우기',
          clearButtonAriaLabel: '검색어 지우기',
          closeButtonText: '닫기',
          closeButtonAriaLabel: '닫기',
          placeholderText: '문서를 검색하거나 Ask AI에 질문',
          placeholderTextAskAi: '다른 질문하기...',
          placeholderTextAskAiStreaming: '답변 중...',
          searchInputLabel: '검색',
          backToKeywordSearchButtonText: '키워드 검색으로 돌아가기',
          backToKeywordSearchButtonAriaLabel: '키워드 검색으로 돌아가기',
          newConversationPlaceholder: '질문하기',
          conversationHistoryTitle: '내 대화 기록',
          startNewConversationText: '새 대화 시작',
          viewConversationHistoryText: '대화 기록',
          threadDepthErrorPlaceholder: '대화 한도에 도달했습니다'
        },
        newConversation: {
          newConversationTitle: '오늘 무엇을 도와드릴까요?',
          newConversationDescription:
            '문서를 검색해 설정 가이드, 기능 설명, 문제 해결 팁을 빠르게 찾아드립니다.'
        },
        footer: {
          selectText: '선택',
          submitQuestionText: '질문 제출',
          selectKeyAriaLabel: 'Enter 키',
          navigateText: '이동',
          navigateUpKeyAriaLabel: '위 화살표',
          navigateDownKeyAriaLabel: '아래 화살표',
          closeText: '닫기',
          backToSearchText: '검색으로 돌아가기',
          closeKeyAriaLabel: 'Escape 키',
          poweredByText: '제공'
        },
        errorScreen: {
          titleText: '결과를 불러올 수 없습니다',
          helpText: '네트워크 연결을 확인해 주세요.'
        },
        startScreen: {
          recentSearchesTitle: '최근',
          noRecentSearchesText: '최근 검색이 없습니다',
          saveRecentSearchButtonTitle: '이 검색 저장',
          removeRecentSearchButtonTitle: '기록에서 이 검색 제거',
          favoriteSearchesTitle: '즐겨찾기',
          removeFavoriteSearchButtonTitle: '즐겨찾기에서 이 검색 제거',
          recentConversationsTitle: '최근 대화',
          removeRecentConversationButtonTitle: '기록에서 이 대화 제거'
        },
        noResultsScreen: {
          noResultsText: '다음에 대한 결과를 찾을 수 없습니다',
          suggestedQueryText: '다음을 검색해 보세요',
          reportMissingResultsText: '이 검색은 결과가 있어야 하나요?',
          reportMissingResultsLinkText: '알려주세요.'
        },
        resultsScreen: {
          askAiPlaceholder: 'AI에게 묻기: ',
          noResultsAskAiPlaceholder: '문서에서 찾지 못했나요? Ask AI에 문의: '
        },
        askAiScreen: {
          disclaimerText:
            '답변은 AI가 생성하며 오류가 있을 수 있습니다. 확인해 주세요.',
          relatedSourcesText: '관련 출처',
          thinkingText: '생각 중...',
          copyButtonText: '복사',
          copyButtonCopiedText: '복사됨!',
          copyButtonTitle: '복사',
          likeButtonTitle: '좋아요',
          dislikeButtonTitle: '싫어요',
          thanksForFeedbackText: '피드백 감사합니다!',
          preToolCallText: '검색 중...',
          duringToolCallText: '검색 중...',
          afterToolCallText: '검색함',
          stoppedStreamingText: '이 응답을 중지했습니다',
          errorTitleText: '채팅 오류',
          threadDepthExceededMessage:
            '정확성을 유지하기 위해 이 대화는 종료되었습니다.',
          startNewConversationButtonText: '새 대화 시작'
        }
      }
    },
    askAi: {
      sidePanel: {
        button: {
          translations: {
            buttonText: 'AI에게 묻기',
            buttonAriaLabel: 'AI에게 묻기'
          }
        },
        panel: {
          translations: {
            header: {
              title: 'AI에게 묻기',
              conversationHistoryTitle: '내 대화 기록',
              newConversationText: '새 대화 시작',
              viewConversationHistoryText: '대화 기록'
            },
            promptForm: {
              promptPlaceholderText: '질문하기',
              promptAnsweringText: '답변 중...',
              promptAskAnotherQuestionText: '다른 질문하기',
              promptDisclaimerText:
                '답변은 AI가 생성하며 오류가 있을 수 있습니다.',
              promptLabelText: 'Enter로 전송, Shift+Enter로 줄바꿈.',
              promptAriaLabelText: '프롬프트 입력'
            },
            conversationScreen: {
              preToolCallText: '검색 중...',
              searchingText: '검색 중...',
              toolCallResultText: '검색함',
              conversationDisclaimer:
                '답변은 AI가 생성하며 오류가 있을 수 있습니다. 확인해 주세요.',
              reasoningText: '추론 중...',
              thinkingText: '생각 중...',
              relatedSourcesText: '관련 출처',
              stoppedStreamingText: '이 응답을 중지했습니다',
              copyButtonText: '복사',
              copyButtonCopiedText: '복사됨!',
              likeButtonTitle: '좋아요',
              dislikeButtonTitle: '싫어요',
              thanksForFeedbackText: '피드백 감사합니다!',
              errorTitleText: '채팅 오류'
            },
            newConversationScreen: {
              titleText: '오늘 무엇을 도와드릴까요?',
              introductionText:
                '문서를 검색해 설정 가이드, 기능 설명, 문제 해결 팁을 빠르게 찾아드립니다.'
            },
            logo: {
              poweredByText: '제공'
            }
          }
        }
      }
    }
  }
}
