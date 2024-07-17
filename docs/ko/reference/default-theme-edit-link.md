# 편집 링크 {#edit-link}

## 사이트 레벨 설정 {#site-level-config}

편집 링크를 사용하면 GitHub이나 GitLab과 같은 Git 관리 서비스에서 페이지를 편집하는 링크를 표시할 수 있습니다. 활성화하려면, `themeConfig.editLink` 옵션을 설정에 추가하세요.

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

또한 [`PageData`](./runtime-api#usedata)를 인수로 받아 URL 문자열을 반환하는 순수 함수를 넣을 수도 있습니다.

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

이 함수는 부작용이 없어야 하며, 범위 외의 것에 접근할 수 없으며, 브라우저에서 직렬화되어 실행됩니다.

기본적으로, 이 옵션은 문서 페이지 하단에 "Edit this page"라는 링크 텍스트를 추가합니다. `text` 옵션을 정의하여 이 텍스트를 사용자 정의할 수 있습니다.

```js
export default {
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
      text: 'GitHub에서 이 페이지를 편집하세요'
    }
  }
}
```

## 프론트매터 설정 {#frontmatter-config}

프론트매터의 `editLink` 옵션을 사용하여 페이지별로 이 기능을 비활성화할 수 있습니다:

```yaml
---
editLink: false
---
```
