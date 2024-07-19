# MPA 모드 <Badge type="warning" text="실험적" /> {#mpa-mode}

MPA(멀티 페이지 애플리케이션) 모드는 `vitepress build --mpa` 명령어를 통해 또는 `mpa: true` 옵션을 통해 설정 파일에서 활성화할 수 있습니다.

MPA 모드에서는 모든 페이지가 기본적으로 JavaScript 없이 렌더링됩니다. 결과적으로, 생산 사이트는 감사 도구로부터 초기 방문 성능 점수를 더 좋게 받을 가능성이 높습니다.

그러나, SPA 네비게이션이 없기 때문에, 페이지 간 링크는 전체 페이지를 다시 로드하게 합니다. MPA 모드에서의 포스트-로드 탐색은 SPA 모드처럼 즉각적으로 느껴지지 않을 것입니다.

또한, 기본적으로 JS 없음을 의미하는 것은 여러분이 본질적으로 Vue를 서버 측 템플리팅 언어로만 사용하고 있다는 것을 의미합니다. 브라우저에서는 이벤트 핸들러가 연결되지 않으므로, 상호 작용성이 없을 것입니다. 클라이언트 측 JavaScript를 로드하려면 특별한 `<script client>` 태그를 사용해야 합니다:

```html
<script client>
document.querySelector('h1').addEventListener('click', () => {
  console.log('클라이언트 측 JavaScript!')
})
</script>

# 안녕하세요
```

`<script client>`는 VitePress 전용 기능으로, Vue 기능이 아닙니다. `.md` 및 `.vue` 파일 모두에서 작동하지만 MPA 모드에서만 작동합니다. 모든 테마 컴포넌트의 클라이언트 스크립트는 함께 번들링되며, 특정 페이지의 클라이언트 스크립트는 해당 페이지만을 위해 분할됩니다.

`<script client>`는 **Vue 컴포넌트 코드로 평가되지 않는다**는 점을 주의하세요: 이것은 일반 JavaScript 모듈로 처리됩니다. 이러한 이유로, MPA 모드는 여러분의 사이트가 절대적으로 최소한의 클라이언트 측 상호작용만을 필요로 할 때만 사용되어야 합니다.
