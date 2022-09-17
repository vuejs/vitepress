<script setup>
import { shallowRef, watchPostEffect } from 'vue'
import { useRoute } from '../router.js'

const vitePressRoute = useRoute()
const previouslyLoadedPath = shallowRef(vitePressRoute.path)
const routeAnnouncement = shallowRef('')

watchPostEffect(() => {
  if (previouslyLoadedPath.value === vitePressRoute.path) return
  previouslyLoadedPath.value === vitePressRoute.path
  if (document?.title) {
    routeAnnouncement.value = document?.title
  } else {
    const vitepressPageHeader = document?.querySelector?.('h1')
    const vitepressContent =
      vitepressPageHeader?.innerText ?? vitepressPageHeader?.textContent
    routeAnnouncement.value = vitepressContent || vitePressRoute?.path
  }
});
</script>

<template>
  <p
    class="vitepress-route-announcer"
    aria-live="assertive"
    id="__vitepress-route-announcer__"
    v-memo="[routeAnnouncement]"
    role="alert"
  >
    {{ routeAnnouncement }}
  </p>
</template>

<style scoped>
.vitepress-route-announcer{
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
  white-space: nowrap;
  word-wrap: normal;
}
</style>
