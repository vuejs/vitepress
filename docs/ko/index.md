---
layout: home

title: VitePress
titleTemplate: Vite & Vue로 구동되는 정적 사이트 생성기

hero:
  name: VitePress
  text: Vite & Vue로 구동되는 정적 사이트 생성기
  tagline: 마크다운으로 멋진 문서를 몇 분 안에
  actions:
    - theme: brand
      text: VitePress란 무엇인가?
      link: /ko/guide/what-is-vitepress
    - theme: alt
      text: 빠른 시작
      link: /ko/guide/getting-started
    - theme: alt
      text: GitHub
      link: https://github.com/vuejs/vitepress
  image:
    src: /vitepress-logo-large.webp
    alt: VitePress

features:
  - icon: 📝
    title: 콘텐츠에 집중하세요
    details: 단지 마크다운으로 아름다운 문서 사이트를 쉽게 만들 수 있습니다.
  - icon: <svg xmlns="http://www.w3.org/2000/svg" width="30" viewBox="0 0 256 256.32"><defs><linearGradient id="a" x1="-.828%" x2="57.636%" y1="7.652%" y2="78.411%"><stop offset="0%" stop-color="#41D1FF"/><stop offset="100%" stop-color="#BD34FE"/></linearGradient><linearGradient id="b" x1="43.376%" x2="50.316%" y1="2.242%" y2="89.03%"><stop offset="0%" stop-color="#FFEA83"/><stop offset="8.333%" stop-color="#FFDD35"/><stop offset="100%" stop-color="#FFA800"/></linearGradient></defs><path fill="url(#a)" d="M255.153 37.938 134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"/><path fill="url(#b)" d="M185.432.063 96.44 17.501a3.268 3.268 0 0 0-2.634 3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361 36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732 3.542 3.979 5.473 5.943 2.437l1.313-2.028 72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505 4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113Z"/></svg>
    title: Vite DX를 즐기세요
    details: 즉각적인 서버 시작, 번개 같은 핫 업데이트, 및 Vite 생태계 플러그인을 활용하세요.
  - icon: <svg xmlns="http://www.w3.org/2000/svg" width="30" viewBox="0 0 256 220.8"><path fill="#41B883" d="M204.8 0H256L128 220.8 0 0h97.92L128 51.2 157.44 0h47.36Z"/><path fill="#41B883" d="m0 0 128 220.8L256 0h-51.2L128 132.48 50.56 0H0Z"/><path fill="#35495E" d="M50.56 0 128 133.12 204.8 0h-47.36L128 51.2 97.92 0H50.56Z"/></svg>
    title: Vue로 커스터마이징하세요
    details: 마크다운에서 직접 Vue 구문과 컴포넌트를 사용하거나 Vue로 커스텀 테마를 만들어보세요.
  - icon: 🚀
    title: 빠른 사이트 출시
    details: 정적 HTML로 빠른 초기 로드와 클라이언트 측 라우팅으로 빠른 포스트 로드 내비게이션을 제공합니다.
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe 30%, #41d1ff);

  --vp-home-hero-image-background-image: linear-gradient(-45deg, #bd34fe 50%, #47caff 50%);
  --vp-home-hero-image-filter: blur(44px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}
</style>
