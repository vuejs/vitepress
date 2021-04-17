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

For more options, check out [Algolia DocSearch's documentation](https://docsearch.algolia.com/docs/behavior). You can pass any extra option alongside other options, e.g. passing `searchParameters`:

```js
module.exports = {
  themeConfig: {
    algolia: {
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
      apiKey: 'your_api_key',
      indexName: 'index_name'
    }
  }
}
```

VitePress will automatically add a `language` _facetFilter_ to the `searchParams.facetFilter` array with the correct language value. **Make sure to properly configure your DocSearch config as well** by adding `language` as a _custom attribute for faceting_ and by setting it based on the `lang` attribute of the `<html>` element. Here is a short example of DocSearch config:

```json
{
  "index_name": "<the name of your library>",
  "start_urls": [
    {
      "url": "<your deployed url>"
    }
  ],
  "stop_urls": ["(?:(?<!\\.html)(?<!/))$"],
  "selectors": {
    "lvl0": {
      "selector": ".sidebar > .sidebar-links > .sidebar-link .sidebar-link-item.active",
      "global": true,
      "default_value": "Documentation"
    },
    "lvl1": ".content h1",
    "lvl2": ".content h2",
    "lvl3": ".content h3",
    "lvl4": ".content h4",
    "lvl5": ".content h5",
    "lvl6": ".content p, .content li",
    "text": ".content [class^=language-]",
    "language": {
      "selector": "/html/@lang",
      "type": "xpath",
      "global": true,
      "default_value": "en-US"
    }
  },
  "custom_settings": {
    "attributesForFaceting": ["language"]
  }
}
```

You can take a look at the [DocSearch config used by Vue Router](https://github.com/algolia/docsearch-configs/blob/master/configs/next_router_vuejs.json) for a complete example.
