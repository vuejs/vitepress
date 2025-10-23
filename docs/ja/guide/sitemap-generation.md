# サイトマップ生成 {#sitemap-generation}

VitePress には、サイト用の `sitemap.xml` を生成する機能が標準で用意されています。有効化するには、`.vitepress/config.js` に次を追加します。

 ```ts
 export default {
   sitemap: {
     hostname: 'https://example.com'
   }
 }
 ```

`siteamp.xml` に `<lastmod>` タグを含めるには、[`lastUpdated`](../reference/default-theme-last-updated) オプションを有効にします。

## オプション {#options}

サイトマップ生成は [`sitemap`](https://www.npmjs.com/package/sitemap) モジュールで行われます。設定ファイルの `sitemap` に、このモジュールがサポートする任意のオプションを渡せます。指定した値はそのまま `SitemapStream` コンストラクタに渡されます。詳しくは [`sitemap` のドキュメント](https://www.npmjs.com/package/sitemap#options-you-can-pass) を参照してください。例：

 ```ts
 export default {
   sitemap: {
     hostname: 'https://example.com',
     lastmodDateOnly: false
   }
 }
 ```

設定で `base` を使っている場合は、`hostname` にもそれを付与してください：

 ```ts
 export default {
   base: '/my-site/',
   sitemap: {
     hostname: 'https://example.com/my-site/'
   }
 }
 ```

## `transformItems` フック {#transformitems-hook}

`siteamp.xml` に書き出す直前にサイトマップ項目を加工するには、`sitemap.transformItems` フックを使います。このフックはサイトマップ項目の配列を受け取り、配列を返す必要があります。例：

 ```ts
 export default {
   sitemap: {
     hostname: 'https://example.com',
     transformItems: (items) => {
       // 既存項目の追加・変更・フィルタリングが可能
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
