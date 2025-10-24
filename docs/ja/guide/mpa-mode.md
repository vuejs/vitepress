# MPA モード <Badge type="warning" text="experimental" /> {#mpa-mode}

MPA（Multi-Page Application）モードは、コマンドラインの `vitepress build --mpa`、または設定で `mpa: true` を指定することで有効化できます。

MPA モードでは、既定で **あらゆるページが JavaScript を含まずに** レンダリングされます。結果として、本番サイトは監査ツールにおける初回訪問のパフォーマンススコアが向上しやすくなります。

一方、SPA のナビゲーションがないため、ページ間リンクはフルリロードになります。読み込み後のページ遷移は、SPA モードのような即時性はありません。

また、「既定で JS なし」ということは、実質的に Vue をサーバーサイドのテンプレート言語としてのみ使うことを意味します。ブラウザ側ではイベントハンドラがアタッチされないため、インタラクティブ性はありません。クライアントサイドの JavaScript を読み込むには、特別な `<script client>` タグを使用します：

 ```html
 <script client>
 document.querySelector('h1').addEventListener('click', () => {
   console.log('client side JavaScript!')
 })
 </script>

 # Hello
 ```

`<script client>` は VitePress 固有の機能であり、Vue の機能ではありません。`.md` と `.vue` の両方で動作しますが、**MPA モード時のみ** 有効です。テーマコンポーネント内のクライアントスクリプトはひとつにバンドルされ、特定ページ専用のクライアントスクリプトはそのページごとに分割されます。

なお、`<script client>` は **Vue コンポーネントのコードとしては評価されません**。プレーンな JavaScript モジュールとして処理されます。このため、MPA モードはクライアント側のインタラクションを極力最小限に抑えたいサイトにのみ使用するのが適しています。
