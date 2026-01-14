---
outline: deep
---

# 검색 {#search}

## 로컬 검색 {#local-search}

VitePress는 [minisearch](https://github.com/lucaong/minisearch/)로 브라우저 내 인덱스를 사용하는 퍼지(full-text) 검색을 지원합니다. 이 기능을 활성화하려면 `.vitepress/config.ts` 파일에서 `themeConfig.search.provider` 옵션을 `'local'`로 설정하면 됩니다:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local'
    }
  }
})
```

예제 결과:

![검색 모달의 스크린샷](/search.png)

대안으로 [Algolia DocSearch](#algolia-search), <https://www.npmjs.com/package/vitepress-plugin-search>, <https://www.npmjs.com/package/vitepress-plugin-pagefind>와 같은 커뮤니티 플러그인을 사용할 수도 있습니다.

### i18n {#local-search-i18n}

다국어 검색을 사용하려면 다음과 같은 구성을 사용해야 합니다:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        locales: {
          ko: { // 기본 로케일을 번역하려면 이것을 `root`로 만드십시오.
            translations: {
              button: {
                buttonText: '검색',
                buttonAriaLabel: '검색'
              },
              modal: {
                displayDetails: '상세 목록 표시',
                resetButtonTitle: '검색 지우기',
                backButtonTitle: '검색 닫기',
                noResultsText: '결과를 찾을 수 없습니다',
                footer: {
                  selectText: '선택',
                  selectKeyAriaLabel: '선택하기',
                  navigateText: '탐색',
                  navigateUpKeyAriaLabel: '위로',
                  navigateDownKeyAriaLabel: '아래로',
                  closeText: '닫기',
                  closeKeyAriaLabel: 'esc'
                }
              }
            }
          }
        }
      }
    }
  }
})
```

### MiniSearch 옵션 {#mini-search-options}

MiniSearch를 다음과 같이 구성할 수 있습니다:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        miniSearch: {
          /**
           * @type {Pick<import('minisearch').Options, 'extractField' | 'tokenize' | 'processTerm'>}
           */
          options: {
            /* ... */
          },
          /**
           * @type {import('minisearch').SearchOptions}
           * @default
           * { fuzzy: 0.2, prefix: true, boost: { title: 4, text: 2, titles: 1 } }
           */
          searchOptions: {
            /* ... */
          }
        }
      }
    }
  }
})
```

더 자세한 내용은 [MiniSearch 문서](https://lucaong.github.io/minisearch/classes/MiniSearch.MiniSearch.html)를 참고하세요.

### 커스텀 컨텐츠 렌더러 {#custom-content-renderer}

마크다운 컨텐츠를 인덱싱하기 전에 렌더링하는 데 사용되는 함수를 커스터마이징할 수 있습니다:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        /**
         * @param {string} src
         * @param {import('vitepress').MarkdownEnv} env
         * @param {import('markdown-it-async')} md
         */
        async _render(src, env, md) {
          // return html string
        }
      }
    }
  }
})
```

이 함수는 클라이언트 사이드 사이트 데이터에서 제거되므로, Node.js API를 사용할 수 있습니다.

#### 예제: 검색에서 페이지 제외 {#example-excluding-pages-from-search}

페이지의 전문에 `search: false`를 추가하여 검색에서 해당 페이지를 제외할 수 있습니다. 또는:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        async _render(src, env, md) {
          const html = await md.renderAsync(src, env)
          if (env.frontmatter?.search === false) return ''
          if (env.relativePath.startsWith('some/path')) return ''
          return html
        }
      }
    }
  }
})
```

::: warning 참고
커스텀 `_render` 함수가 제공된 경우, `search: false` 전문을 직접 처리해야 합니다. 또한, `md.renderAsync`가 호출되기 전에 `env` 객체가 완전히 채워지지 않으므로, `frontmatter`와 같은 선택적 `env` 프로퍼티에 대한 검사는 그 이후에 수행해야 합니다.
:::

#### 예제: 콘텐츠 변환 - 앵커 추가 {#example-transforming-content-adding-anchors}

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        async _render(src, env, md) {
          const html = await md.renderAsync(src, env)
          if (env.frontmatter?.title)
            return await md.renderAsync(`# ${env.frontmatter.title}`) + html
          return html
        }
      }
    }
  }
})
```

## Algolia 검색 {#algolia-search}

VitePress는 [Algolia DocSearch](https://docsearch.algolia.com/docs/what-is-docsearch)를 사용한 문서 사이트 검색 기능을 지원합니다. 시작 가이드를 참고하세요. `.vitepress/config.ts`에서 이 기능을 사용하려면 최소한 다음 구성을 제공해야 합니다:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'algolia',
      options: {
        appId: '...',
        apiKey: '...',
        indexName: '...'
      }
    }
  }
})
```

### i18n {#algolia-search-i18n}

다국어 검색을 사용하려면 다음과 같이 구성해야 합니다:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'algolia',
      options: {
        appId: '...',
        apiKey: '...',
        indexName: '...',
        locales: {
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
      }
    }
  }
})
```

[이 옵션들](https://github.com/vuejs/vitepress/blob/main/types/docsearch.d.ts)은 재작성 할 수 있습니다. 이에 대해 자세히 알고 싶다면 Algolia 공식 문서를 참고하세요.

### 크롤러 구성 {#crawler-config}

이 사이트에서 사용하는 예제 구성을 소개합니다:

```ts
new Crawler({
  appId: '...',
  apiKey: '...',
  rateLimit: 8,
  startUrls: ['https://vitepress.dev/'],
  renderJavaScript: false,
  sitemaps: [],
  exclusionPatterns: [],
  ignoreCanonicalTo: false,
  discoveryPatterns: ['https://vitepress.dev/**'],
  schedule: 'at 05:10 on Saturday',
  actions: [
    {
      indexName: 'vitepress',
      pathsToMatch: ['https://vitepress.dev/**'],
      recordExtractor: ({ $, helpers }) => {
        return helpers.docsearch({
          recordProps: {
            lvl1: '.content h1',
            content: '.content p, .content li',
            lvl0: {
              selectors: 'section.has-active div h2',
              defaultValue: 'Documentation'
            },
            lvl2: '.content h2',
            lvl3: '.content h3',
            lvl4: '.content h4',
            lvl5: '.content h5'
          },
          indexHeadings: true
        })
      }
    }
  ],
  initialIndexSettings: {
    vitepress: {
      attributesForFaceting: ['type', 'lang'],
      attributesToRetrieve: ['hierarchy', 'content', 'anchor', 'url'],
      attributesToHighlight: ['hierarchy', 'hierarchy_camel', 'content'],
      attributesToSnippet: ['content:10'],
      camelCaseAttributes: ['hierarchy', 'hierarchy_radio', 'content'],
      searchableAttributes: [
        'unordered(hierarchy_radio_camel.lvl0)',
        'unordered(hierarchy_radio.lvl0)',
        'unordered(hierarchy_radio_camel.lvl1)',
        'unordered(hierarchy_radio.lvl1)',
        'unordered(hierarchy_radio_camel.lvl2)',
        'unordered(hierarchy_radio.lvl2)',
        'unordered(hierarchy_radio_camel.lvl3)',
        'unordered(hierarchy_radio.lvl3)',
        'unordered(hierarchy_radio_camel.lvl4)',
        'unordered(hierarchy_radio.lvl4)',
        'unordered(hierarchy_radio_camel.lvl5)',
        'unordered(hierarchy_radio.lvl5)',
        'unordered(hierarchy_radio_camel.lvl6)',
        'unordered(hierarchy_radio.lvl6)',
        'unordered(hierarchy_camel.lvl0)',
        'unordered(hierarchy.lvl0)',
        'unordered(hierarchy_camel.lvl1)',
        'unordered(hierarchy.lvl1)',
        'unordered(hierarchy_camel.lvl2)',
        'unordered(hierarchy.lvl2)',
        'unordered(hierarchy_camel.lvl3)',
        'unordered(hierarchy.lvl3)',
        'unordered(hierarchy_camel.lvl4)',
        'unordered(hierarchy.lvl4)',
        'unordered(hierarchy_camel.lvl5)',
        'unordered(hierarchy.lvl5)',
        'unordered(hierarchy_camel.lvl6)',
        'unordered(hierarchy.lvl6)',
        'content'
      ],
      distinct: true,
      attributeForDistinct: 'url',
      customRanking: [
        'desc(weight.pageRank)',
        'desc(weight.level)',
        'asc(weight.position)'
      ],
      ranking: [
        'words',
        'filters',
        'typo',
        'attribute',
        'proximity',
        'exact',
        'custom'
      ],
      highlightPreTag: '<span class="algolia-docsearch-suggestion--highlight">',
      highlightPostTag: '</span>',
      minWordSizefor1Typo: 3,
      minWordSizefor2Typos: 7,
      allowTyposOnNumericTokens: false,
      minProximity: 1,
      ignorePlurals: true,
      advancedSyntax: true,
      attributeCriteriaComputedByMinProximity: true,
      removeWordsIfNoResults: 'allOptional'
    }
  }
})
```

### Algolia Ask AI 지원 {#ask-ai}

**Ask AI** 기능을 사용하려면 `askAi` 옵션을 추가하세요:

```ts
options: {
  appId: '...',
  apiKey: '...',
  indexName: '...',
  askAi: { assistantId: 'XXXYYY' }
}
```

::: warning 참고
Ask AI를 사용하지 않으려면 `askAi` 옵션을 생략하면 됩니다.
:::

**모달** 내부의 Ask AI 번역은 `options.translations.modal.askAiScreen`과 `options.translations.modal.resultsScreen`에 있습니다. 모든 키는 [타입 정의](https://github.com/vuejs/vitepress/blob/main/types/docsearch.d.ts)를 참조하세요.

### Ask AI 사이드 패널 {#ask-ai-side-panel}

DocSearch v4.5+는 선택적 **Ask AI 사이드 패널**을 지원합니다. 활성화되면 기본적으로 **Ctrl/Cmd+I**로 열 수 있습니다. [사이드 패널 API 참조](https://docsearch.algolia.com/docs/sidepanel/api-reference)에 전체 옵션 목록이 있습니다.

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'algolia',
      options: {
        appId: '...',
        apiKey: '...',
        indexName: '...',
        askAi: {
          assistantId: 'XXXYYY',
          sidePanel: {
            // 플랫 설정 – @docsearch/sidepanel-js API 반영
            variant: 'floating', // 또는 'inline'
            side: 'right',
            width: '360px',
            expandedWidth: '580px',
            suggestedQuestions: true
          }
        }
      }
    }
  }
})
```

키보드 단축키를 비활성화해야 하는 경우 사이드 패널의 `keyboardShortcuts` 옵션을 사용하세요:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'algolia',
      options: {
        appId: '...',
        apiKey: '...',
        indexName: '...',
        askAi: {
          assistantId: 'XXXYYY',
          sidePanel: {
            keyboardShortcuts: {
              'Ctrl/Cmd+I': false
            }
          }
        }
      }
    }
  }
})
```

#### 사이드 패널 i18n

사이드 패널 번역은 `options.askAi.sidePanel` 아래에서 구성됩니다 (예: `options.askAi.sidePanel.panel.translations`). 전체 구조는 [타입 정의](https://github.com/vuejs/vitepress/blob/main/types/docsearch.d.ts)를 참조하세요.

### 모드 (auto / sidePanel / hybrid / modal) {#ask-ai-mode}

VitePress가 키워드 검색과 Ask AI를 통합하는 방식을 선택적으로 제어할 수 있습니다:

- `mode: 'auto'` (기본값): 키워드 검색이 구성된 경우 `hybrid`를 추론하고, 그렇지 않으면 Ask AI 사이드 패널이 구성된 경우 `sidePanel`을 추론합니다.
- `mode: 'sidePanel'`: 사이드 패널만 강제 (키워드 검색 버튼 숨김).
- `mode: 'hybrid'`: 키워드 검색 모달 + Ask AI 사이드 패널 활성화 (키워드 검색 구성 필요).
- `mode: 'modal'`: Ask AI를 DocSearch 모달 내부에 유지 (사이드 패널을 구성한 경우에도).

### Ask AI만 (키워드 검색 없음) {#ask-ai-only}

**Ask AI 사이드 패널만** 사용하려면 최상위 키워드 검색 구성을 생략하고 `askAi` 아래에 자격 증명을 제공할 수 있습니다:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'algolia',
      options: {
        mode: 'sidePanel',
        askAi: {
          assistantId: 'XXXYYY',
          appId: '...',
          apiKey: '...',
          indexName: '...',
          sidePanel: true
        }
      }
    }
  }
})
```
