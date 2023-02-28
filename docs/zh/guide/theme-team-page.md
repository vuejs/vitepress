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

# Team 页面 {#team-page}

如果你想介绍你的团队，你可以使用团队组件来构建团队页面。有两种使用这些组件的方法。一种是将其嵌入到文档页面中，另一种是创建一个完整的团队页面。

## 在页面中展示团队成员 {#show-team-members-in-a-page}

你可以使用从 `vitepress/theme` 提供的 `<VPTeamMembers>` 组件在任何页面上显示团队成员列表。

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

# Our Team

Say hello to our awesome team.

<VPTeamMembers size="small" :members="members" />
```

以上将在卡片外观元素中显示团队成员。它应该显示成下面的内容。

<VPTeamMembers size="small" :members="members" />

`<VPTeamMembers>` 组件有 2 种不同的大小，`small` 和 `medium`。虽然归结为你的偏好，但通常“小”尺寸在文档页面中使用时应该更适合。此外，你可以为每个成员添加更多属性，例如添加“描述”或“赞助商”按钮。在 [`<VPTeamMembers>`](#vpteammembers) 中了解更多信息。

在 doc 页面中的嵌入团队成员对小型团队非常有用，在这些团队中，拥有专用的完整团队页面可能太多，或者介绍部分成员作为文档上下文的参考也是有用的。

如果你有大量成员，或者只是想有更多空间来展示团队成员，可以考虑[创建一个完整的团队页面](#create-a-full-team-page)。

## 创建一个完整的团队页面 {#create-a-full-team-page}

除了将团队成员添加到文档页面之外，你还可以创建一个完整的团队页面，类似于创建自定义[主页](./theme-home-page)的方式。

要创建团队页面，首先，创建一个新的 md 文件。文件名不重要，不过这里我们命名为“team.md”。在这个文件中，设置 frontmatter 选项`layout: page`，然后你可以使用`TeamPage`组件来组成你的页面结构。

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
      Our Team
    </template>
    <template #lead>
      The development of VitePress is guided by an international
      team, some of whom have chosen to be featured below.
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers
    :members="members"
  />
</VPTeamPage>
```

创建完整的团队页面时，请记住使用 `<VPTeamPage>` 组件包装所有组件。该组件将确保所有嵌套的团队相关组件都获得正确的布局结构，例如间距等。

`<VPPageTitle>` 组件添加页面标题部分。标题是 `<h1>` 标题。 使用 `#title`和 `#lead` 插槽来记录你的团队。

`<VPMembers>` 的工作方式与在文档页面中使用时相同。 它将显示成员列表。

### 添加 “sections” 来区分不同的团队成员 {#add-sections-to-divide-team-members}

你可以将 “sections” 添加到团队页面。例如，你可能有不同类型的团队成员，例如核心团队成员和社区合作伙伴。你可以将这些成员划分为多个部分，以更好地解释每个组的角色。

为此，请将 `<VPTeamPageSection>` 组件添加到我们之前创建的 `team.md` 文件中。

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
    <template #title>Our Team</template>
    <template #lead>...</template>
  </VPTeamPageTitle>
  <VPTeamMembers size="medium" :members="coreMembers" />
  <VPTeamPageSection>
    <template #title>Partners</template>
    <template #lead>...</template>
    <template #members>
      <VPTeamMembers size="small" :members="partners" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>
```

`<VPTeamPageSection>` 组件可以具有类似于 `VPTeamPageTitle` 组件的 `#title` 和 `#lead` 插槽，以及用于显示团队成员的 `#members` 插槽。

请记住将 `<VPTeamMembers>` 组件放入 `#members` 插槽中。

## `<VPTeamMembers>`

`<VPTeamMembers>` 组件显示传入的成员列表。

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
  // Size of each members. Defaults to `medium`.
  size?: 'small' | 'medium'

  // List of members to display.
  members: TeamMember[]
}

interface TeamMember {
  // Avatar image for the member.
  avatar: string

  // Name of the member.
  name: string

  // Title to be shown below member's name.
  // e.g. Developer, Software Engineer, etc.
  title?: string

  // Organization that the member belongs.
  org?: string

  // URL for the organization.
  orgLink?: string

  // Description for the member.
  desc?: string

  // Social links. e.g. GitHub, Twitter, etc. You may pass in
  // the Social Links object here.
  // See: https://vitepress.vuejs.org/config/theme-config.html#sociallinks
  links?: SocialLink[]

  // URL for the sponsor page for the member.
  sponsor?: string
}
```

## `<VPTeamPage>`

创建完整团队页面时的根组件。 它只接受一个插槽。它将样式传入所有团队相关的组件。

## `<VPTeamPageTitle>`

添加页面的“标题”部分。 最好在 `<VPTeamPage>` 的开头使用。 它接受 `#title` 和 `#lead` 插槽。

```html
<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>
      Our Team
    </template>
    <template #lead>
      The development of VitePress is guided by an international
      team, some of whom have chosen to be featured below.
    </template>
  </VPTeamPageTitle>
</VPTeamPage>
```

## `<VPTeamPageSection>`

在团队页面中创建一个“部分”。它接受`#title`、`#lead` 和 `#members` 插槽。你可以在 `<VPTeamPage>` 中添加任意数量的“部分”。

```html
<VPTeamPage>
  ...
  <VPTeamPageSection>
    <template #title>Partners</template>
    <template #lead>Lorem ipsum...</template>
    <template #members>
      <VPTeamMembers :members="data" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>
```
