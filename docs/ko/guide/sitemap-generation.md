# 사이트맵 생성 {#sitemap-generation}

VitePress는 사이트를 위한 `sitemap.xml` 파일 생성을 기본적으로 지원합니다. 이를 활성화하려면 다음을 `.vitepress/config.js`에 추가하세요:

```ts
export default {
  sitemap: {
    hostname: 'https://example.com'
  }
}
```

`<lastmod>` 태그를 `sitemap.xml`에 포함하려면 [`lastUpdated`](../reference/default-theme-last-updated) 옵션을 활성화할 수 있습니다.

## 옵션 {#options}

사이트맵 지원은 [`sitemap`](https://www.npmjs.com/package/sitemap) 모듈에 의해 제공됩니다. 설정 파일의 `sitemap` 옵션에 이 모듈이 지원하는 모든 옵션을 전달할 수 있습니다. 이 옵션들은 `SitemapStream` 생성자에 직접 전달됩니다. 자세한 내용은 [`sitemap` 문서](https://www.npmjs.com/package/sitemap#options-you-can-pass)를 참조하세요. 예제:

```ts
export default {
  sitemap: {
    hostname: 'https://example.com',
    lastmodDateOnly: false
  }
}
```

설정 파일에서 `base`를 사용하는 경우, `hostname` 옵션에 이를 추가해야 합니다:

```ts
export default {
  base: '/my-site/',
  sitemap: {
    hostname: 'https://example.com/my-site/'
  }
}
```

## `transformItems` Hook

`sitemap.transformItems` 훅을 사용하여 `sitemap.xml` 파일에 작성되기 전에 사이트맵 항목을 수정할 수 있습니다. 이 훅은 사이트맵 항목 배열을 인자로 받아 배열을 반환해야 합니다. 예제:

```ts
export default {
  sitemap: {
    hostname: 'https://example.com',
    transformItems: (items) => {
      // 새로운 항목 추가 또는 기존 항목 수정/필터링
      items.push({
        url: '/extra-page',
        changefreq: 'monthly',
        priority: 0.8
      })
      return items
    }
  }
}
```
