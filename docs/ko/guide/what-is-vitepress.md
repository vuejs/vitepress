# VitePress란 무엇인가? {#what-is-vitepress}

VitePress는 빠르고 컨텐츠 중심의 웹사이트를 구축하기 위해 설계된 [정적 사이트 생성기](https://en.wikipedia.org/wiki/Static_site_generator) (SSG)입니다. 간단히 말해, VitePress는 [Markdown](https://en.wikipedia.org/wiki/Markdown)으로 작성된 소스 컨텐츠를 가져와서 테마를 적용하고, 어디에나 쉽게 배포할 수 있는 정적 HTML 페이지를 생성합니다.

<div class="tip custom-block" style="padding-top: 8px">

그냥 시도해보고 싶으세요? [빠른 시작](./getting-started)으로 건너뛰세요.

</div>

## 사용 사례 {#use-cases}

- **문서화**

  VitePress는 기술 문서를 위해 설계된 기본 테마와 함께 제공됩니다. 이 테마는 바로 지금 읽고 있는 이 페이지뿐만 아니라 [Vite](https://vitejs.dev/), [Rollup](https://rollupjs.org/), [Pinia](https://pinia.vuejs.org/), [VueUse](https://vueuse.org/), [Vitest](https://vitest.dev/), [D3](https://d3js.org/), [UnoCSS](https://unocss.dev/), [Iconify](https://iconify.design/) 그리고 [기타 많은](https://www.vuetelescope.com/explore?framework.slug=vitepress) 문서화에 힘을 실어줍니다.

  [공식 Vue.js 문서](https://vuejs.org/)도 VitePress 기반으로 되어 있지만, 여러 번역 간에 공유되는 커스텀 테마를 사용합니다.

- **블로그, 포트폴리오 및 마케팅 사이트**

  VitePress는 표준 Vite + Vue 애플리케이션의 개발자 경험과 함께 [완전히 맞춤화된 테마](./custom-theme)를 지원합니다. Vite 기반이기 때문에 풍부한 생태계에서 Vite 플러그인을 직접 활용할 수 있습니다. 또한, VitePress는 [데이터 불러오기](./data-loading) (로컬 또는 원격) 및 [동적으로 경로 생성하기](./routing#dynamic-routes)를 위한 유연한 API를 제공합니다. 빌드 시점에 데이터를 결정할 수 있다면 거의 모든 것을 구축할 수 있습니다.

  공식 [Vue.js 블로그](https://blog.vuejs.org/)는 로컬 콘텐츠를 기반으로 색인 페이지를 생성하는 간단한 블로그입니다.

## 개발자 경험 {#developer-experience}

VitePress는 Markdown 컨텐츠를 다룰 때 훌륭한 개발자 경험(DX)을 제공하고자 합니다.

- **[Vite 구동:](https://vitejs.dev/)** 즉각적인 서버 시작이 가능하며, 페이지 새로고침 없이 항상 (<100ms) 즉시 수정 사항이 반영됩니다.

- **[내장 Markdown 확장 기능:](./markdown)** Frontmatter, 테이블, 구문 하이라이팅… 필요한 것이라면 무엇이든 있습니다. 특히, VitePress는 코드 블록과 작업할 때 많은 고급 기능을 제공하여 기술적 문서에 이상적입니다.

- **[Vue를 향상된 Markdown:](./using-vue)** 각 Markdown 페이지는 HTML과 100% 문법 호환성을 가진 Vue 템플릿 덕분에 Vue [단일 파일 컴포넌트](https://vuejs.org/guide/scaling-up/sfc.html)입니다. Vue 템플릿 기능이나 가져온 Vue 컴포넌트를 사용하여 정적 콘텐츠에 상호작용성을 삽입할 수 있습니다.

## 성능 {#performance}

전통적인 SSG들과 달리 각 탐색이 전체 페이지 새로고침을 초래하는 것이 아니라, VitePress로 생성된 웹사이트는 초기 방문 시 정적 HTML을 제공하지만, 사이트 내 이후 탐색에 대해서는 [싱글 페이지 애플리케이션](https://en.wikipedia.org/wiki/Single-page_application) (SPA)이 됩니다. 우리의 견해에 따르면, 이 모델은 성능에 있어 최적의 균형을 제공합니다:

- **빠른 초기 로딩**

  어떤 페이지에 대한 초기 방문은 빠른 로딩 속도와 최적의 SEO를 위해 정적으로 사전 렌더링된 HTML이 제공됩니다. 그런 다음 페이지는 Vue SPA로 페이지를 변환하는 JavaScript 번들을 로드합니다("hydration"). SPA hydration이 느리다는 일반적인 가정과 달리, 이 과정은 실제로 Vue 3의 순수 성능과 컴파일러 최적화 덕분에 매우 빠릅니다. [PageSpeed Insights](https://pagespeed.web.dev/report?url=https%3A%2F%2Fvitepress.dev%2F)에서 일반적인 VitePress 사이트는 저사양 모바일 장치에서도 느린 네트워크에서 거의 완벽한 성능 점수를 달성합니다.

- **빠른 후속 로드 탐색**

  더 중요한 것은 초기 로드 **이후** 사용자 경험이 개선된다는 것입니다. 사이트 내의 이후 탐색에서는 전체 페이지 새로고침이 더 이상 발생하지 않습니다. 대신, 들어오는 페이지의 콘텐츠가 가져와져 동적으로 업데이트됩니다. VitePress는 또한 뷰포트 내 링크에 대한 페이지 청크를 자동으로 사전 로드합니다. 대부분의 경우, 이후 로드 탐색은 즉각적으로 느껴질 것입니다.

- **패널티 없는 상호작용성**

  정적 Markdown 내에 내장된 동적 Vue 파트를 hydrate할 수 있도록 각 Markdown 페이지는 Vue 컴포넌트로 처리되고 JavaScript로 컴파일됩니다. 이것은 비효율적으로 들릴 수 있지만, Vue 컴파일러는 정적 부분과 동적 부분을 분리하여 hydration 비용과 페이로드 크기를 최소화하는 데 충분히 똑똑합니다. 초기 페이지 로드에 대해서, 정적 부분은 JavaScript 페이로드에서 자동으로 제거되고 hydration 동안 건너뛰어집니다.

## VuePress는 어떤가요? {#what-about-vuepress}

VitePress는 VuePress의 영적 후계자입니다. 원래 VuePress는 Vue 2와 webpack에 기반을 두고 있었습니다. Vue 3와 Vite를 기반으로 한 VitePress는 훨씬 더 나은 DX, 더 나은 프로덕션 성능, 더 완성된 기본 테마, 그리고 더욱 유연한 커스터마이징 API를 제공합니다.

VitePress와 VuePress 사이의 API 차이는 주로 테마와 커스터마이징에 있습니다. 기본 테마를 사용하는 VuePress 1을 사용하는 경우, VitePress로 마이그레이션하는 것이 비교적 간단할 수 있습니다.

VuePress 2에도 투자된 노력이 있으며, 이것도 Vue 3와 Vite를 지원하고 VuePress 1과 더 호환됩니다. 그러나 동시에 두 개의 SSG를 병행하여 유지하는 것은 지속 가능하지 않으므로, Vue 팀은 장기적으로 주요 권장 SSG로 VitePress에 집중하기로 결정했습니다.
