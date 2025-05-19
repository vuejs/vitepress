# 편집 링크 {#edit-link}

## 사이트 단계에서 설정하기 {#site-level-config}

편집 링크는 GitHub, GitLab과 같은 Git 관리 서비스에서 페이지를 편집할 수 있는 링크를 표시할 수 있게 해줍니다. 이를 활성화하려면 `themeConfig.editLink` 옵션을 구성에 추가하세요.

```js
export default {
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path'
    }
  }
}
```

`pattern` 옵션은 링크의 URL 구조를 정의하며, `:path`는 페이지 경로로 대체됩니다.

또한, [`PageData`](./runtime-api#usedata)를 인자로 받아 URL 문자열을 반환하는 순수 함수를 사용할 수도 있습니다.

```js
export default {
  themeConfig: {
    editLink: {
      pattern: ({ filePath }) => {
        if (filePath.startsWith('packages/')) {
          return `https://github.com/acme/monorepo/edit/main/${filePath}`
        } else {
          return `https://github.com/acme/monorepo/edit/main/docs/${filePath}`
        }
      }
    }
  }
}
```

이 함수는 브라우저에서 직렬화되어 실행되므로, 부작용을 가지지 않고 해당 스코프 외부의 어떤 것도 참조하지 않도록 해야 합니다.

기본적으로 이 설정은 문서 페이지 하단에 "Edit this page"이라는 텍스트 링크를 추가합니다. 이 텍스트는 `text` 옵션을 정의하여 커스터마이징 할 수 있습니다.

```js
export default {
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
      text: '이 페이지 편집 제안하기'
    }
  }
}
```

## 전문에서 설정하기 {#frontmatter-config}

페이지별로 이 기능을 비활성화하려면, 전문에서 `editLink` 옵션을 사용하세요:

```yaml
---
editLink: false
---
```
