---
outline: deep
---

# CMS에 연결하기 {#connecting-to-a-cms}

## 일반적인 워크플로우 {#general-workflow}

VitePress를 CMS에 연결하는 것은 주로 [동적 라우트](./routing#dynamic-routes)를 중심으로 이루어질 것입니다. 진행하기 전에 작동 방식을 이해해야 합니다.

각 CMS가 다르게 작동하므로, 여기서는 특정 상황에 맞게 조정해야 하는 일반적인 워크플로우만 제공할 수 있습니다.

1. CMS가 인증을 요구하는 경우, `.env` 파일을 생성하여 API 토큰을 저장하고 다음과 같이 로드하세요:

    ```js
    // posts/[id].paths.js
    import { loadEnv } from 'vitepress'

    const env = loadEnv('', process.cwd())
    ```

2. CMS에서 필요한 데이터를 가져와 적절한 경로 데이터로 형식을 지정하세요:

    ```js
    export default {
      async paths() {
        // 필요한 경우 해당 CMS 클라이언트 라이브러리 사용
        const data = await (await fetch('https://my-cms-api', {
          headers: {
            // 필요한 경우 토큰을 사용
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

3. 페이지의 컨텐츠를 렌더링하세요:

    ```md
    # {{ $params.title }}

    - 작성자: {{ $params.author }}, 작성일: {{ $params.date }}

    <!-- @content -->
    ```

## 통합 가이드 {#integration-guides}

VitePress를 특정 CMS와 통합하는 방법에 대한 가이드를 작성한 경우 아래의 "이 페이지 편집 제안하기" 링크를 클릭하여 여기에 제출하세요!
