# 最終更新日時 {#last-updated}

ページ右下に、コンテンツの最終更新時刻を表示できます。有効化するには、設定に `lastUpdated` オプションを追加します。

::: info
VitePress は各ファイルの **直近の Git コミットのタイムスタンプ** を用いて「最終更新」を表示します。これを有効にするには、対象の Markdown ファイルが Git にコミットされている必要があります。

内部的には、各ファイルに対して `git log -1 --pretty="%ai"` を実行してタイムスタンプを取得します。すべてのページで同じ更新時刻が表示される場合、（CI 環境でよくある）**浅いクローン（shallow clone）** により Git の履歴が取得できていない可能性があります。

**GitHub Actions** での修正例は次のとおりです。

```yaml{4}
- name: Checkout
  uses: actions/checkout@v5
  with:
    fetch-depth: 0
```

他の CI/CD プラットフォームでも同様の設定が用意されています。

もしそのようなオプションが使えない場合は、`package.json` のビルドスクリプトで手動フェッチを前置してください。

```json
"docs:build": "git fetch --unshallow && vitepress build docs"
```
:::

## サイトレベルの設定 {#site-level-config}

```js
export default {
  lastUpdated: true
}
```

## フロントマターでの設定 {#frontmatter-config}

ページ単位で無効化するには、フロントマターで `lastUpdated` を指定します。

```yaml
---
lastUpdated: false
---
```

より詳しくは [デフォルトテーマ: 最終更新](./default-theme-config#lastupdated) を参照してください。テーマレベルで truthy な値を設定すると、サイトまたはページで明示的に無効化しない限り、この機能は有効になります。
