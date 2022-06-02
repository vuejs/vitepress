<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
const backToTop = ref()

watch(() => route.path, () => backToTop.value.focus())

function focusOnTargetAnchor({ target }: Event) {
  const el = document.querySelector(
    (target as HTMLAnchorElement).hash!
  ) as HTMLAnchorElement

  if (el) {
    const removeTabIndex = () => {
      el.removeAttribute('tabindex')
      el.removeEventListener('blur', removeTabIndex)
    }

    el.setAttribute('tabindex', '-1')
    el.addEventListener('blur', removeTabIndex)
    el.focus()
    window.scrollTo(0, 0)
  }
}
</script>

<template>
  <span ref="backToTop" tabindex="-1" />
  <a
    href="#VPContent"
    class="VPSkipLink visually-hidden"
    @click="focusOnTargetAnchor"
  >
    Skip to content
  </a>
</template>

<style scoped>
.VPSkipLink {
  top: .5rem;
  left: .5rem;
  padding: .5rem 1rem;
  z-index: 999;
  border-radius: 8px;
  font-size: .75rem;
  font-weight: bold;
  text-decoration: none;
  color: var(--vp-c-brand);
  box-shadow: var(--vp-shadow-3);
  background-color: var(--vp-c-bg);
}

.VPSkipLink:focus {
  height: auto;
  width: auto;
  clip: auto;
  clip-path: none;
}

.dark .VPSkipLink {
  color: var(--vp-c-green);
}

@media (min-width: 1280px) {
  .VPSkipLink {
    top: .875rem;
    left: 1rem;
  }
}
</style>
