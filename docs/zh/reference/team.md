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

const coreMembers = [
  {
    avatar: 'https://www.github.com/yyx990803.png',
    name: 'Evan You',
    title: 'Creator',
    links: [
      { icon: 'github', link: 'https://github.com/yyx990803' },
      { icon: 'twitter', link: 'https://twitter.com/youyuxi' }
    ]
  },
  {
    avatar: 'https://www.github.com/yyx990803.png',
    name: 'Evan You',
    title: 'Creator',
    links: [
      { icon: 'github', link: 'https://github.com/yyx990803' },
      { icon: 'twitter', link: 'https://twitter.com/youyuxi' }
    ]
  },
  {
    avatar: 'https://www.github.com/yyx990803.png',
    name: 'Evan You',
    title: 'Creator',
    links: [
      { icon: 'github', link: 'https://github.com/yyx990803' },
      { icon: 'twitter', link: 'https://twitter.com/youyuxi' }
    ]
  },
]
const partners = [
  {
    avatar: 'https://avatars.githubusercontent.com/u/50388827?v=4',
    name: 'VanchKong',
    title: 'Translator',
    links: [
      { icon: 'github', link: 'https://github.com/vanchKong' },
    ]
  },
]
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>Our Team</template>
    <!-- <template #lead>...</template> -->
  </VPTeamPageTitle>
  <VPTeamPageSection>
    <template #title>核心成员</template>
    <template #members>
      <VPTeamMembers size="medium" :members="coreMembers" />
    </template>
  </VPTeamPageSection>
  <VPTeamPageSection>
    <template #title>合作伙伴</template>
    <!-- <template #lead>...</template> -->
    <template #members>
      <VPTeamMembers size="small" :members="partners" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>

<!-- <p class="red">123</p>

<style>
  .red {
    color: red;
  }
</style> -->
