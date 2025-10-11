# 編集リンク {#edit-link}

## サイトレベルの設定 {#site-level-config}

編集リンクは、GitHub や GitLab などの Git 管理サービスでそのページを編集できるリンクを表示します。有効化するには、設定に `themeConfig.editLink` オプションを追加します。

 ```js
 export default {
   themeConfig: {
     editLink: {
       pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path'
     }
   }
 }
 ```

`pattern` オプションはリンクの URL 構造を定義します。`:path` はページパスに置き換えられます。

また、引数に [`PageData`](./runtime-api#usedata) を受け取り、URL 文字列を返す純粋関数を指定することもできます。

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

この関数はブラウザでシリアライズされ実行されるため、副作用を持たず、スコープ外のものへアクセスしないでください。

既定では、ドキュメント下部に「Edit this page」というリンクテキストが表示されます。`text` オプションでこの文言をカスタマイズできます。

 ```js
 export default {
   themeConfig: {
     editLink: {
       pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
       text: 'GitHub でこのページを編集'
     }
   }
 }
 ```

## フロントマターでの設定 {#frontmatter-config}

ページごとに無効化するには、フロントマターで `editLink` オプションを使用します。

 ```yaml
 ---
 editLink: false
 ---
 ```
