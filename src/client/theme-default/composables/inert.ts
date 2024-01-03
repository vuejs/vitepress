import { computed, reactive } from 'vue'

export const inertControls = reactive({
  isSidebarOpen: false,
  isScreenOpen: false,
  isSidebarVisible: true
})

export const inertState = reactive({
  inertSkipLink: computed(
    () => inertControls.isSidebarOpen || inertControls.isScreenOpen
  ),
  inertNav: computed(() => inertControls.isSidebarOpen),
  inertLocalNav: computed(
    () => inertControls.isSidebarOpen || inertControls.isScreenOpen
  ),
  inertSidebar: computed(
    () => !inertControls.isSidebarVisible || inertControls.isScreenOpen
  ),
  inertContent: computed(
    () => inertControls.isSidebarOpen || inertControls.isScreenOpen
  ),
  inertFooter: computed(
    () => inertControls.isSidebarOpen || inertControls.isScreenOpen
  )
})
