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
    <div class="container">
      <div v-for="member in members" :key="member.name" class="item">
        <VPTeamMembersItem :size="size" :member="member" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: grid;
  gap: 24px;
  margin: 0 auto;
  width: 100%;
  max-width: 1152px;
}

.VPTeamMembers.count-1 {
  display: flex;
  justify-content: center;
}

.VPTeamMembers.small.count-1 .container ,
.VPTeamMembers.small.count-2 .container,
.VPTeamMembers.small.count-3 .container,
.VPTeamMembers.medium.count-1 .container,
.VPTeamMembers.medium.count-2 .container {
  display: flex;
  justify-content: center;
  width: 100% !important;
  max-width: 100% !important;
}

.VPTeamMembers.small .container {
  grid-template-columns: repeat(auto-fit, minmax(224px, 1fr));
}

@media (max-width: 940px) {
  .VPTeamMembers.small.count-3 .container {
    flex-wrap: wrap;
    justify-content: start;
  }
}

@media (max-width: 640px) {
  .VPTeamMembers.small.count-2 .container {
    flex-wrap: wrap;
  }
}

.VPTeamMembers.small.count-1 .item,
.VPTeamMembers.small.count-2 .item,
.VPTeamMembers.small.count-3 .item {
  width: 276px;
}

@media (max-width: 940px) and (min-width: 640px) {
  .VPTeamMembers.small.count-2 .item,
  .VPTeamMembers.small.count-3 .item {
    width: calc(50% - 12px);
  }
}

@media (max-width: 640px) {
  .VPTeamMembers.small.count-1 .item,
  .VPTeamMembers.small.count-2 .item,
  .VPTeamMembers.small.count-3 .item {
    width: 100% !important;
  }
}

.VPTeamMembers.medium .container {
  grid-template-columns: repeat(auto-fit, minmax(256px, 1fr));
}

@media (min-width: 375px) {
  .VPTeamMembers.medium .container {
    grid-template-columns: repeat(auto-fit, minmax(288px, 1fr));
  }
}

@media (max-width: 888px) {
  .VPTeamMembers.medium.count-2 .container {
    flex-wrap: wrap;
  }
}

.VPTeamMembers.medium.count-1 .item,
.VPTeamMembers.medium.count-2 .item {
  width: 368px;
}

@media (max-width: 888px) {
  .VPTeamMembers.medium.count-1 .item,
  .VPTeamMembers.medium.count-2 .item {
    width: 100% !important;
  }
}
</style>
