<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamPageSection,
  VPTeamMembers,
  VPHomeSponsors
} from 'vitepress/theme'
import { members, partners, sponsors } from './data'
</script>

## Markdown Section

Some paragraph text with a [link](https://example.com) and `inline code` to
verify how markdown content is styled in this variant.

- List item one
- List item two

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>Our Team</template>
    <template #lead>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt.
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers :members="members.slice(0, 2)" />
  <VPTeamPageSection>
    <template #title>Partners</template>
    <template #lead>Lorem ipsum dolor sit amet.</template>
    <template #members>
      <VPTeamMembers size="small" :members="partners" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>

<VPHomeSponsors
  message="Made possible by our generous sponsors"
  :data="sponsors"
  action-text="Become a sponsor"
  action-link="https://example.com"
/>

## After Components

Trailing markdown content after the components.
