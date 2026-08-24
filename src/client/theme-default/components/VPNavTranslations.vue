<script lang="ts" setup>
import { computed, ref, useId } from 'vue'

import { useData } from '../composables/data'
import { useLangs } from '../composables/langs'
import { useNavOverflow } from '../composables/nav-overflow'
import VPFlyout from './VPFlyout.vue'
import VPLink from './VPLink.vue'
import VPMenuLink from './VPMenuLink.vue'

const props = defineProps<{
  /** accordion inside the nav screen */
  screen?: boolean
  /** titled group inside the `⋯` menu */
  menu?: boolean
}>()

const { theme } = useData()
const { localeLinks, currentLang } = useLangs({
  linkToCorrespondingPage: true
})

const show = computed(
  () => !!(localeLinks.value.length && currentLang.value.label)
)

// only the inline bar flyout participates in the overflow engine
const overflow = props.screen || props.menu ? null : useNavOverflow()

const isCollapsed = computed(
  () => !!overflow && !overflow.state.translations
)

const isOpen = ref(false)
const listId = useId()

function toggle() {
  isOpen.value = !isOpen.value
}

const localeProps = (locale: (typeof localeLinks.value)[number]) => ({
  lang: locale.lang,
  hreflang: locale.lang,
  rel: 'alternate',
  dir: locale.dir,
  'data-allow-mismatch': 'attribute' as const
})
</script>

<template>
  <!-- accordion inside the nav screen -->
  <div
    v-if="screen && show"
    class="VPNavTranslations VPNavScreenTranslations"
    :class="{ open: isOpen }"
  >
    <button
      type="button"
      class="title"
      :aria-expanded="isOpen"
      :aria-controls="listId"
      @click="toggle"
    >
      <span class="vpi-languages icon lang" aria-hidden="true" />
      {{ currentLang.label }}
      <span class="vpi-chevron-down icon chevron" aria-hidden="true" />
    </button>

    <ul v-show="isOpen" :id="listId" class="list">
      <li v-for="locale in localeLinks" :key="locale.link" class="item">
        <VPLink
          class="link"
          :href="locale.link"
          :external="false"
          v-bind="localeProps(locale)"
        >
          {{ locale.text }}
        </VPLink>
      </li>
    </ul>
  </div>

  <!-- titled group inside the `⋯` menu -->
  <div v-else-if="menu && show" class="VPNavTranslations group translations">
    <p class="title">{{ currentLang.label }}</p>

    <ul>
      <template v-for="locale in localeLinks" :key="locale.link">
        <VPMenuLink :item="locale" :external="false" v-bind="localeProps(locale)" />
      </template>
    </ul>
  </div>

  <!-- inline flyout in the navbar -->
  <VPFlyout
    v-else-if="!menu && show"
    class="VPNavTranslations VPNavBarTranslations"
    :class="{ collapsed: isCollapsed }"
    icon="vpi-languages"
    :label="theme.langMenuLabel || 'Change language'"
    :ref="(inst: any) => overflow?.setClusterEl('translations', inst?.$el ?? null)"
  >
    <p class="title">{{ currentLang.label }}</p>

    <ul class="items">
      <template v-for="locale in localeLinks" :key="locale.link">
        <VPMenuLink :item="locale" :external="false" v-bind="localeProps(locale)" />
      </template>
    </ul>
  </VPFlyout>
</template>

<style scoped>
/* flyout variant */
.VPNavBarTranslations {
  display: none;
}

@media (min-width: 48rem) {
  .VPNavBarTranslations {
    display: flex;
    align-items: center;
  }
}

.VPNavBarTranslations .title {
  padding: 0 1.5rem 0 0.75rem;
  line-height: 2.2857143;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

/* menu-group variant (inside the `⋯` menu) — matches the menu group
   titles */
.group > .title {
  padding: 0 0.75rem;
  line-height: 2.2857143;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

/* accordion variant (inside the nav screen) */
.VPNavScreenTranslations .title {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.VPNavScreenTranslations .icon {
  font-size: 1rem;
}

.VPNavScreenTranslations .icon.lang {
  margin-right: 0.5rem;
}

.VPNavScreenTranslations .icon.chevron {
  margin-left: 0.25rem;
  transition: transform 0.25s;
}

.VPNavScreenTranslations.open .icon.chevron {
  transform: rotate(180deg);
}

.VPNavScreenTranslations .list {
  padding: 0.25rem 0 0 1.5rem;
}

.VPNavScreenTranslations .link {
  line-height: 2.4615385;
  font-size: 0.8125rem;
  color: var(--vp-c-text-1);
}
</style>
