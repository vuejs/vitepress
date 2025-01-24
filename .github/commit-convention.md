## Gitのコミット・メッセージに関する規約

> これは[Angularのコミット規約](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular)を参考にしたものです。

#### 要約:

メッセージは以下の正規表現でマッチさせる必要があります:

```js
/^(revert: )?(feat|fix|docs|dx|style|refactor|perf|test|workflow|build|ci|chore|types|wip)(\(.+\))?: .{1,50}/
```

#### 例

"Features"ヘッダーの`theme`サブヘッダーに表示されます：

```
feat(theme): add home page feature（訳: ホームページ機能の追加です）
```

"BugFixes"ヘッダーの`theme`サブヘッダーに、issue #28へのリンクとともに表示されます:

```
fix(テーマ): remove underline on sidebar hover style（訳: サイドバーのホバースタイルから下線を取り除きます）

close #28
```

"Performance Improvements"ヘッダーの下に表示され、"Breaking Changes"の下には変更点の説明とともに表示されます：

```
perf: improve store getters performance by removing 'foo' option（訳: 'foo'オプションを削除することで、ストアゲッターのパフォーマンスを改善します）

BREAKING CHANGE: The 'foo' option has been removed.（訳: 'foo'オプションは削除されました。）
```

以下のコミットとコミット`667ecc1`は同じリリースの場合、changelogに表示されません。そうでない場合、差し戻しコミットは"Reverts"ヘッダーの下に表示されます。

```
revert: feat(theme): add home page feature（訳: ホームページ機能の追加）

This reverts commit 667ecc1654a317a13331b17617d973392f415f02.
```

### 完全なメッセージ・フォーマット

コミット・メッセージは**header**、**body**、**footer**で構成されます。ヘッダーには **type**、**scope**、**subject** があります:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

**header**は必須であり、ヘッダーの**scope**はオプションです。

### Revert

前のコミットを取り消す場合は、`revert: `で始まり、その後に取り消すコミットのheaderを続けます。本文では、`This reverts commit <hash>.` (hashは差し戻されるコミットのSHA)と記述します。

### Type

prefixが`feat`、`fix`、`perf`の場合、変更履歴に表示されます。しかし、[BREAKING CHANGE](#footer)があれば、そのコミットは常に変更履歴に表示されます。

その他の接頭辞は自由です。推奨されるprefixは`docs`、`chore`、`style`、`refactor`および`test`です。

### Scope

scopeはコミットの変更箇所を指定するものであれば何でも構いません。例えば`theme`、`compiler`、`ssr`などです。

### Subject

subjectには、変更の簡潔な説明が含まれています:

- 現在形、もしくは命令形を使う: "changed"または"changes"ではなく、"change"
- 最初の文字を大文字にしない
- 最後にドット(.)がない

### Body

**subject**と同じように、現在形、もしくは命令形を使う。: "changed"または"changes"ではなく"change"
本文には、changeの説明を盛り込み、以前の挙動と対比させる。

### Footer

フッターには、**Breaking Changes** に関する情報を記述します。
また、このコミットが**Closes**するGithubのissueを参照する箇所でもあります。

**Breaking Changes**は`BREAKING CHANGE:`という単語とスペースまたは2つの改行で始まります。コミット・メッセージの残りはこのために使われます。
