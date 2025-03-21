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

.item {
  width: 100%;
}

/**
 * Small size layout.
 * -------------------------------------------------------------------------- */

@media (min-width: 512px) {
  .VPTeamMembers.small .container {
    grid-template-columns: repeat(2, 1fr);
  }

  .VPTeamMembers.small.count-1 .container,
  .VPTeamMembers.small.count-2 .container {
    display: flex;
    justify-content: center;
  }

  .VPTeamMembers.small.count-1 .item,
  .VPTeamMembers.small.count-2 .item {
    max-width: 272px;
  }
}

@media (min-width: 768px) {
  .VPTeamMembers.small .container {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 960px) {
  .VPTeamMembers.small .container {
    grid-template-columns: repeat(4, 1fr);
  }

  .VPTeamMembers.small.count-3 .container {
    display: flex;
    justify-content: center;
  }

  .VPTeamMembers.small.count-3 .item {
    max-width: 272px;
  }
}

/**
 * Medium size layout.
 * -------------------------------------------------------------------------- */

@media (min-width: 512px) and (max-width: 639px) {
  .VPTeamMembers.medium .container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .VPTeamMembers.medium .item {
    max-width: 368px;
  }
}

@media (min-width: 640px) {
  .VPTeamMembers.medium .container {
    grid-template-columns: repeat(2, 1fr);
  }

  .VPTeamMembers.medium.count-1 .container,
  .VPTeamMembers.medium.count-2 .container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .VPTeamMembers.medium.count-1 .item,
  .VPTeamMembers.medium.count-2 .item {
    max-width: 368px;
  }
}

@media (min-width: 960px) {
  .VPTeamMembers.medium .container {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
