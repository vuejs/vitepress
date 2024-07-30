---
outline: deep
---

# CMS에 연결하기 {#connecting-to-a-cms}

## 일반 워크플로우 {#general-workflow}

VitePress를 CMS에 연결하는 것은 주로 [동적 라우트](./routing#dynamic-routes)를 중심으로 진행될 것입니다. 진행하기 전에 이것이 어떻게 작동하는지 이해하는 것이 중요합니다.

각 CMS는 다르게 작동하기 때문에, 여기서는 특정 상황에 맞게 조정해야 할 일반적인 워크플로우만 제공할 수 있습니다.

1. CMS에서 인증이 필요한 경우, API 토큰을 저장할 `.env` 파일을 만들고 다음과 같이 로드하세요:

    ```js
    // posts/[id].paths.js
    import { loadEnv } from 'vitepress'

    const env = loadEnv('', process.cwd())
    ```

2. CMS에서 필요한 데이터를 가져와 적절한 경로 데이터로 포맷하세요:

    ```js
    export default {
      async paths() {
        // 필요시 각 CMS 클라이언트 라이브러리 사용
        const data = await (await fetch('https://my-cms-api', {
          headers: {
            // 필요한 경우 토큰
          }
        })).json()

        return data.map(entry => {
          return {
            params: { id: entry.id, /* 제목, 저자, 날짜 등 */ },
            content: entry.content
          }
        })
      }
    }
    ```

3. 페이지에서 콘텐츠를 렌더링하세요:

    ```md
    # {{ $params.title }}

    - {{ $params.author }}에 의해 {{ $params.date }}에

    <!-- @content -->
    ```

## 통합 가이드 {#integration-guides}

VitePress와 특정 CMS의 통합에 대한 가이드를 작성한 경우, 아래 "이 페이지 편집" 링크를 사용하여 여기에 제출하세요!
