<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://github.com/yyx990803.png',
    name: 'Evan You',
    title: 'Creator',
    links: [
      { icon: 'github', link: 'https://github.com/yyx990803' },
      { icon: 'twitter', link: 'https://twitter.com/youyuxi' }
    ]
  },
  {
    avatar: 'https://github.com/kiaking.png',
    name: 'Kia King Ishii',
    title: 'Developer',
    links: [
      { icon: 'github', link: 'https://github.com/kiaking' },
      { icon: 'twitter', link: 'https://twitter.com/KiaKing85' }
    ]
  }
]
</script>

# チームページ {#team-page}

チームを紹介したい場合は、Team コンポーネント群を使ってチームページを構成できます。使い方は 2 通りあり、ドキュメントページに埋め込む方法と、専用のチームページを作成する方法があります。

## ページ内にメンバー一覧を表示する {#show-team-members-in-a-page}

任意のページでチームメンバーの一覧を表示するには、`vitepress/theme` からエクスポートされている `<VPTeamMembers>` コンポーネントを使用します。

```html
<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://www.github.com/yyx990803.png',
    name: 'Evan You',
    title: 'Creator',
    links: [
      { icon: 'github', link: 'https://github.com/yyx990803' },
      { icon: 'twitter', link: 'https://twitter.com/youyuxi' }
    ]
  },
  ...
]
</script>

# 私たちのチーム

私たちの素晴らしいチームを紹介します。

<VPTeamMembers size="small" :members />
```

上記のように、カード風の要素でメンバーが表示されます。下図のような見た目になります。

<VPTeamMembers size="small" :members />

`<VPTeamMembers>` コンポーネントには `small` と `medium` の 2 種類のサイズがあります。好みによりますが、ドキュメントページ内で使う場合は `small` が馴染みやすいことが多いでしょう。各メンバーに「説明文」や「スポンサー」ボタンなど、追加のプロパティを付けることもできます。詳細は [`<VPTeamMembers>`](#vpteammembers) を参照してください。

小規模なチームで専用ページまでは不要な場合や、文脈上の参考として一部のメンバーのみを紹介したい場合は、ドキュメントページへ埋め込む方法が適しています。

メンバーが多い場合や、より広いスペースで紹介したい場合は、[専用のチームページを作成する](#専用のチームページを作成する) ことを検討してください。

## 専用のチームページを作成する {#create-a-full-team-page}

ドキュメントページにメンバーを追加する代わりに、カスタムの [ホームページ](./default-theme-home-page) と同様、専用のチームページを作成することもできます。

まず新しい md ファイルを作成します。ファイル名は任意ですが、ここでは `team.md` とします。このファイルでフロントマターに `layout: page` を設定し、その後 `TeamPage` コンポーネント群を使ってページを構成します。

```html
---
layout: page
---
<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamMembers
} from 'vitepress/theme'

const members = [
  {
    avatar: 'https://www.github.com/yyx990803.png',
    name: 'Evan You',
    title: 'Creator',
    links: [
      { icon: 'github', link: 'https://github.com/yyx990803' },
      { icon: 'twitter', link: 'https://twitter.com/youyuxi' }
    ]
  },
  ...
]
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>
      私たちのチーム
    </template>
    <template #lead>
      VitePress の開発は国際的なチームによって主導されています。
      その一部を以下に紹介します。
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers :members />
</VPTeamPage>
```

専用のチームページを作る際は、必ずすべてのチーム関連コンポーネントを `<VPTeamPage>` でラップしてください。レイアウトや余白などが適切に適用されます。

`<VPPageTitle>` はページタイトルのセクションを追加します。タイトルは `<h1>` 見出しになります。`#title` と `#lead` スロットでチームについて説明を書きましょう。

`<VPMembers>` はドキュメントページで使う場合と同様に、メンバー一覧を表示します。

### セクションを追加してメンバーを分ける {#add-sections-to-divide-team-members}

チームページに「セクション」を追加できます。たとえば、コアメンバーとコミュニティパートナーなど、役割ごとにメンバーを分けて説明しやすくできます。

そのためには、先ほど作成した `team.md` に `<VPTeamPageSection>` コンポーネントを追加します。

```html
---
layout: page
---
<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamMembers,
  VPTeamPageSection
} from 'vitepress/theme'

const coreMembers = [...]
const partners = [...]
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>私たちのチーム</template>
    <template #lead>...</template>
  </VPTeamPageTitle>
  <VPTeamMembers size="medium" :members="coreMembers" />
  <VPTeamPageSection>
    <template #title>パートナー</template>
    <template #lead>...</template>
    <template #members>
      <VPTeamMembers size="small" :members="partners" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>
```

`<VPTeamPageSection>` は `VPTeamPageTitle` と同様に `#title` と `#lead` のスロットを持ち、さらにメンバー表示用の `#members` スロットを備えます。

`#members` スロット内に `<VPTeamMembers>` を配置するのを忘れないでください。

## `<VPTeamMembers>`

`<VPTeamMembers>` コンポーネントは、与えられたメンバー配列を表示します。

```html
<VPTeamMembers
  size="medium"
  :members="[
    { avatar: '...', name: '...' },
    { avatar: '...', name: '...' },
    ...
  ]"
/>
```

```ts
interface Props {
  // 各メンバーカードのサイズ。既定は `medium`。
  size?: 'small' | 'medium'

  // 表示するメンバー一覧。
  members: TeamMember[]
}

interface TeamMember {
  // メンバーのアバター画像
  avatar: string

  // メンバー名
  name: string

  // 名前の下に表示する肩書き（例: Developer, Software Engineer など）
  title?: string

  // 所属組織名
  org?: string

  // 所属組織への URL
  orgLink?: string

  // メンバーの説明
  desc?: string

  // ソーシャルリンク（例: GitHub, Twitter など）
  // Social Links オブジェクトを渡せます。
  // 参照: https://vitepress.dev/reference/default-theme-config.html#sociallinks
  links?: SocialLink[]

  // メンバーのスポンサー用 URL
  sponsor?: string

  // スポンサーボタンのテキスト。既定は 'Sponsor'
  actionText?: string
}
```

## `<VPTeamPage>`

専用のチームページを作成する際のルートコンポーネントです。単一のスロットのみを受け取り、渡されたチーム関連コンポーネント全体に適切なスタイルを適用します。

## `<VPTeamPageTitle>`

ページの「タイトル」セクションを追加します。`<VPTeamPage>` の直下に置くのが最適です。`#title` と `#lead` のスロットを受け取ります。

```html
<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>
      私たちのチーム
    </template>
    <template #lead>
      VitePress の開発は国際的なチームによって主導されています。
      その一部を以下に紹介します。
    </template>
  </VPTeamPageTitle>
</VPTeamPage>
```

## `<VPTeamPageSection>`

チームページ内に「セクション」を作成します。`#title`、`#lead`、`#members` の各スロットを受け取ります。`<VPTeamPage>` の中に必要な数だけ追加できます。

```html
<VPTeamPage>
  ...
  <VPTeamPageSection>
    <template #title>パートナー</template>
    <template #lead>Lorem ipsum...</template>
    <template #members>
      <VPTeamMembers :members="data" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>
```
