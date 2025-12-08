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

If you would like to introduce your team, you can use Team components to construct the Team Page. There are two ways of using these components: to embed it in doc page, and to create a full Team page.

## Show team members in a page

You can use the `<VPTeamMembers>` component exposed from `vitepress/theme` to display a list of team members on any page.

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

<VPTeamMembers size="small" :members />
```

The above will display each team member in a card element, similar to this:

<VPTeamMembers size="small" :members />

You can also add more properties to each member, such as a description or a sponsor button. Learn more about this in [`<VPTeamMembers>`](#vpteammembers).

The `<VPTeamMembers>` component comes in 2 different sizes, `small` and `medium`. While it's ultimately up to personal preference, the `small` size usually fits better when used in doc pages.

Embedding team members in a doc page is good for a small size team where having a dedicated full team page might be too much, or introducing partial members as a reference to documentation context. If you have large number of members, or simply want more space to show team members, consider [creating a full Team page](#create-a-full-team-page).

## Create a full Team page

Instead of adding team members to doc page, you may also create a full Team page, similar to how you can create a custom [Home page](./default-theme-home-page).

To create a team page, first create a new Markdown file. In this file, set the layout option in frontmatter to `page`, and use `TeamPage` components to compose your page structure.

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
  <VPTeamMembers :members />
</VPTeamPage>
```

When creating a full team page, remember to wrap all components with the `<VPTeamPage>` component. This component will ensure all nested team related components get the proper layout structure and spacing.

The `<VPPageTitle>` component adds the page title section as an `<h1>` heading. Use the `#title` and `#lead` slots to provide information about your team.

`<VPMembers>` works the same as when used in a doc page; it will simply display a list of members in cards.

### Add sections to divide team members

You can add sections to the team page for separating team members into roles or categories. For example, you could have a Core Team Members section and a Community Partners section.

To do this, add the `<VPTeamPageSection>` component to the Markdown file we created previously.

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

The `<VPTeamPageSection>` component has the `#title` and `#lead` slots from the `VPTeamPageTitle` component, and also a `#members` slot for displaying team members.

Remember to put a `<VPTeamMembers>` component within the `#members` slot.

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
  // Size of each member. Defaults to `medium`.
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

  // Text for the sponsor link. Defaults to 'Sponsor'.
  actionText?: string
}
```

## `<VPTeamPage>`

The root component when creating a full team page. It only accepts a single slot. It will style all team related components passed in.

## `<VPTeamPageTitle>`

Adds a "title" section to the page. Best used at the very beginning under `<VPTeamPage>`. It accepts `#title` and `#lead` slots.

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

Creates a section within the team page. It accepts `#title`, `#lead`, and `#members` slots. You can add as many sections as you like inside `<VPTeamPage>`.

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
