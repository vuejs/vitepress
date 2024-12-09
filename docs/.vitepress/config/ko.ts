import { createRequire } from 'module'
import { defineConfig, type DefaultTheme } from 'vitepress'

const require = createRequire(import.meta.url)
const pkg = require('vitepress/package.json')

export const ko = defineConfig({
  lang: 'ko-KR',
  description: 'Vite 및 Vue 기반 정적 사이트 생성기.',

  themeConfig: {
    nav: nav(),

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

export const search: DefaultTheme.AlgoliaSearchOptions['locales'] = {
  ko: {
    placeholder: '문서 검색',
    translations: {
      button: {
        buttonText: '검색',
        buttonAriaLabel: '검색'
      },
      modal: {
        searchBox: {
          resetButtonTitle: '검색 지우기',
          resetButtonAriaLabel: '검색 지우기',
          cancelButtonText: '취소',
          cancelButtonAriaLabel: '취소'
        },
        startScreen: {
          recentSearchesTitle: '검색 기록',
          noRecentSearchesText: '최근 검색 없음',
          saveRecentSearchButtonTitle: '검색 기록에 저장',
          removeRecentSearchButtonTitle: '검색 기록에서 삭제',
          favoriteSearchesTitle: '즐겨찾기',
          removeFavoriteSearchButtonTitle: '즐겨찾기에서 삭제'
        },
        errorScreen: {
          titleText: '결과를 가져올 수 없습니다',
          helpText: '네트워크 연결을 확인하세요'
        },
        footer: {
          selectText: '선택',
          navigateText: '탐색',
          closeText: '닫기',
          searchByText: '검색 기준'
        },
        noResultsScreen: {
          noResultsText: '결과를 찾을 수 없습니다',
          suggestedQueryText: '새로운 검색을 시도할 수 있습니다',
          reportMissingResultsText: '해당 검색어에 대한 결과가 있어야 합니까?',
          reportMissingResultsLinkText: '피드백 보내기 클릭'
        }
      }
    }
  }
}
