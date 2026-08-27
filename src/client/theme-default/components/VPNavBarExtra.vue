<script lang="ts" setup>
import { computed } from 'vue'

import { useData } from '../composables/data'
import { useLangs } from '../composables/langs'
import { useAppearanceSwitch } from '../composables/nav'
import { useNavOverflow } from '../composables/nav-overflow'
import VPFlyout from './VPFlyout.vue'
import VPMenuGroup from './VPMenuGroup.vue'
import VPMenuLink from './VPMenuLink.vue'
import VPNavAppearance from './VPNavAppearance.vue'
import VPNavTranslations from './VPNavTranslations.vue'
import VPSocialLinks from './VPSocialLinks.vue'

const { theme } = useData()
const { localeLinks, currentLang } = useLangs({
  linkToCorrespondingPage: true
})
const hasAppearanceSwitch = useAppearanceSwitch()

const overflow = useNavOverflow()

// nav items the priority+ engine pushed out of the bar (contiguous suffix)
const overflowItems = computed(() => {
  const count = overflow?.state.visibleItemCount ?? Infinity
  if (count === Infinity || !theme.value.nav) return []
  return theme.value.nav.slice(count)
})

const showTranslations = computed(
  () =>
    !!(localeLinks.value.length && currentLang.value.label) &&
    !(overflow?.state.translations ?? true)
)

const showAppearance = computed(
  () => hasAppearanceSwitch.value && !(overflow?.state.appearance ?? true)
)

const showSocialLinks = computed(
  () => !!theme.value.socialLinks && !(overflow?.state.socialLinks ?? true)
)

const hasContent = computed(
  () =>
    overflowItems.value.length > 0 ||
    showTranslations.value ||
    showAppearance.value ||
    showSocialLinks.value
)
</script>

<template>
  <VPFlyout
    v-if="hasContent"
    class="VPNavBarExtra"
    :label="theme.extraMenuLabel || 'More options'"
    :ref="(inst: any) => overflow?.setExtraEl(inst?.$el ?? null)"
  >
    <ul v-if="overflowItems.length" class="group overflow-items">
      <template v-for="item in overflowItems" :key="JSON.stringify(item)">
        <VPMenuLink v-if="'link' in item" :item />
        <!-- a menu panel is a vertical list context — components must
             render a flat list here, not a nested floating flyout -->
        <component
          v-else-if="'component' in item"
          :is="item.component"
          v-bind="item.props"
          menu
        />
        <VPMenuGroup v-else :text="item.text" :items="item.items" />
      </template>
    </ul>

    <VPNavTranslations v-if="showTranslations" menu />

    <div v-if="showAppearance" class="group">
      <VPNavAppearance row />
    </div>

    <div v-if="showSocialLinks" class="group">
      <div class="item social-links">
        <VPSocialLinks class="social-links-list" :links="theme.socialLinks!" />
      </div>
    </div>
  </VPFlyout>
</template>

<style scoped>
.VPNavBarExtra {
  display: none;
  margin-right: -0.75rem;
}

@media (min-width: 48rem) {
  .VPNavBarExtra {
    display: block;
  }
}

.item.social-links {
  display: flex;
  align-items: center;
  padding: 0 0.75rem;
}

.social-links-list {
  margin: -0.25rem -0.5rem;
}
</style>
