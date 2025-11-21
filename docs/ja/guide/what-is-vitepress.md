# VitePress とは？ {#what-is-vitepress}

VitePress は、高速でコンテンツ中心の Web サイトを構築するための [静的サイトジェネレーター（SSG）](https://en.wikipedia.org/wiki/Static_site_generator) です。要するに、VitePress は [Markdown](https://en.wikipedia.org/wiki/Markdown) で書かれたソースコンテンツにテーマを適用し、どこにでも簡単にデプロイできる静的 HTML ページを生成します。

<div class="tip custom-block" style="padding-top: 8px">

まずは試してみたい？ [クイックスタート](./getting-started) へどうぞ。

</div>

## ユースケース {#use-cases}

- **ドキュメント**

  VitePress には技術ドキュメント向けに設計されたデフォルトテーマが同梱されています。今あなたが読んでいるこのページのほか、[Vite](https://vitejs.dev/)、[Rollup](https://rollupjs.org/)、[Pinia](https://pinia.vuejs.org/)、[VueUse](https://vueuse.org/)、[Vitest](https://vitest.dev/)、[D3](https://d3js.org/)、[UnoCSS](https://unocss.dev/)、[Iconify](https://iconify.design/) など、[まだまだたくさん](https://github.com/search?q=/%22vitepress%22:+/+path:/(?:package%7Cdeno)%5C.jsonc?$/+NOT+is:fork+NOT+is:archived&type=code)のドキュメントサイトで使われています。

  [公式の Vue.js ドキュメント](https://vuejs.org/) も VitePress をベースにしています（複数言語で共有されるカスタムテーマを使用）。

- **ブログ／ポートフォリオ／マーケティングサイト**

  VitePress は [フルカスタムテーマ](./custom-theme) をサポートし、標準的な Vite + Vue アプリ同様の開発体験を提供します。Vite 上に構築されているため、豊富なエコシステムから Vite プラグインを直接活用できます。さらに、[データの読み込み](./data-loading)（ローカル／リモート）や [ルートの動的生成](./routing#dynamic-routes) のための柔軟な API も提供します。ビルド時にデータが確定できる限り、ほとんど何でも構築できます。

  公式の [Vue.js ブログ](https://blog.vuejs.org/) は、ローカルコンテンツに基づいてインデックスページを生成するシンプルなブログです。

## 開発体験 {#developer-experience}

VitePress は、Markdown コンテンツを扱う際の優れた開発体験（DX）を目指しています。

- **[Vite 駆動](https://vitejs.dev/)**：即時サーバー起動、編集はページリロードなしで常に瞬時（<100ms）に反映。

- **[ビルトインの Markdown 拡張](./markdown)**：Frontmatter、表、シンタックスハイライト…必要なものはひと通り。特にコードブロック周りの機能が充実しており、高度な技術ドキュメントに最適です。

- **[Vue 拡張 Markdown](./using-vue)**：各 Markdown ページは Vue の [単一ファイルコンポーネント（SFC）](https://vuejs.org/guide/scaling-up/sfc.html) としても機能します。HTML と 100% 互換な Vue テンプレートを活かし、Vue のテンプレート機能やインポートしたコンポーネントで静的コンテンツにインタラクションを埋め込めます。

## パフォーマンス {#performance}

多くの従来型 SSG と異なり、VitePress で生成されたサイトは **初回訪問では静的 HTML** を返し、その後のサイト内ナビゲーションは [シングルページアプリケーション（SPA）](https://en.wikipedia.org/wiki/Single-page_application) として動作します。これはパフォーマンス面で最適なバランスだと考えています。

- **初期ロードが速い**

  どのページへの初回訪問でも、静的な事前レンダリング HTML が配信され、高速な読み込みと最適な SEO を実現します。続いて JavaScript バンドルが読み込まれ、ページが Vue の SPA に「ハイドレート」されます。SPA のハイドレーションは遅いという通説に反し、Vue 3 の素のパフォーマンスとコンパイラ最適化により非常に高速です。[PageSpeed Insights](https://pagespeed.web.dev/report?url=https%3A%2F%2Fvitepress.dev%2F) でも、VitePress サイトは低速回線のローエンド端末でもほぼ満点のスコアを達成できます。

- **読み込み後のナビゲーションが速い**

  さらに重要なのは、初回ロード**後**の体験が向上することです。サイト内の以降の移動ではフルリロードは発生せず、遷移先のコンテンツを取得して動的に更新します。VitePress はビューポート内のリンクに対してページチャンクを自動プリフェッチするため、ほとんどの場合で遷移は「即時」に感じられます。

- **インタラクションのペナルティなし**

  静的 Markdown に埋め込まれた動的な Vue 部分をハイドレートできるよう、各 Markdown ページは Vue コンポーネントとして処理され JavaScript にコンパイルされます。一見非効率に思えますが、Vue コンパイラは静的部分と動的部分を賢く分離し、ハイドレーションのコストとペイロードを最小化します。初回ロードでは静的部分は自動的に JS ペイロードから除外され、ハイドレーションでもスキップされます。

## VuePress はどうなるの？ {#what-about-vuepress}

VitePress は VuePress 1 の精神的後継です。元の VuePress 1 は Vue 2 と webpack をベースとしていました。VitePress は内部に Vue 3 と Vite を採用し、開発体験・本番性能・完成度の高いデフォルトテーマ・より柔軟なカスタマイズ API を提供します。

VitePress と VuePress 1 の API の違いは主にテーマやカスタマイズ周りにあります。VuePress 1 でデフォルトテーマを使っている場合は、比較的容易に移行できます。

2 つの SSG を並行して維持するのは現実的ではないため、Vue チームは長期的に VitePress を推奨 SSG とする方針に集中しています。現在、VuePress 1 は非推奨となり、VuePress 2 は今後の開発・保守を VuePress コミュニティチームに委ねています。
