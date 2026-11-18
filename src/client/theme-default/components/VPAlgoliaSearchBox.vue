<script setup lang="ts">
import type { DocSearchInstance, DocSearchProps } from '@docsearch/js'
import type { SidepanelInstance } from '@docsearch/sidepanel-js'
import { inBrowser, useRouter } from 'vitepress'
import type { DefaultTheme } from 'vitepress/theme'
import { nextTick, onUnmounted, watch } from 'vue'

import type { DocSearchAskAi } from '../../../../types/docsearch'
import { useData } from '../composables/data'
import {
  buildSidePanelProps,
  resolveMode,
  validateCredentials
} from '../support/docsearch'

const props = defineProps<{
  algoliaOptions: DefaultTheme.AlgoliaSearchOptions
  openRequest?: {
    target: 'search' | 'askAi' | 'toggleAskAi'
    nonce: number
  } | null
}>()

const router = useRouter()
const { site } = useData()

let cleanup = () => {}
let docsearchInstance: DocSearchInstance | undefined
let sidepanelInstance: SidepanelInstance | undefined
let openOnReady: 'search' | 'askAi' | null = null
let initializeCount = 0
let docsearchLoader: Promise<typeof import('@docsearch/js/docsearch')> | undefined
let docsearchAiLoader: Promise<typeof import('@docsearch/js')> | undefined
let sidepanelLoader: Promise<typeof import('@docsearch/sidepanel-js')> | undefined
let lastFocusedElement: HTMLElement | null = null
let skipEventDocsearch = false
let skipEventSidepanel = false

watch(() => props.algoliaOptions, update, { immediate: true })
onUnmounted(cleanup)

watch(
  () => props.openRequest?.nonce,
  () => {
    const req = props.openRequest
    if (!req) return
    if (req.target === 'search') {
      if (docsearchInstance?.isReady) {
        onBeforeOpen('docsearch', () => docsearchInstance?.open())
      } else {
        openOnReady = 'search'
      }
    } else if (req.target === 'toggleAskAi') {
      if (sidepanelInstance?.isOpen) {
        sidepanelInstance.close()
      } else {
        onBeforeOpen('sidepanel', () => sidepanelInstance?.open())
      }
    } else {
      // askAi - open sidepanel or fallback to docsearch modal
      if (sidepanelInstance?.isReady) {
        onBeforeOpen('sidepanel', () => sidepanelInstance?.open())
      } else if (sidepanelInstance) {
        openOnReady = 'askAi'
      } else if (docsearchInstance?.isReady) {
        onBeforeOpen('docsearch', () => docsearchInstance?.openAskAi())
      } else {
        openOnReady = 'askAi'
      }
    }
  },
  { immediate: true }
)

async function update(options: DefaultTheme.AlgoliaSearchOptions) {
  if (!inBrowser) return
  await nextTick()

  const askAi = options.askAi as DocSearchAskAi | undefined

  const { valid, ...credentials } = validateCredentials({
    appId: options.appId ?? askAi?.appId,
    apiKey: options.apiKey ?? askAi?.apiKey,
    indices: options.indices,
    mode: options.mode,
    askAi: options.askAi
  })

  if (!valid) {
    console.warn('[vitepress] Algolia search cannot be initialized: missing appId/apiKey/indices.')
    return
  }

  await initialize({ ...options, ...credentials })
}

async function initialize(userOptions: DefaultTheme.AlgoliaSearchOptions) {
  const currentInitialize = ++initializeCount

  // Always tear down previous instances first (e.g. on locale changes)
  cleanup()

  const { useSidePanel, showKeywordSearch } = resolveMode(userOptions)
  const askAi = userOptions.askAi as DocSearchAskAi | undefined
  const usingAskAi = !!askAi
  const usingSidepanel = useSidePanel && !!askAi?.sidePanel

  // Load everything that is needed in parallel
  const [, docsearchModule, sidepanelModule] = await Promise.all([
    loadDocSearchCssBundles({ usingAskAi, usingSidepanel }),
    showKeywordSearch ? loadDocsearch(usingAskAi) : undefined,
    usingSidepanel ? loadSidepanel() : undefined
  ])

  if (currentInitialize !== initializeCount) return

  const docsearch = docsearchModule?.default
  const sidepanel = sidepanelModule?.default

  if (usingSidepanel && sidepanel) {
    sidepanelInstance = sidepanel({
      ...buildSidePanelProps(askAi, userOptions),
      onOpen: focusInput,
      onClose: onClose.bind(null, 'sidepanel'),
      onReady: () => {
        if (openOnReady === 'askAi') {
          openOnReady = null
          onBeforeOpen('sidepanel', () => sidepanelInstance?.open())
        }
      },
      keyboardShortcuts: {
        'Ctrl/Cmd+I': false
      }
    })
  }

  if (docsearch) {
    const options = {
      ...userOptions,
      container: '#vp-docsearch',
      navigator: {
        navigate(item) {
          router.go(item.itemUrl)
        }
      },
      transformItems: (items) => items.map((item) => ({ ...item, url: getRelativePath(item.url) })),
      // When sidepanel is enabled, intercept Ask AI events to open it instead (hybrid mode)
      ...(useSidePanel && sidepanelInstance && {
        interceptAskAiEvent: (initialMessage) => {
          onBeforeOpen('sidepanel', () => sidepanelInstance?.open(initialMessage))
          return true
        }
      }),
      onOpen: focusInput,
      onClose: onClose.bind(null, 'docsearch'),
      onReady: () => {
        if (openOnReady === 'search') {
          openOnReady = null
          onBeforeOpen('docsearch', () => docsearchInstance?.open())
        } else if (openOnReady === 'askAi' && !sidepanelInstance) {
          // No sidepanel configured, use docsearch modal for askAi
          openOnReady = null
          onBeforeOpen('docsearch', () => docsearchInstance?.openAskAi())
        }
      },
      keyboardShortcuts: {
        '/': false,
        'Ctrl/Cmd+K': false
      }
    } as DocSearchProps

    docsearchInstance = docsearch(options)
  }

  cleanup = () => {
    docsearchInstance?.destroy()
    sidepanelInstance?.destroy()
    docsearchInstance = undefined
    sidepanelInstance = undefined
    openOnReady = null
    lastFocusedElement = null
  }
}

function focusInput() {
  requestAnimationFrame(() => {
    const input =
      document.querySelector<HTMLInputElement>('#docsearch-input') ||
      document.querySelector<HTMLInputElement>('#docsearch-sidepanel textarea')
    input?.focus()
  })
}

function onBeforeOpen(target: 'docsearch' | 'sidepanel', cb: () => void) {
  if (target === 'docsearch') {
    if (sidepanelInstance?.isOpen) {
      skipEventSidepanel = true
      sidepanelInstance.close()
    } else if (!docsearchInstance?.isOpen) {
      if (document.activeElement instanceof HTMLElement) {
        lastFocusedElement = document.activeElement
      }
    }
  } else if (target === 'sidepanel') {
    if (docsearchInstance?.isOpen) {
      skipEventDocsearch = true
      docsearchInstance.close()
    } else if (!sidepanelInstance?.isOpen) {
      if (document.activeElement instanceof HTMLElement) {
        lastFocusedElement = document.activeElement
      }
    }
  }
  setTimeout(cb, 0)
}

function onClose(target: 'docsearch' | 'sidepanel') {
  if (target === 'docsearch') {
    if (skipEventDocsearch) {
      skipEventDocsearch = false
      return
    }
  } else if (target === 'sidepanel') {
    if (skipEventSidepanel) {
      skipEventSidepanel = false
      return
    }
  }
  if (lastFocusedElement) {
    lastFocusedElement.focus()
    lastFocusedElement = null
  }
}

// DocSearch V5 now splits it's CSS bundles, namely that `modal.css` does not contain Ask AI related CSS.
// With this, we can better target load the needed CSS bundles to save some page load.
async function loadDocSearchCssBundles({ usingAskAi, usingSidepanel }: { usingAskAi: boolean; usingSidepanel: boolean; }) {
  if (usingAskAi) {
    await import('@docsearch/css/dist/style.css')
  } else {
    await import('@docsearch/css/dist/_variables.css')
    await import('@docsearch/css/dist/modal.css')
  }

  if (usingSidepanel) {
    await import('@docsearch/css/dist/sidepanel.css')
  }

  await import('../styles/docsearch.css')
}

// DocSearch V5 now splits it's bundles between Ask AI or search only.
// As such, we can better target load the needed bundle.
function loadDocsearch(usingAskAi: boolean) {
  // The default export includes Ask AI
  if (usingAskAi) {
    docsearchAiLoader ??= import('@docsearch/js')
    return docsearchAiLoader
  }

  docsearchLoader ??= import('@docsearch/js/docsearch')

  return docsearchLoader
}

function loadSidepanel() {
  if (!sidepanelLoader) {
    sidepanelLoader = import('@docsearch/sidepanel-js')
  }
  return sidepanelLoader
}

function getRelativePath(url: string) {
  const { pathname, hash } = new URL(url, location.origin)
  return pathname.replace(/\.html$/, site.value.cleanUrls ? '' : '.html') + hash
}
</script>

<template>
  <div id="vp-docsearch" />
  <div id="vp-docsearch-sidepanel" />
</template>
