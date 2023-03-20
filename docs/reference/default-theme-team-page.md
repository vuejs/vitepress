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

# Team Page

If you would like to introduce your team, you may use Team components to construct the Team Page. There are two ways of using these components. One is to embed it in doc page, and another is to create a full Team Page.

## Show team members in a page

You may use `<VPTeamMembers>` component exposed from `vitepress/theme` to display a list of team members on any page.

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

The above will display a team member in card looking element. It should display something similar to below.

<VPTeamMembers size="small" :members="members" />

`<VPTeamMembers>` component comes in 2 different sizes, `small` and `medium`. While it boils down to your preference, usually `small` size should fit better when used in doc page. Also, you may add more properties to each member such as adding "description" or "sponsor" button. Learn more about it in [`<VPTeamMembers>`](#vpteammembers).

Embedding team members in doc page is good for small size team where having dedicated full team page might be too much, or introducing partial members as a reference to documentation context.

If you have large number of members, or simply would like to have more space to show team members, consider [creating a full team page](#create-a-full-team-page).

## Create a full Team Page

Instead of adding team members to doc page, you may also create a full Team Page, similar to how you can create a custom [Home Page](./default-theme-home-page).

To create a team page, first, create a new md file. The file name doesn't matter, but here lets call it `team.md`. In this file, set frontmatter option `layout: page`, and then you may compose your page structure using `TeamPage` components.

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

When creating a full team page, remember to wrap all components with `<VPTeamPage>` component. This component will ensure all nested team related components get the proper layout structure like spacings.

`<VPPageTitle>` component adds the page title section. The title being `<h1>` heading. Use `#title` and `#lead` slot to document about your team.

`<VPMembers>` works as same as when used in a doc page. It will display list of members.

### Add sections to divide team members

You may add "sections" to the team page. For example, you may have different types of team members such as Core Team Members and Community Partners. You can divide these members into sections to better explain the roles of each group.

To do so, add `<VPTeamPageSection>` component to the `team.md` file we created previously.

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

The `<VPTeamPageSection>` component can have `#title` and `#lead` slot similar to `VPTeamPageTitle` component, and also `#members` slot for displaying team members.

Remember to put in `<VPTeamMembers>` component within `#members` slot.

## `<VPTeamMembers>`

The `<VPTeamMembers>` component displays a given list of members.

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
  // See: https://vitepress.dev/reference/default-theme-config.html#sociallinks
  links?: SocialLink[]

  // URL for the sponsor page for the member.
  sponsor?: string
}
```

## `<VPTeamPage>`

The root component when creating a full team page. It only accepts a single slot. It will style all passed in team related components.

## `<VPTeamPageTitle>`

Adds "title" section of the page. Best use at the very beginning under `<VPTeamPage>`. It accepts `#title` and `#lead` slot.

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

Creates a "section" with in team page. It accepts `#title`, `#lead`, and `#members` slot. You may add as many sections as you like inside `<VPTeamPage>`.

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
