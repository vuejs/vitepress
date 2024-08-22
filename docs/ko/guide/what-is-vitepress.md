# VitePress란 무엇인가? {#what-is-vitepress}

VitePress는 빠르고 컨텐츠 중심의 웹사이트를 구축하기 위해 설계된 [정적 사이트 생성기](https://en.wikipedia.org/wiki/Static_site_generator) (SSG)입니다. 다시말해 VitePress는 [마크다운](https://en.wikipedia.org/wiki/Markdown)으로 작성된 소스 컨텐츠를 가져와서 테마를 적용하고, 어디에나 쉽게 배포할 수 있는 정적 HTML 페이지를 생성합니다.

<div class="tip custom-block" style="padding-top: 8px">

그냥 한번 사용해보고 싶으신가요? [빠른 시작](./getting-started)으로 건너뛰세요.

</div>

## 사용 사례 {#use-cases}

- **문서화**

  VitePress는 기술 문서를 위해 설계된 기본 테마가 함께 제공됩니다. 지금 읽고 있는 이 페이지와 [Vite](https://vitejs.dev/), [Rollup](https://rollupjs.org/), [Pinia](https://pinia.vuejs.org/), [VueUse](https://vueuse.org/), [Vitest](https://vitest.dev/), [D3](https://d3js.org/), [UnoCSS](https://unocss.dev/), [Iconify](https://iconify.design/) 및 [다양한 프로젝트](https://www.vuetelescope.com/explore?framework.slug=vitepress) 문서는  모두 이 테마를 기반으로 합니다.

  [Vue.js 공식 문서](https://vuejs.org/)도 VitePress 기반으로 되어 있으며, 여러 번역본에 걸쳐 공유되는 커스텀 테마를 사용합니다.

- **블로그, 포트폴리오 및 마케팅 사이트**

  VitePress는 표준 Vite + Vue 애플리케이션의 개발자 경험을 가진 [커스텀 테마](./custom-theme)를 지원합니다. Vite 기반이기 때문에 Vite 생태계의 풍부한 플러그인을 직접 활용할 수 있습니다. 또한, VitePress는 [데이터 로딩](./data-loading) (로컬 또는 원격) 및 [동적 라우트 생성](./routing#dynamic-routes)을 위한 유연한 API를 제공합니다. 빌드 시점에 데이터를 결정할 수 있다면 거의 모든 것을 구축할 수 있습니다.

  공식 [Vue.js 블로그](https://blog.vuejs.org/)는 로컬 콘텐츠 기반의 인덱스 페이지를 생성하는 간단한 블로그입니다.

## 개발자 경험 {#developer-experience}

VitePress는 마크다운 컨텐츠를 다룰 때 훌륭한 개발자 경험(DX)을 제공하고자 합니다.

- **[Vite로 작동](https://vitejs.dev/)**: 즉각적인 서버 시작 가능, 페이지 새로고침 없이 즉시(<100ms) 수정 사항 반영.

- **[내장된 마크다운 확장 기능](./markdown)**: 서문, 표, 구문 강조 등 무엇이든 가능. 특히 VitePress는 코드 블록 작업을 위한 고급 기능을 많이 제공하여 기술적 문서에 이상적.

- **[Vue로 향상된 마크다운](./using-vue)**: 각 마크다운 페이지는 HTML과 100% 문법 호환성을 가진 Vue [단일 파일 컴포넌트](https://vuejs.org/guide/scaling-up/sfc.html)입니다. Vue 템플릿 기능이나 컴포넌트를 사용하여 정적 콘텐츠에 상호작용 기능을 포함할 수 있습니다.

## 성능 {#performance}

전통적인 SSG들과 달리, VitePress로 생성된 웹사이트는 초기 방문 시 정적 HTML을 제공하지만, 이후 사이트 내 탐색에 대해서는 [단일 페이지 애플리케이션](https://en.wikipedia.org/wiki/Single-page_application) (SPA)이 됩니다. 이 모델은 성능에 대한 최적의 균형을 제공합니다:

- **빠른 초기 로딩**

  초기 페이지 방문은 사전 렌더링된 HTML을 제공하여 빠른 로딩 속도와 최적의 SEO를 제공합니다. 그 후 페이지를 Vue SPA로 전환하는 JavaScript 번들이 로드됩니다(이것을 "하이드레이션"이라고 함). 일반적으로 SPA 하이드레이션이 느리다고 생각할 수 있지만, Vue 3의 성능과 컴파일러 최적화 덕분에 이 과정은 매우 빠릅니다. [PageSpeed Insights](https://pagespeed.web.dev/report?url=https%3A%2F%2Fvitepress.dev%2F)에서 일반적인 VitePress 사이트는 네트워크 속도가 느린 저가형 모바일 기기에서도 거의 완벽한 성능 점수를 얻습니다.

- **빠른 포스트 로드 탐색**

  더 중요한 것은 SPA 모델이 처음 로드된 후 더 나은 UX를 제공한다는 것입니다. 이후 사이트 내에서 탐색을 해도 전체 페이지가 다시 로드되는 현상이 더 이상 발생하지 않습니다. 대신 페이지의 콘텐츠를 불러와 동적으로 업데이트 합니다. 또한 VitePress는 뷰포트 내에 있는 링크의 페이지 청크를 자동으로 미리 가져옵니다. 이렇게 하면 대부분의 경우 유저는 이미 로드된 페이지에서 탐색할 때 새 페이지가 즉시 로드됩니다.

- **페널티 없는 상호작용**

  정적 마크다운 내에 내장된 동적 Vue 부분을 하이드레이션 할 수 있도록 각 마크다운 페이지는 Vue 컴포넌트로 처리되고 JavaScript로 컴파일됩니다. 이는 비효율적으로 보일 수 있지만, Vue 컴파일러는 정적 부분과 동적 부분을 분리하여 하이드레이션 비용과 페이로드 크기를 최소화합니다. 초기 페이지 로드 시, 정적 부분은 자동으로 JavaScript 페이로드에서 제거되고 하이드레이션 중 건너뜁니다.

## VuePress는 어떤가요? {#what-about-vuepress}

VitePress는 VuePress의 후속 버전 입니다. 원래 VuePress는 Vue 2와 webpack을 기반으로 했습니다. Vue 3와 Vite를 기반으로 한 VitePress는 훨씬 더 나은 DX, 더 나은 프로덕션 성능, 더 다듬어진 기본 테마, 더 유연한 커스터마이징 API를 제공합니다.

VitePress와 VuePress의 API 차이는 주로 테마와 커스터마이징에 있습니다. 기본 테마를 사용하는 VuePress 1을 사용 중이라면 VitePress로의 마이그레이션은 비교적 간단할 것입니다.

VuePress 2도 Vue 3와 Vite를 지원하며 VuePress 1과의 호환성을 높이기 위해 많은 노력이 투자되었습니다. 그러나 두 SSG를 병렬로 유지하는 것은 지속 가능하지 않으므로 Vue 팀은 장기적인 관점에서 주요 권장 SSG인 VitePress에 집중하기로 결정했습니다.
