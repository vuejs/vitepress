# VitePress 0.x からの移行

VitePress 0.x をお使いの場合、新機能や強化に伴ういくつかの破壊的変更があります。ここでは最新の VitePress へアプリを移行する際の手順を説明します。

## アプリ設定

- 国際化機能（i18n）はまだ実装されていません。

## テーマ設定

- `sidebar` オプションの構造が変わりました。
  - `children` キーは `items` に名称変更されました。
  - ルート直下の項目に現在は `link` を含められません。将来的に再導入予定です。
- `repo`, `repoLabel`, `docsDir`, `docsBranch`, `editLinks`, `editLinkText` は、より柔軟な API に置き換えられて削除されました。
  - ナビゲーションにアイコン付きの GitHub リンクを追加するには、[ソーシャルリンク](../reference/default-theme-nav#navigation-links) を使用してください。
  - 「このページを編集」リンクを追加するには、[編集リンク](../reference/default-theme-edit-link) を使用してください。
- `lastUpdated` オプションは `config.lastUpdated` と `themeConfig.lastUpdatedText` に分割されました。
- `carbonAds.carbon` は `carbonAds.code` に変更されました。

## フロントマター設定

- `home: true` は `layout: home` に変更されました。あわせてホームページ関連の設定が拡張され、多くが変更されています。詳細は [ホームページのガイド](../reference/default-theme-home-page) を参照してください。
- `footer` オプションは [`themeConfig.footer`](../reference/default-theme-config#footer) に移動しました。
