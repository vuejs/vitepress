import {
  type App,
  computed,
  inject,
  reactive,
  type UnwrapNestedRefs
} from 'vue'

const inertSymbol = Symbol()
const inertStateSymbol = Symbol()

export interface Inert {
  isSidebarOpen: boolean
  isScreenOpen: boolean
  isSidebarEnabled: boolean
  onAfterRouteChanged: () => void
}

export interface InertState {
  inertSkipLink: boolean
  inertNav: boolean
  inertLocalNav: boolean
  inertSidebar: boolean
  inertContent: boolean
  inertFooter: boolean
}

export function useInert() {
  return inject<UnwrapNestedRefs<Inert>>(inertSymbol)
}

export function useInertState() {
  return inject<UnwrapNestedRefs<InertState>>(inertStateSymbol)
}

export function provideInert(app: App) {
  const inert = reactive({
    isSidebarOpen: false,
    isScreenOpen: false,
    isSidebarEnabled: false,
    onAfterRouteChanged() {
      inert.isSidebarOpen = false
      inert.isScreenOpen = false
    }
  })
  const inertState = reactive({
    inertSkipLink: computed(() => inert.isSidebarOpen || inert.isScreenOpen),
    inertNav: computed(() => inert.isSidebarOpen),
    inertLocalNav: computed(() => inert.isSidebarOpen || inert.isScreenOpen),
    inertSidebar: computed(
      () =>
        !inert.isSidebarEnabled && (!inert.isSidebarOpen || inert.isScreenOpen)
    ),
    inertContent: computed(() => inert.isSidebarOpen || inert.isScreenOpen),
    inertFooter: computed(() => inert.isSidebarOpen || inert.isScreenOpen)
  })

  app.provide(inertSymbol, inert)
  app.provide(inertStateSymbol, inertState)
}
