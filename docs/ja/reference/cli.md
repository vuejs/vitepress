# コマンドラインインターフェイス {#command-line-interface}

## `vitepress dev`

指定したディレクトリをルートとして VitePress の開発サーバーを起動します。既定はカレントディレクトリです。カレントディレクトリで実行する場合、`dev` コマンドは省略できます。

### 使い方 {#usage}

 ```sh
 # カレントディレクトリで起動（`dev` を省略）
 vitepress

 # サブディレクトリで起動
 vitepress dev [root]
 ```

### オプション {#options}

| オプション         | 説明                                                                 |
| ------------------ | -------------------------------------------------------------------- |
| `--open [path]`    | 起動時にブラウザを開く（`boolean \| string`）                        |
| `--port <port>`    | ポート番号を指定（`number`）                                         |
| `--base <path>`    | 公開時のベースパス（既定: `/`）（`string`）                          |
| `--cors`           | CORS を有効化                                                         |
| `--strictPort`     | 指定ポートが使用中なら終了（`boolean`）                               |
| `--force`          | 最適化時にキャッシュを無視して再バンドル（`boolean`）                |

## `vitepress build`

本番用に VitePress サイトをビルドします。

### 使い方 {#usage-1}

 ```sh
 vitepress build [root]
 ```

### オプション {#options-1}

| オプション                      | 説明                                                                                               |
| ----------------------------- | -------------------------------------------------------------------------------------------------- |
| `--mpa`（実験的）              | クライアント側ハイドレーションなしの [MPA モード](../guide/mpa-mode) でビルド（`boolean`）           |
| `--base <path>`               | 公開時のベースパス（既定: `/`）（`string`）                                                          |
| `--target <target>`           | トランスパイルターゲット（既定: `"modules"`）（`string`）                                            |
| `--outDir <dir>`              | 出力先ディレクトリ（**cwd** からの相対）（既定: `<root>/.vitepress/dist`）（`string`）               |
| `--assetsInlineLimit <number>`| 静的アセットを base64 インライン化する閾値（バイト）（既定: `4096`）（`number`）                     |

## `vitepress preview`

本番ビルドをローカルでプレビューします。

### 使い方 {#usage-2}

 ```sh
 vitepress preview [root]
 ```

### オプション {#options-2}

| オプション         | 説明                                      |
| ------------------ | ----------------------------------------- |
| `--base <path>`    | 公開時のベースパス（既定: `/`）（`string`） |
| `--port <port>`    | ポート番号を指定（`number`）               |

## `vitepress init`

カレントディレクトリで [セットアップウィザード](../guide/getting-started#setup-wizard) を起動します。

### 使い方 {#usage-3}

 ```sh
 vitepress init
 ```
