<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { useSidebar } from '../composables/sidebar'
import VPDocOutline from './VPDocOutline.vue'
import VPDocFooter from './VPDocFooter.vue'

const { page } = useData()
const { hasSidebar } = useSidebar()

const pageName = computed(() => {
  return page.value.relativePath.slice(0, page.value.relativePath.indexOf('/'))
})
</script>

<template>
  <div class="VPDoc" :class="{ 'has-sidebar': hasSidebar }">
    <div class="container">
      <div class="aside">
        <div class="aside-curtain" />
        <div class="aside-container">
          <div class="aside-content">
            <VPDocOutline v-if="page.headers" />
          </div>
        </div>
      </div>

      <div class="content">
        <div class="content-container">
          <main class="main">
            <Content class="vp-doc" :class="pageName" />
          </main>

          <VPDocFooter />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.VPDoc {
  padding: 32px 24px 96px;
  width: 100%;
}

@media (min-width: 768px) {
  .VPDoc {
    padding: 48px 32px 128px;
  }
}

@media (min-width: 960px) {
  .VPDoc {
    padding: 32px 32px 128px;
  }

  .VPDoc:not(.has-sidebar) .container {
    display: flex;
    justify-content: center;
    max-width: 992px;
  }

  .VPDoc:not(.has-sidebar) .aside {
    display: block;
  }

  .VPDoc:not(.has-sidebar) .content {
    max-width: 752px;
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
    max-width: 784px;
  }

  .VPDoc:not(.has-sidebar) .container {
    max-width: 1104px;
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
  flex-shrink: 0;
  padding-left: 32px;
  min-width: 240px;
}

@media (min-width: 1440px) {
  .aside {
    padding-left: 64px;
  }
}

.aside-container {
  position: sticky;
  top: 0;
  margin-top: calc(var(--vp-nav-height-desktop) * -1 - 32px);
  padding-top: calc(var(--vp-nav-height-desktop) + 32px);
  width: 208px;
  max-height: 100vh;
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
  position: absolute;
  bottom: 0;
  z-index: 10;
  width: 100%;
  height: 64px;
  background: linear-gradient(transparent, var(--vp-c-bg-content));
}

.aside-content {
  padding-bottom: 96px;
}

.content {
  position: relative;
  margin: 0 auto;
}

@media (min-width: 960px) {
  .content {
    padding: 0 32px;
  }
}

@media (min-width: 1280px) {
  .content {
    order: 1;
    margin: 0;
    min-width: 640px;
  }
}

@media (min-width: 1440px) {
  .content {
    padding-left: 64px;
  }
}

.content-container {
  margin: 0 auto;
  max-width: 688px;
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
