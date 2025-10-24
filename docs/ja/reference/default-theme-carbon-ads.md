# Carbon 広告 {#carbon-ads}

VitePress は [Carbon Ads](https://www.carbonads.net/) をネイティブにサポートしています。設定で Carbon Ads の認証情報を定義すると、ページ上に広告が表示されます。

 ```js
 export default {
   themeConfig: {
     carbonAds: {
       code: 'your-carbon-code',
       placement: 'your-carbon-placement'
     }
   }
 }
 ```

これらの値は、次のように Carbon の CDN スクリプトを呼び出すために使用されます。

 ```js
 `//cdn.carbonads.com/carbon.js?serve=${code}&placement=${placement}`
 ```

Carbon Ads の設定について詳しくは、[Carbon Ads のウェブサイト](https://www.carbonads.net/)を参照してください。
