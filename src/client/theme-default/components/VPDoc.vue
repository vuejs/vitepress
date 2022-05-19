<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import VPDocOutline from './VPDocOutline.vue'
import VPDocFooter from './VPDocFooter.vue'

const { page } = useData()

const pageName = computed(() => {
  return page.value.relativePath.slice(0, page.value.relativePath.indexOf('/'))
})
</script>

<template>
  <div class="VPDoc has-aside">
    <div class="container">
      <div class="aside">
        <div class="aside-container">
          <div class="aside-curtain" />
          <div class="aside-content">
            <VPDocOutline v-if="page.headers" />
          </div>
        </div>
      </div>

      <div class="content">
        <main class="main">
          <Content class="vp-doc" :class="pageName" />
        </main>

        <VPDocFooter />
      </div>
    </div>
  </div>
</template>

<style scoped>
.VPDoc {
  padding: 32px 24px 96px;
}

@media (min-width: 768px) {
  .VPDoc {
    padding: 48px 32px 128px;
  }
}

@media (min-width: 960px) {
  .VPDoc {
    padding: 32px 64px 96px;
  }
}

@media (min-width: 1280px) {
  .VPDoc {
    padding: 32px 0 128px 64px;
  }

  .VPDoc:not(.has-sidebar.has-aside) {
    padding-left: calc((100vw - 688px) / 2);
  }

  .VPDoc.has-aside:not(.has-sidebar) {
    padding-left: calc((100vw - 688px - 320px) / 2);
  }

  .VPDoc:not(.has-aside) .content {
    min-width: 688px;
  }
}

@media (min-width: 1440px) {
  .VPDoc {
    padding: 32px 0 128px 96px;
  }
}

@media (min-width: 1280px) {
  .container {
    display: flex;
  }
}

.aside {
  position: relative;
  display: none;
  order: 2;
  flex-shrink: 0;
  flex-grow: 1;
  padding-left: 64px;
  padding-right: 32px;
  min-width: 320px;
}

@media (min-width: 1280px) {
  .aside {
    display: block;
  }
}

@media (min-width: 1440px) {
  .aside {
    padding-left: 96px;
  }
}

.aside-container {
  position: fixed;
  top: var(--vp-nav-height-desktop);
  bottom: 0;
  padding-top: 32px;
  width: 224px;
  overflow-x: hidden;
  overflow-y: auto;
}

.aside-container::-webkit-scrollbar {
  display: none;
}

@media (min-width: 1440px) {
  .aside-container {
    width: 256px;
  }
}

.aside-curtain {
  position: fixed;
  top: var(--vp-nav-height-desktop);
  z-index: 10;
  width: 100%;
  height: 40px;
  background: linear-gradient(var(--vp-c-bg-content), transparent);
}

.aside-content {
  padding-bottom: 96px;
}

.content {
  position: relative;
  margin: 0 auto;
  max-width: 688px;
}

@media (min-width: 1280px) {
  .content {
    order: 1;
    margin: 0;
    min-width: 632px;
  }
}

.edit-link {
  margin: 0 0 32px;
}

.edit-link .vt-link {
  font-size: 14px;
  color: var(--vt-c-brand);
  font-weight: 500;
}

.vt-icon {
  width: 18px;
  height: 18px;
  color: var(--vt-c-brand);
  display: inline-block;
  margin-right: 8px;
  position: relative;
  top: -1px;
}
</style>
