<script setup lang="ts">
import type { DefaultTheme } from 'vitepress/theme'
import { computed } from 'vue'
import VPTeamMembersItem from './VPTeamMembersItem.vue'

interface Props {
  size?: 'small' | 'medium'
  members: DefaultTheme.TeamMember[]
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium'
})

const classes = computed(() => [props.size, `count-${props.members.length}`])
</script>

<template>
  <div class="VPTeamMembers" :class="classes">
    <ul class="container">
      <li v-for="member in members" :key="member.name" class="item">
        <VPTeamMembersItem :size :member />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.VPTeamMembers.small .container {
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
}

.VPTeamMembers.small.count-1 .container {
  max-width: 17.25rem;
}
.VPTeamMembers.small.count-2 .container {
  max-width: calc(17.25rem * 2 + 1.5rem);
}
.VPTeamMembers.small.count-3 .container {
  max-width: calc(17.25rem * 3 + 1.5rem * 2);
}

.VPTeamMembers.medium .container {
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
}

@media (min-width: 23.4375rem) {
  .VPTeamMembers.medium .container {
    grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  }
}

.VPTeamMembers.medium.count-1 .container {
  max-width: 23rem;
}
.VPTeamMembers.medium.count-2 .container {
  max-width: calc(23rem * 2 + 1.5rem);
}

.container {
  display: grid;
  gap: 1.5rem;
  margin: 0 auto;
  max-width: 72rem;
}

/* Reset styles from vp-doc if used in markdown */
.vp-doc .VPTeamMembers .container {
  list-style: none;
  margin: 0 auto;
  padding: 0;
}
.vp-doc .VPTeamMembers .item {
  margin: 0;
  padding: 0;
}
</style>
