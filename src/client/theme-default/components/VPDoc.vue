<script setup lang="ts">
import { useRoute } from 'vitepress'
import { computed } from 'vue'
import { useData } from '../composables/data'
import { useLayout } from '../composables/layout'
import VPDocAside from './VPDocAside.vue'
import VPDocFooter from './VPDocFooter.vue'

const { theme } = useData()
const route = useRoute()
const { hasSidebar, hasAside, leftAside } = useLayout()

const pageName = computed(() =>
  route.path.replace(/[./]+/g, '_').replace(/_html$/, '')
)
</script>

<template>
  <div
    class="VPDoc"
    :class="{ 'has-sidebar': hasSidebar, 'has-aside': hasAside }"
  >
    <slot name="doc-top" />
    <div class="container">
      <div v-if="hasAside" class="aside" :class="{'left-aside': leftAside}">
        <div class="aside-curtain" />
        <div class="aside-container">
          <div class="aside-content">
            <VPDocAside>
              <template #aside-top><slot name="aside-top" /></template>
              <template #aside-bottom><slot name="aside-bottom" /></template>
              <template #aside-outline-before><slot name="aside-outline-before" /></template>
              <template #aside-outline-after><slot name="aside-outline-after" /></template>
              <template #aside-ads-before><slot name="aside-ads-before" /></template>
              <template #aside-ads-after><slot name="aside-ads-after" /></template>
            </VPDocAside>
          </div>
        </div>
      </div>

      <div class="content">
        <div class="content-container">
          <slot name="doc-before" />
          <main class="main">
            <Content
              class="vp-doc"
              :class="[
                pageName,
                theme.externalLinkIcon && 'external-link-icon-enabled'
              ]"
            />
          </main>
          <VPDocFooter>
            <template #doc-footer-before><slot name="doc-footer-before" /></template>
          </VPDocFooter>
          <slot name="doc-after" />
        </div>
      </div>
    </div>
    <slot name="doc-bottom" />
  </div>
</template>

<style scoped>
.VPDoc {
  padding: 2rem 1.5rem 6rem;
  width: 100%;
}

@media (min-width: 48rem) {
  .VPDoc {
    padding: 3rem 2rem 8rem;
  }
}

@media (min-width: 60rem) {
  .VPDoc {
    padding: 3rem 2rem 0;
  }

  .VPDoc:not(.has-sidebar) .container {
    display: flex;
    justify-content: center;
    max-width: 62rem;
  }

  .VPDoc:not(.has-sidebar) .content {
    max-width: 47rem;
  }
}

@media (min-width: 80rem) {
  .VPDoc .container {
    display: flex;
    justify-content: center;
  }

  .VPDoc .aside {
    display: block;
  }
}

@media (min-width: 90rem) {
  .VPDoc:not(.has-sidebar) .content {
    max-width: 49rem;
  }

  .VPDoc:not(.has-sidebar) .container {
    max-width: 69rem;
  }
}

.container {
  margin: 0 auto;
  width: 100%;
}

.aside {
  position: relative;
  display: none;
  order: 2;
  flex-grow: 1;
  padding-left: 2rem;
  width: 100%;
  max-width: 16rem;
}

.left-aside {
  order: 1;
  padding-left: unset;
  padding-right: 2rem;
}

.aside-container {
  position: fixed;
  top: 0;
  padding-top: calc(var(--vp-nav-height) + var(--vp-layout-top-height, 0px) + var(--vp-doc-top-height, 0px) + 3rem);
  width: 14rem;
  height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: none;
}

.aside-container::-webkit-scrollbar {
  display: none;
}

.aside-curtain {
  position: fixed;
  bottom: 0;
  z-index: 10;
  width: 14rem;
  height: 2rem;
  background: linear-gradient(transparent, var(--vp-c-bg) 70%);
  pointer-events: none;
}

.aside-content {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - (var(--vp-nav-height) + var(--vp-layout-top-height, 0px) + 3rem));
  padding-bottom: 2rem;
}

.content {
  position: relative;
  margin: 0 auto;
  width: 100%;
}

@media (min-width: 60rem) {
  .content {
    padding: 0 2rem 8rem;
  }
}

@media (min-width: 80rem) {
  .content {
    order: 1;
    margin: 0;
    min-width: 40rem;
  }
}

.content-container {
  margin: 0 auto;
}

.VPDoc.has-aside .content-container {
  max-width: 43rem;
}
</style>
