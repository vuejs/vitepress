# 마지막 업데이트 날짜 {#last-updated}

마지막 업데이트 날짜는 페이지 오른쪽 하단에 표시됩니다. 이를 활성화하려면 구성 파일에 `lastUpdated` 옵션을 추가하세요.

::: tip
마크다운 파일을 커밋해야 업데이트된 시간을 확인할 수 있습니다.
:::

## 사이트 단계에서 설정하기 {#site-level-config}

```js
export default {
  lastUpdated: true
}
```

## 전문에서 설정하기 {#frontmatter-config}

페이지별로 이 기능을 비활성화하려면, 전문에서 `lastUpdated` 옵션을 사용하세요:

```yaml
---
lastUpdated: false
---
```

자세한 내용은 [기본 테마: lastUpdated](./default-theme-config#lastupdated)를 참고하세요. 테마 레벨에서 참(truthy) 값을 설정하면, 사이트나 페이지 레벨에서 명시적으로 비활성화하지 않는 한 이 기능이 활성화됩니다.
