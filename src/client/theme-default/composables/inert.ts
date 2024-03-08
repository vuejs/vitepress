import { reactive } from 'vue'
import { clientComputed } from '../support/reactivity'

export const inertControls = reactive({
  isScreenOpen: false,
  isSidebarOpen: false,
  isSidebarVisible: false
})

export function useInert() {
  return clientComputed(() => ({
    skipLink: inertControls.isSidebarOpen || inertControls.isScreenOpen,
    nav: inertControls.isSidebarOpen,
    localNav: inertControls.isSidebarOpen || inertControls.isScreenOpen,
    sidebar: !inertControls.isSidebarVisible || inertControls.isScreenOpen,
    content: inertControls.isSidebarOpen || inertControls.isScreenOpen,
    footer: inertControls.isSidebarOpen || inertControls.isScreenOpen
  }))
}
