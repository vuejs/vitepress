---
layout: page
title: Meet the Team
description: The development of Vite is guided by an international team.
---

<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamPageSection,
  VPTeamMembers
} from 'vitepress/theme'

const members1 = [
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
  },
  // {
  //   avatar: 'https://github.com/kiaking.png',
  //   name: 'Kia King Ishii',
  //   title: 'Developer',
  //   links: [
  //     { icon: 'github', link: 'https://github.com/kiaking' },
  //     { icon: 'twitter', link: 'https://twitter.com/KiaKing85' }
  //   ]
  // },
  // {
  //   avatar: 'https://github.com/kiaking.png',
  //   name: 'Kia King Ishii',
  //   title: 'Developer',
  //   links: [
  //     { icon: 'github', link: 'https://github.com/kiaking' },
  //     { icon: 'twitter', link: 'https://twitter.com/KiaKing85' }
  //   ]
  // },
  // {
  //   avatar: 'https://github.com/kiaking.png',
  //   name: 'Kia King Ishii',
  //   title: 'Developer',
  //   links: [
  //     { icon: 'github', link: 'https://github.com/kiaking' },
  //     { icon: 'twitter', link: 'https://twitter.com/KiaKing85' }
  //   ]
  // }
]

const members2 = [
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
  },
  {
    avatar: 'https://github.com/kiaking.png',
    name: 'Kia King Ishii',
    title: 'Developer',
    links: [
      { icon: 'github', link: 'https://github.com/kiaking' },
      { icon: 'twitter', link: 'https://twitter.com/KiaKing85' }
    ]
  },
  // {
  //   avatar: 'https://github.com/kiaking.png',
  //   name: 'Kia King Ishii',
  //   title: 'Developer',
  //   links: [
  //     { icon: 'github', link: 'https://github.com/kiaking' },
  //     { icon: 'twitter', link: 'https://twitter.com/KiaKing85' }
  //   ]
  // },
  // {
  //   avatar: 'https://github.com/kiaking.png',
  //   name: 'Kia King Ishii',
  //   title: 'Developer',
  //   links: [
  //     { icon: 'github', link: 'https://github.com/kiaking' },
  //     { icon: 'twitter', link: 'https://twitter.com/KiaKing85' }
  //   ]
  // }
]
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>Meet the Team</template>
    <template #lead>
      The development of Vite is guided by an international team, some of whom
      have chosen to be featured below.
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers :members="members1" />
  <VPTeamPageSection>
    <template #title>Team Emeriti</template>
    <template #lead>
      Here we honor some no-longer-active team members who have made valuable
      contributions in the past.
    </template>
    <template #members>
      <VPTeamMembers size="small" :members="members2" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>