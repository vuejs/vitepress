# Theme Config: Algolia Search

The `themeConfig.algolia` option allows you to use [Algolia DocSearch](https://docsearch.algolia.com). To enable it, you need to provide at least appId, apiKey and indexName:

```js
module.exports = {
  themeConfig: {
    algolia: {
      appId: 'your_app_id',
      apiKey: 'your_api_key',
      indexName: 'index_name'
    }
  }
}
```

For more options, check out [Algolia DocSearch's documentation](https://docsearch.algolia.com/docs/api/). You can pass any extra option alongside other options, e.g. passing `searchParameters`:

```js
module.exports = {
  themeConfig: {
    algolia: {
      appId: 'your_app_id',
      apiKey: 'your_api_key',
      indexName: 'index_name',
      searchParameters: {
        facetFilters: ['tags:guide,api']
      }
    }
  }
}
```

## Internationalization (i18n)

If you have multiple locales in your documentation and you have defined a `locales` object in your `themeConfig`:

```js
module.exports = {
  themeConfig: {
    locales: {
      // ...
    },
    algolia: {
      appId: 'your_app_id',
      apiKey: 'your_api_key',
      indexName: 'index_name'
    }
  }
}
```

VitePress will automatically add a `lang` _facetFilter_ to the `searchParameters.facetFilter` array with the correct language value. Algolia automatically adds the correct facet filter based on the `lang` attribute on the `<html>` tag. This will match search results with the currently viewed language of the page.
