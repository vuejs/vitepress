# 마지막 업데이트 시간 {#last-updated}

마지막 내용의 업데이트 시간은 페이지의 오른쪽 하단에 표시됩니다. 활성화하려면 config에 `lastUpdated` 옵션을 추가하세요.

::: tip
업데이트 시간을 보려면 markdown 파일을 커밋해야 합니다.
:::

## 사이트 수준 설정 {#site-level-config}

```js
export default {
  lastUpdated: true
}
```

## 프런트매터 설정 {#frontmatter-config}

이 기능은 frontmatter의 `lastUpdated` 옵션을 사용하여 페이지별로 비활성화할 수 있습니다:

```yaml
---
lastUpdated: false
---
```

자세한 내용은 [기본 테마: 마지막 업데이트 시간](./default-theme-config#lastupdated)를 참조하세요. 테마 수준에서 참 값을 설정하면 사이트 또는 페이지 수준에서 명시적으로 비활성화하지 않는 한 기능이 활성화됩니다.
