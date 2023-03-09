<script setup lang="ts">
import { useRoute } from 'vitepress'
import { computed } from 'vue'
import { useSidebar } from '../composables/sidebar.js'
import VPDocAside from './VPDocAside.vue'
import VPDocFooter from './VPDocFooter.vue'

const route = useRoute()
const { hasSidebar, hasAside } = useSidebar()

const pageName = computed(() =>
  route.path.replace(/[./]+/g, '_').replace(/_html$/, '')
)
</script>

<template>
  <div
    class="VPDoc"
    :class="{ 'has-sidebar': hasSidebar, 'has-aside': hasAside }"
  >
    <div class="container">
      <div v-if="hasAside" class="aside">
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
            <Content class="vp-doc" :class="pageName" />
          </main>
          <slot name="doc-footer-before" />
          <VPDocFooter />
          <slot name="doc-after" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.VPDoc {
  padding: 32px 24px 96px;
  inline-size: 100%;
}

@media (min-width: 768px) {
  .VPDoc {
    padding: 48px 32px 128px;
  }
}

@media (min-width: 960px) {
  .VPDoc {
    padding: 32px 32px 0;
  }

  .VPDoc:not(.has-sidebar) .container {
    display: flex;
    justify-content: center;
    max-inline-size: 992px;
  }

  .VPDoc:not(.has-sidebar) .content {
    max-inline-size: 752px;
  }
}

@media (min-width: 1280px) {
  .VPDoc .container {
    display: flex;
    justify-content: center;
  }

  .VPDoc .aside {
    display: block;
  }
}

@media (min-width: 1440px) {
  .VPDoc:not(.has-sidebar) .content {
    max-inline-size: 784px;
  }

  .VPDoc:not(.has-sidebar) .container {
    max-inline-size: 1104px;
  }
}

.container {
  margin-inline: auto;
  inline-size: 100%;
}

.aside {
  position: relative;
  display: none;
  order: 2;
  flex-grow: 1;
  padding-inline-start: 32px;
  inline-size: 100%;
  max-inline-size: 256px;
}

.aside-container {
  position: sticky;
  inset-block-start: 0;
  margin-block-start: calc((var(--vp-nav-height) + var(--vp-layout-top-height, 0px)) * -1 - 32px);
  padding-block-start: calc(var(--vp-nav-height) + var(--vp-layout-top-height, 0px) + 32px);
  block-size: 100vb;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: none;
}

.aside-container::-webkit-scrollbar {
  display: none;
}

.aside-curtain {
  position: fixed;
  inset-block-end: 0;
  z-index: 10;
  inline-size: 224px;
  block-size: 32px;
  background: linear-gradient(transparent, var(--vp-c-bg) 70%);
}

.aside-content {
  display: flex;
  flex-direction: column;
  min-block-size: calc(100vb - (var(--vp-nav-height) + var(--vp-layout-top-height, 0px) + 32px));
  padding-block-end: 32px;
}

.content {
  position: relative;
  margin: 0 auto;
  inline-size: 100%;
}

@media (min-width: 960px) {
  .content {
    padding: 0 32px 128px;
  }
}

@media (min-width: 1280px) {
  .content {
    order: 1;
    margin: 0;
    min-inline-size: 640px;
  }
}

.content-container {
  margin-inline: auto;
}

.VPDoc.has-aside .content-container {
  max-inline-size: 688px;
}
</style>
