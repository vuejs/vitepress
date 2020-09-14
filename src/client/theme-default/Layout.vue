<template>
  <div class="theme">
    <header>
      <NavBar />
      <ToggleSideBarButton @toggle="toggleSidebar" />
    </header>
    <aside :class="{ open }">
      <SideBar>
        <template #top>
          <slot name="sidebar-top">
            <!-- use the title to force a new ad for every navigation -->
            <CarbonAds
              v-if="$site.themeConfig.carbonAds"
              :key="$page.title"
              :serve="$site.themeConfig.carbonAds.serve"
              :placement="$site.themeConfig.carbonAds.placement"
            />
          </slot>
        </template>
        <template #bottom>
          <slot name="sidebar-bottom" />
        </template>
      </SideBar>
    </aside>
    <div
      class="sidebar-mask"
      :class="{ 'sidebar-open': open }"
      @click="toggleSidebar(false)"
    />
    <main>
      <Page>
        <template #top>
          <slot name="page-top" />
        </template>
        <template #bottom>
          <slot name="page-bottom">
            <!-- use the title to force a new ad for every navigation -->
            <BuySellAds
              v-if="$site.themeConfig.carbonAds"
              :key="$page.title"
              :serve="$site.themeConfig.carbonAds.serve"
              :placement="$site.themeConfig.carbonAds.placement"
            />
          </slot>
        </template>
      </Page>
    </main>
  </div>
  <Debug />
</template>

<script>
import { ref, computed } from 'vue'
import NavBar from './components/NavBar.vue'
import ToggleSideBarButton from './components/ToggleSideBarButton.vue'
import SideBar from './components/SideBar.vue'
import Page from './components/Page.vue'
import CarbonAds from './components/CarbonAds.vue'
import BuySellAds from './components/BuySellAds.vue'

export default {
  components: {
    NavBar,
    ToggleSideBarButton,
    SideBar,
    Page,
    CarbonAds,
    BuySellAds
  },

  setup() {
    const open = ref(false)

    const toggleSidebar = (to) => {
      open.value = typeof to === 'boolean' ? to : !open.value
    }

    return { open, toggleSidebar }
  }
}
</script>
