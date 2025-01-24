# VitePress コントリビュート・ガイド

こんにちは！VitePressへのコントリビュートにご興味をお持ちいただき、誠にありがとうございます。コントリビュートの前に、以下のガイドラインを必ずお読みください:

- [行動規範](https://github.com/vuejs/vue/blob/dev/.github/CODE_OF_CONDUCT.md)
- [Pull Request ガイドライン](#pull-request-guidelines)

## Pull Request ガイドライン

- 関連するブランチ、例えば`main`からtopic branchをcheckoutし、そのbranchに対してmerge backします。

- 新しい機能を追加する場合:

  - この機能を追加する説得力のある理由を提示してください。理想的には、まず提案課題を開き、それを承認してもらってから取り組むべきです。

- Bugを修正する場合:

  - PRにbugの詳細な説明を記入してください。Live demoが望ましいです。

- PRの作業中に小さなコミットが複数あってもかまいません。GitHubはmergeする前にそれらを自動的につぶしてくれます。

- コミット・メッセージは[コミット・メッセージ規約](./commit-convention.md)に従わなければならないので、changelogが自動的に生成されます。

## 開発準備

[pnpm](https://pnpm.io)が必要です。

repoをcloneしたら、実行する:

```sh
# プロジェクトの依存関係をインストールする
$ pnpm install
# git hookの設定
$ pnpm simple-git-hooks
```

### VitePress開発環境のセットアップ

VitePressのテストを始める最も簡単な方法は、VitePressのドキュメントを調整することです。`pnpm run docs`を実行すると、VitePressのドキュメント・サイトがlocalで起動し、ソースコードがliveでreloadされます。

```sh
$ pnpm run docs
```

上記のコマンドを実行した後、http://localhost:5173をクリックし、ソースコードを変更してみてください。live updateが実行されます。

ドキュメント・サイトを立ち上げる必要がない場合は、`pnpm run dev`でVitePressのlocal開発環境を立ち上げることができます。

```sh
$ pnpm run dev
```
