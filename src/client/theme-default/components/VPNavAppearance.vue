<script lang="ts" setup>
import { computed, useId } from 'vue'

import { useData } from '../composables/data'
import { useAppearanceSwitch } from '../composables/nav'
import { useNavOverflow } from '../composables/nav-overflow'
import VPSwitchAppearance from './VPSwitchAppearance.vue'

const props = defineProps<{
  /** labeled row (nav screen and `⋯` menu) instead of the bare switch */
  row?: boolean
  /** styling context for the row variant */
  screen?: boolean
}>()

const { theme } = useData()
const show = useAppearanceSwitch()

// only the inline bar switch participates in the overflow engine
const overflow = props.row ? null : useNavOverflow()

const isCollapsed = computed(() => !!overflow && !overflow.state.appearance)

const labelId = useId()
</script>

<template>
  <div
    v-if="show"
    class="VPNavAppearance"
    :class="[
      row ? (screen ? 'VPNavScreenAppearance' : 'menu-appearance') : 'VPNavBarAppearance',
      { collapsed: isCollapsed }
    ]"
    :ref="(el) => overflow?.setClusterEl('appearance', el as HTMLElement | null)"
  >
    <p v-if="row" :id="labelId" class="text">
      {{ theme.darkModeSwitchLabel || 'Appearance' }}
    </p>
    <VPSwitchAppearance :aria-labelledby="row ? labelId : undefined" />
  </div>
</template>

<style scoped>
.VPNavBarAppearance {
  display: none;
}

@media (min-width: 48rem) {
  .VPNavBarAppearance {
    display: flex;
    align-items: center;
  }
}

.VPNavAppearance .text {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

/* labeled row inside the nav screen */
.VPNavScreenAppearance {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 0.5rem;
  padding: 0.75rem 0.875rem 0.75rem 1rem;
  background-color: var(--vp-c-bg-soft);
}

.VPNavScreenAppearance .text {
  line-height: 2;
}

/* labeled row inside the `⋯` menu */
.menu-appearance {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  min-width: 11rem;
  padding: 0 0.75rem;
}

.menu-appearance .text {
  line-height: 2.3333333;
}
</style>
