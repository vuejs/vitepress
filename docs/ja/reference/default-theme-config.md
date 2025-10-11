# デフォルトテーマの設定 {#default-theme-config}

テーマ設定では、テーマのカスタマイズができます。設定ファイルの `themeConfig` オプションで定義します。

 ```ts
 export default {
   lang: 'en-US',
   title: 'VitePress',
   description: 'Vite & Vue powered static site generator.',

   // テーマ関連の設定
   themeConfig: {
     logo: '/logo.svg',
     nav: [...],
     sidebar: { ... }
   }
 }
 ```

**このページで説明するオプションは、デフォルトテーマにのみ適用されます。** テーマによって期待する設定は異なります。カスタムテーマを使用する場合、ここで定義したテーマ設定オブジェクトはテーマへ渡され、テーマ側がそれに基づいて条件付きの挙動を定義できます。

## i18nRouting

- 型: `boolean`

ロケールを `zh` のように切り替えると、URL は `/foo`（または `/en/foo/`）から `/zh/foo` に変わります。`themeConfig.i18nRouting` を `false` に設定すると、この挙動を無効化できます。

## logo

- 型: `ThemeableImage`

サイトタイトルの直前に、ナビゲーションバーに表示されるロゴ。パス文字列、またはライト／ダークモードで異なるロゴを設定するオブジェクトを受け取ります。

 ```ts
 export default {
   themeConfig: {
     logo: '/logo.svg'
   }
 }
 ```

 ```ts
 type ThemeableImage =
   | string
   | { src: string; alt?: string }
   | { light: string; dark: string; alt?: string }
 ```

## siteTitle

- 型: `string | false`

ナビゲーション内の既定サイトタイトル（アプリ設定の `title`）を置き換えます。`false` の場合、ナビのタイトルを非表示にします。ロゴ自体にサイト名が含まれている場合に便利です。

 ```ts
 export default {
   themeConfig: {
     siteTitle: 'Hello World'
   }
 }
 ```

## nav

- 型: `NavItem`

ナビゲーションメニューの設定。[デフォルトテーマ: ナビ](./default-theme-nav#navigation-links) を参照してください。

 ```ts
 export default {
   themeConfig: {
     nav: [
       { text: 'Guide', link: '/guide' },
       {
         text: 'Dropdown Menu',
         items: [
           { text: 'Item A', link: '/item-1' },
           { text: 'Item B', link: '/item-2' },
           { text: 'Item C', link: '/item-3' }
         ]
       }
     ]
   }
 }
 ```

 ```ts
 type NavItem = NavItemWithLink | NavItemWithChildren

 interface NavItemWithLink {
   text: string
   link: string | ((payload: PageData) => string)
   activeMatch?: string
   target?: string
   rel?: string
   noIcon?: boolean
 }

 interface NavItemChildren {
   text?: string
   items: NavItemWithLink[]
 }

 interface NavItemWithChildren {
   text?: string
   items: (NavItemChildren | NavItemWithLink)[]
   activeMatch?: string
 }
 ```

## sidebar

- 型: `Sidebar`

サイドバーメニューの設定。[デフォルトテーマ: サイドバー](./default-theme-sidebar) を参照してください。

 ```ts
 export default {
   themeConfig: {
     sidebar: [
       {
         text: 'Guide',
         items: [
           { text: 'Introduction', link: '/introduction' },
           { text: 'Getting Started', link: '/getting-started' },
           ...
         ]
       }
     ]
   }
 }
 ```

 ```ts
 export type Sidebar = SidebarItem[] | SidebarMulti

 export interface SidebarMulti {
   [path: string]: SidebarItem[] | { items: SidebarItem[]; base: string }
 }

 export type SidebarItem = {
   /**
    * 項目のテキストラベル
    */
   text?: string

   /**
    * 項目のリンク
    */
   link?: string

   /**
    * 子項目
    */
   items?: SidebarItem[]

   /**
    * 指定しない場合、グループは折りたたみ不可。
    *
    * `true` なら折りたたみ可能でデフォルト折りたたみ
    *
    * `false` なら折りたたみ可能だがデフォルト展開
    */
   collapsed?: boolean

   /**
    * 子項目のベースパス
    */
   base?: string

   /**
    * 前／次リンクのフッターに表示するテキストをカスタマイズ
    */
   docFooterText?: string

   rel?: string
   target?: string
 }
 ```

## aside

- 型: `boolean | 'left'`
- 既定値: `true`
- ページごとに [frontmatter](./frontmatter-config#aside) で上書き可能

`false` でサイドコンテナの描画を無効化。\
`true` で右側に表示。\
`left` で左側に表示。

すべてのビューポートで無効にしたい場合は、代わりに `outline: false` を使用してください。

## outline

- 型: `Outline | Outline['level'] | false`
- レベルはページごとに [frontmatter](./frontmatter-config#outline) で上書き可能

`false` でアウトラインコンテナの描画を無効化。詳細は以下を参照：

 ```ts
 interface Outline {
   /**
    * アウトラインに表示する見出しレベル
    * 単一の数値なら、そのレベルのみ表示
    * タプルなら最小レベルと最大レベル
    * `'deep'` は `[2, 6]` と同じ（`<h2>` 〜 `<h6>` を表示）
    *
    * @default 2
    */
   level?: number | [number, number] | 'deep'

   /**
    * アウトラインに表示するタイトル
    *
    * @default 'On this page'
    */
   label?: string
 }
 ```

## socialLinks

- 型: `SocialLink[]`

ナビゲーションにアイコン付きのソーシャルリンクを表示します。

 ```ts
 export default {
   themeConfig: {
     socialLinks: [
       // simple-icons (https://simpleicons.org/) の任意のアイコンを指定可能
       { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
       { icon: 'twitter', link: '...' },
       // SVG 文字列を渡してカスタムアイコンも可
       {
         icon: {
           svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Dribbble</title><path d="M12...6.38z"/></svg>'
         },
         link: '...',
         // アクセシビリティ向けにカスタムラベルも指定可（推奨）
         ariaLabel: 'cool link'
       }
     ]
   }
 }
 ```

 ```ts
 interface SocialLink {
   icon: string | { svg: string }
   link: string
   ariaLabel?: string
 }
 ```

## footer

- 型: `Footer`
- ページごとに [frontmatter](./frontmatter-config#footer) で上書き可能

フッター設定。メッセージや著作権表示を追加できますが、ページにサイドバーがある場合はデザイン上表示されません。

 ```ts
 export default {
   themeConfig: {
     footer: {
       message: 'Released under the MIT License.',
       copyright: 'Copyright © 2019-present Evan You'
     }
   }
 }
 ```

 ```ts
 export interface Footer {
   message?: string
   copyright?: string
 }
 ```

## editLink

- 型: `EditLink`
- ページごとに [frontmatter](./frontmatter-config#editlink) で上書き可能

「このページを編集」リンクを表示します（GitHub/GitLab など）。詳細は [デフォルトテーマ: 編集リンク](./default-theme-edit-link) を参照。

 ```ts
 export default {
   themeConfig: {
     editLink: {
       pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
       text: 'Edit this page on GitHub'
     }
   }
 }
 ```

 ```ts
 export interface EditLink {
   pattern: string
   text?: string
 }
 ```

## lastUpdated

- 型: `LastUpdatedOptions`

最終更新の文言と日付フォーマットをカスタマイズします。

 ```ts
 export default {
   themeConfig: {
     lastUpdated: {
       text: 'Updated at',
       formatOptions: {
         dateStyle: 'full',
         timeStyle: 'medium'
       }
     }
   }
 }
 ```

 ```ts
 export interface LastUpdatedOptions {
   /**
    * @default 'Last updated'
    */
   text?: string

   /**
    * @default
    * { dateStyle: 'short',  timeStyle: 'short' }
    */
   formatOptions?: Intl.DateTimeFormatOptions & { forceLocale?: boolean }
 }
 ```

## algolia

- 型: `AlgoliaSearch`

[Algolia DocSearch](https://docsearch.algolia.com/docs/what-is-docsearch) によるサイト内検索の設定。[デフォルトテーマ: 検索](./default-theme-search) を参照。

 ```ts
 export interface AlgoliaSearchOptions extends DocSearchProps {
   locales?: Record<string, Partial<DocSearchProps>>
 }
 ```

完全なオプションは[こちら](https://github.com/vuejs/vitepress/blob/main/types/docsearch.d.ts)。

## carbonAds {#carbon-ads}

- 型: `CarbonAdsOptions`

[Carbon Ads](https://www.carbonads.net/) を表示します。

 ```ts
 export default {
   themeConfig: {
     carbonAds: {
       code: 'your-carbon-code',
       placement: 'your-carbon-placement'
     }
   }
 }
 ```

 ```ts
 export interface CarbonAdsOptions {
   code: string
   placement: string
 }
 ```

詳細は [デフォルトテーマ: Carbon Ads](./default-theme-carbon-ads) を参照。

## docFooter

- 型: `DocFooter`

前／次リンクの上に表示される文言をカスタマイズします。英語以外のドキュメントで便利。前／次リンク自体をグローバルに無効化することも可能。ページごとに切り替えたい場合は [frontmatter](./default-theme-prev-next-links) を使用します。

 ```ts
 export default {
   themeConfig: {
     docFooter: {
       prev: 'Pagina prior',
       next: 'Proxima pagina'
     }
   }
 }
 ```

 ```ts
 export interface DocFooter {
   prev?: string | false
   next?: string | false
 }
 ```

## darkModeSwitchLabel

- 型: `string`
- 既定値: `Appearance`

ダークモード切替スイッチのラベル（モバイル表示のみ）をカスタマイズします。

## lightModeSwitchTitle

- 型: `string`
- 既定値: `Switch to light theme`

ホバー時に表示されるライトモード切替のタイトルをカスタマイズします。

## darkModeSwitchTitle

- 型: `string`
- 既定値: `Switch to dark theme`

ホバー時に表示されるダークモード切替のタイトルをカスタマイズします。

## sidebarMenuLabel

- 型: `string`
- 既定値: `Menu`

サイドバーメニューのラベル（モバイル表示のみ）をカスタマイズします。

## returnToTopLabel

- 型: `string`
- 既定値: `Return to top`

トップに戻るボタンのラベル（モバイル表示のみ）をカスタマイズします。

## langMenuLabel

- 型: `string`
- 既定値: `Change language`

ナビバーの言語切替ボタンの aria-label をカスタマイズします。[i18n](../guide/i18n) を使う場合に有効です。

## skipToContentLabel

- 型: `string`
- 既定値: `Skip to content`

コンテンツへスキップリンクのラベルをカスタマイズします。キーボード操作時に表示されます。

## externalLinkIcon

- 型: `boolean`
- 既定値: `false`

Markdown 内の外部リンクの横に外部リンクアイコンを表示するかどうか。

## `useLayout` <Badge type="info" text="composable" />

レイアウト関連のデータを返します。返り値の型は次のとおりです。

 ```ts
 interface {
   isHome: ComputedRef<boolean>

   sidebar: Readonly<ShallowRef<DefaultTheme.SidebarItem[]>>
   sidebarGroups: ComputedRef<DefaultTheme.SidebarItem[]>
   hasSidebar: ComputedRef<boolean>
   isSidebarEnabled: ComputedRef<boolean>

   hasAside: ComputedRef<boolean>
   leftAside: ComputedRef<boolean>

   headers: Readonly<ShallowRef<DefaultTheme.OutlineItem[]>>
   hasLocalNav: ComputedRef<boolean>
 }
 ```

**例:**

 ```vue
 <script setup>
 import { useLayout } from 'vitepress/theme'

 const { hasSidebar } = useLayout()
 </script>

 <template>
   <div v-if="hasSidebar">サイドバーがあるときだけ表示</div>
 </template>
 ```
