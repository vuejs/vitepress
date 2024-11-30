# MPA 모드 <Badge type="warning" text="실험적" /> {#mpa-mode}

MPA (다중 페이지 애플리케이션) 모드는 명령줄에서 `vitepress build --mpa`를 통해 활성화할 수 있으며, 구성 파일에서 `mpa: true` 옵션을 통해서도 활성화할 수 있습니다.

MPA 모드에서는 모든 페이지가 기본적으로 JavaScript 없이 렌더링됩니다. 그 결과, 프로덕션 사이트는 감사 도구로부터 초기 방문 성능 점수가 더 좋을 가능성이 있습니다.

그러나 SPA 탐색이 없기 때문에 페이지 간 링크는 전체 페이지를 새로 고침합니다. MPA 모드에서의 포스트-로드 탐색은 SPA 모드만큼 즉각적으로 느껴지지 않을 것입니다.

또한 기본적으로 JS가 없다는 것은 Vue를 순전히 서버 사이드 템플릿 언어로 사용하고 있다는 것을 의미합니다. 브라우저에서는 이벤트 핸들러가 첨부되지 않으므로 상호작용이 없습니다. 클라이언트 사이드 JavaScript를 로드하려면 특별한 `<script client>` 태그를 사용해야 합니다:

```html
<script client>
  document.querySelector('h1').addEventListener('click', () => {
    console.log('client side JavaScript!')
  })
</script>

# Hello
```

`<script client>`는 VitePress 전용 기능이며, Vue 기능이 아닙니다. 이 기능은 `.md` 파일과 `.vue` 파일에서 모두 작동하지만, MPA 모드에서만 사용됩니다. 모든 테마 컴포넌트의 클라이언트 스크립트는 함께 번들링되지만, 특정 페이지에 대한 클라이언트 스크립트는 개별적으로 처리됩니다.

`<script client>`는 **Vue 컴포넌트 코드로 평가되지 않음**을 유의하십시오. 이는 단순한 JavaScript 모듈로 처리됩니다. 이러한 이유로, 사이트가 최소한의 클라이언트 사이드 상호작용을 요구하는 경우에만 MPA 모드를 사용하는 것이 좋습니다.
