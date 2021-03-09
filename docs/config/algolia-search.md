# Theme Config: Algolia Search

The `themeConfig.algolia` option allows you to use [Algolia DocSearch](https://docsearch.algolia.com/). To enable it, you need to provide at least apiKey and indexName:

```js
module.exports = {
  themeConfig: {
    algolia: {
      apiKey: 'your_api_key',
      indexName: 'index_name'
    }
  }
}
```

For more options, check out [Algolia DocSearch's documentation](https://github.com/algolia/docsearch#docsearch-options).
