<script setup lang="ts">
import { ref, shallowRef, computed, nextTick, watch, onBeforeUnmount, onMounted } from 'vue'
import { useData, useRouter } from 'vitepress'
import { onKeyStroke, useScrollLock, useInfiniteScroll } from '@vueuse/core'
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'
import type { SearchResult, QueryResultDocumentInfo } from '@inferedge/moss'
import mossLogo from '../assets/InferEdgeLogo_Dark_Icon.png'

// ---------Metadata structure for Search Results-----------
interface MossMetadata {
  title: string
  path: string
  groupId: string
  type: 'page' | 'header' | 'text' | 'code'
  groupTitle: string
  displayBreadcrumb: string
  sanitizedText: string
  navigation?: string
}

// -------- UI View Model Interfaces for each search hit -----------
interface ResultItemVM {
  id: string
  data: QueryResultDocumentInfo
  flatIndex: number
  htmlSnippet: string
  breadcrumb: string
  breadcrumbHtml: string
  titleHtml?: string
  navigation: string
  type: 'page' | 'header' | 'text' | 'code'
}

// -------- UI View Model Interface for each group of search hits -----------
interface GroupVM {
  title: string
  path: string
  headerMatch: ResultItemVM | null
  children: ResultItemVM[]
}

// -------- Event Emitters -----------
const emit = defineEmits<{ (e: 'close'): void }>()
const props = defineProps<{ open: boolean }>()

// --------- Configuration -----------
const { theme } = useData()
const router = useRouter()
const options = computed(() => theme.value.search?.options || {})

// --------- State -----------
// el : holds root element of the search box
// searchInput : holds the input element of the search box
const el = ref<HTMLElement>()
const searchInput = ref<HTMLInputElement>()

// Split Input vs Search State
const inputValue = ref('')        // Bound to <input> (Instant updates)
const searchQuery = ref('')       // Triggers the search logic

const rawResults = shallowRef<QueryResultDocumentInfo[]>([])
const displayGroups = shallowRef<GroupVM[]>([])
const flatNavigationList = shallowRef<Array<{ path: string }>>([]) 

const status = ref<'idle' | 'initializing' | 'ready' | 'searching' | 'processing' | 'error'>('idle')
const selectedIndex = ref(0)
const errorMessage = ref('')
const isMounted = ref(false)

// Persistent Client
const mossClient = shallowRef<any>(null)
let initPromise: Promise<void> | null = null
let lastQueryToken = 0       // To track network requests

// --------- Performance Profiling -----------
const ENABLE_PROFILING = import.meta.env.VITE_MOSS_LOG_LEVEL === 'info'
let currentProfile: {
  query: string
  inputTime: number
  searchStartTime: number
  searchEndTime: number
  processingStartTime: number
  processingEndTime: number
  escapeHtmlTime: number
  generateSnippetTime: number
  highlightBreadcrumbTime: number
  visibleGroupsTime: number
  totalTime: number
} | null = null

let escapeHtmlCallCount = 0
let escapeHtmlTotalTime = 0
let generateSnippetCallCount = 0
let generateSnippetTotalTime = 0
let highlightBreadcrumbCallCount = 0
let highlightBreadcrumbTotalTime = 0

function getTime() {
  return performance?.now?.() ?? Date.now()
}

function logProfile() {
  if (!ENABLE_PROFILING || !currentProfile) return
  
  const profile = currentProfile
  console.group(`🔍 [Moss Performance] "${profile.query}"`)
  console.log(`⏱️  Total Time: ${profile.totalTime.toFixed(2)}ms`)
  console.log(`  ├─ Search API: ${(profile.searchEndTime - profile.searchStartTime).toFixed(2)}ms`)
  console.log(`  ├─ Processing: ${(profile.processingEndTime - profile.processingStartTime).toFixed(2)}ms`)
  console.log(`  │  ├─ escapeHtml: ${profile.escapeHtmlTime.toFixed(2)}ms (${escapeHtmlCallCount} calls, avg: ${(profile.escapeHtmlTime / Math.max(1, escapeHtmlCallCount)).toFixed(2)}ms)`)
  console.log(`  │  ├─ generateSnippet: ${profile.generateSnippetTime.toFixed(2)}ms (${generateSnippetCallCount} calls, avg: ${(profile.generateSnippetTime / Math.max(1, generateSnippetCallCount)).toFixed(2)}ms)`)
  console.log(`  │  └─ highlightBreadcrumb: ${profile.highlightBreadcrumbTime.toFixed(2)}ms (${highlightBreadcrumbCallCount} calls, avg: ${(profile.highlightBreadcrumbTime / Math.max(1, highlightBreadcrumbCallCount)).toFixed(2)}ms)`)
  console.log(`  └─ visibleGroups: ${profile.visibleGroupsTime.toFixed(2)}ms`)
  console.groupEnd()
  
  // Reset counters
  escapeHtmlCallCount = 0
  escapeHtmlTotalTime = 0
  generateSnippetCallCount = 0
  generateSnippetTotalTime = 0
  highlightBreadcrumbCallCount = 0
  highlightBreadcrumbTotalTime = 0
  currentProfile = null
}

const isLoading = computed(() => status.value === 'initializing' || status.value === 'searching' || status.value === 'processing')

// Spinner UX smoothing: avoid flicker on ultra-fast searches
const isSpinnerVisible = ref(false)
let spinnerShowTimer: ReturnType<typeof setTimeout> | null = null
let spinnerHideTimer: ReturnType<typeof setTimeout> | null = null
let spinnerShownAt: number | null = null

//--------- Helper Function -----------
// clears the spinner timers, which is used to avoid flicker on ultra-fast searches
// It's called before starting new timers in the isLoading watcher.
function clearSpinnerTimers() {
  if (spinnerShowTimer) {
    clearTimeout(spinnerShowTimer)
    spinnerShowTimer = null
  }
  if (spinnerHideTimer) {
    clearTimeout(spinnerHideTimer)
    spinnerHideTimer = null
  }
}

//--------- Watcher -----------
// watches the isLoading state and shows/hides the spinner accordingly
watch(isLoading, (loading) => {
  clearSpinnerTimers()

  if (loading) {
    // Delay showing loading logo to skip extremely fast searches
    spinnerShowTimer = setTimeout(() => {
      isSpinnerVisible.value = true
      spinnerShownAt = Date.now()
    }, 120)
  } else {
    const minVisible = 200
    const elapsed = spinnerShownAt ? Date.now() - spinnerShownAt : 0
    const wait = Math.max(0, minVisible - elapsed)
    spinnerHideTimer = setTimeout(() => {
      isSpinnerVisible.value = false
      spinnerShownAt = null
    }, wait)
  }
})

// --------- Init Rendering Scrolling Logic -----------
const dropdownEl = ref<HTMLElement>() // We will bind this to the scroll container
const renderLimit = ref(15)           // Start with only 15 items

//--------- Computed Properties -----------
// This computes EXACTLY what needs to be rendered.
// It stops adding groups/children once we hit the renderLimit.
const visibleGroups = computed(() => {
  const start = ENABLE_PROFILING ? getTime() : 0
  const limit = renderLimit.value
  const source = displayGroups.value
  const result: GroupVM[] = []
  let count = 0

  for (const group of source) {
    if (count >= limit) break

    // Create a lightweight clone to avoid mutating original data
    const newGroup: GroupVM = { ...group, children: [] }
    
    // Count the Group Header (if it's a match)
    if (group.headerMatch) {
      if (count >= limit) break
      count++
    }

    // Determine how many children fit in the remaining budget
    const remaining = limit - count
    if (remaining > 0) {
      if (group.children.length <= remaining) {
        // Add all children
        newGroup.children = group.children
        count += group.children.length
      } else {
        // Slice children to fit
        newGroup.children = group.children.slice(0, remaining)
        count += remaining
      }
    }
    
    result.push(newGroup)
  }
  
  if (ENABLE_PROFILING && currentProfile) {
    const elapsed = getTime() - start
    currentProfile.visibleGroupsTime = elapsed
  }
  
  return result
})


// --------- Infinite Scroll Logic -----------
// Increase limit when user scrolls to bottom
useInfiniteScroll(
  dropdownEl,
  () => {
    // Only increase if we actually have more data to show
    const totalItems = displayGroups.value.reduce((sum, g) => {
      return sum + (g.headerMatch ? 1 : 0) + g.children.length
    }, 0)
    const visibleItems = visibleGroups.value.reduce((sum, g) => {
      return sum + (g.headerMatch ? 1 : 0) + g.children.length
    }, 0)
    
    if (visibleItems < totalItems) {
      renderLimit.value += 20
    }
  },
  { distance: 50 } // Load more when 50px from bottom
)

// Reset limit when searching
watch(inputValue, () => { 
  renderLimit.value = 15 
})

// --------- Read Max Match Per Page -----------
const maxMatchPerPage = computed(() => (options.value as any).MaxMatchPerPage ?? 2) // distinct limit per doc


// --------- Escape HTML Function -----------
// Simple HTML escape to prevent XSS in snippets and breadcrumbs
function escapeHtml(str: string) {
  const start = ENABLE_PROFILING ? getTime() : 0
  const result = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
  if (ENABLE_PROFILING) {
    const elapsed = getTime() - start
    escapeHtmlCallCount++
    escapeHtmlTotalTime += elapsed
    if (currentProfile) {
      currentProfile.escapeHtmlTime = escapeHtmlTotalTime
    }
  }
  return result
}

// --------- Log Moss Results Function -----------
// This function is only called when ENABLE_PROFILING is true
function logMossResults(query: string, startedAt: number, response: SearchResult | unknown) {
  const elapsed = Math.round(((performance?.now?.() ?? Date.now()) - startedAt))
  const docs = Array.isArray((response as any)?.docs) ? (response as any).docs : []
  const table = docs.slice(0, 50).map((doc: any, idx: number) => ({
    '#': idx + 1,
    id: doc?.id ?? 'n/a',
    score: doc?.score ?? doc?.similarity ?? doc?.metadata?.score ?? 'n/a',
    groupId: doc?.metadata?.groupId ?? 'n/a',
    title: doc?.metadata?.title ?? 'n/a',
    text: (() => {
      const t = doc?.text ?? doc?.metadata?.sanitizedText ?? ''
      if (!t) return ''
      return t.length > 120 ? `${t.slice(0, 117)}...` : t
    })()
  }))

  console.groupCollapsed(`[Moss] "${query}" • ${elapsed}ms • ${docs.length} docs`)
  console.info('raw response', response)
  console.table(table)
  console.groupEnd()
}
// -----------------------------------------


// --------- Processing Function for current search query -----------
// Takes raw results and returns ui ready groups and navigation list.
function updateDisplayGroups() {
  const results = rawResults.value
  const q = searchQuery.value.trim()

  // Exit early if no query or no results
  if (!q || results.length === 0) {
    displayGroups.value = []
    flatNavigationList.value = []
    selectedIndex.value = 0
    return
  }

  const processingStart = ENABLE_PROFILING ? getTime() : 0
  if (ENABLE_PROFILING && currentProfile) {
    currentProfile.processingStartTime = processingStart
  }

  status.value = 'processing'

  // 1. Setup Regex to Prepare safe patterns for highlighting the query
  const safeQueryForRegex = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${safeQueryForRegex})`, 'gi')

  // 2. builds a highlighted excerpt around the query, for keyword matching ui
  const generateSnippet = (text: string): string => {
    const snippetStartTime = ENABLE_PROFILING ? getTime() : 0
    if (!text) return ''
    // If text is short, just highlight
    if (text.length <= 150) {
      const result = escapeHtml(text).replace(regex, '<span class="Moss-Match">$&</span>')
      if (ENABLE_PROFILING) {
        const elapsed = getTime() - snippetStartTime
        generateSnippetCallCount++
        generateSnippetTotalTime += elapsed
        if (currentProfile) {
          currentProfile.generateSnippetTime = generateSnippetTotalTime
        }
      }
      return result
    }
    // Optimization: Find index first, THEN slice, THEN regex
    const lowerText = text.toLowerCase()
    const lowerQuery = q.toLowerCase()
    const matchIndex = lowerText.indexOf(lowerQuery)

    if (matchIndex === -1) {
      const result = escapeHtml(text.slice(0, 100)) + '...'
      if (ENABLE_PROFILING) {
        const elapsed = getTime() - snippetStartTime
        generateSnippetCallCount++
        generateSnippetTotalTime += elapsed
        if (currentProfile) {
          currentProfile.generateSnippetTime = generateSnippetTotalTime
        }
      }
      return result
    }

    let start = Math.max(0, matchIndex - 20)
    let end = Math.min(text.length, matchIndex + q.length + 100)
    let snippet = text.slice(start, end)

    if (start > 0) snippet = '...' + snippet
    if (end < text.length) snippet = snippet + '...'

    const result = escapeHtml(snippet).replace(regex, '<span class="Moss-Match">$&</span>')
    if (ENABLE_PROFILING) {
      const elapsed = getTime() - snippetStartTime
      generateSnippetCallCount++
      generateSnippetTotalTime += elapsed
      if (currentProfile) {
        currentProfile.generateSnippetTime = generateSnippetTotalTime
      }
    }
    return result
  }

  // Highlight matches inside breadcrumb text
  const highlightBreadcrumb = (breadcrumb: string): string => {
    const start = ENABLE_PROFILING ? getTime() : 0
    if (!breadcrumb) return ''
    const result = escapeHtml(breadcrumb).replace(regex, '<span class="Moss-Match">$&</span>')
    if (ENABLE_PROFILING) {
      const elapsed = getTime() - start
      highlightBreadcrumbCallCount++
      highlightBreadcrumbTotalTime += elapsed
      if (currentProfile) {
        currentProfile.highlightBreadcrumbTime = highlightBreadcrumbTotalTime
      }
    }
    return result
  }

  // 3. Build ResultItemVMs for each search hit and Groups
  const map = new Map<string, GroupVM>()
  // Track navigation links per group to prevent duplicates
  const navigationLinksPerGroup = new Map<string, Set<string>>()

  results.forEach(item => {
    const meta = item.metadata as unknown as MossMetadata
    const groupId = meta.groupId
    const navigation = meta.navigation || item.id

    // Initialize navigation tracking for this group if needed
    if (!navigationLinksPerGroup.has(groupId)) {
      navigationLinksPerGroup.set(groupId, new Set())
    }
    const usedNavigationLinks = navigationLinksPerGroup.get(groupId)!

    // Skip if this navigation link has already been used in this group
    if (usedNavigationLinks.has(navigation)) {
      return
    }

    // Generate breadcrumb based on type and available metadata
    let breadcrumb = ''
    if (meta.type !== 'page') {
      // Prefer displayBreadcrumb, then title, then type-specific labels
      breadcrumb = meta.displayBreadcrumb || meta.title || (() => {
        switch (meta.type) {
          case 'header': return 'Heading'
          case 'code': return 'Code Block'
          case 'text': return 'Text'
          default: return 'Section'
        }
      })()
    }
    const breadcrumbHtml = breadcrumb ? highlightBreadcrumb(breadcrumb) : ''

    if (!map.has(groupId)) {
      map.set(groupId, {
        title: meta.groupTitle || 'Documentation',
        path: groupId,
        headerMatch: null,
        children: []
      })
    }

    const group = map.get(groupId)!
    // Distinct logic: cap children per group to avoid spam from one doc
    const maxChildren = maxMatchPerPage.value
    if (meta.type !== 'page' && group.children.length >= maxChildren) {
      return
    }
    // Generate highlighted title for page items
    const titleText = meta.groupTitle || meta.title || 'Documentation'
    const titleHtml = highlightBreadcrumb(titleText)

    const vmItem: Partial<ResultItemVM> = {
      id: item.id,
      data: item,
      breadcrumb,
      breadcrumbHtml,
      htmlSnippet: generateSnippet(meta.sanitizedText || item.text || ''),
      titleHtml,
      navigation,
      type: meta.type || 'text'
    }

    if (meta.type === 'page') {
      if (!group.headerMatch) {
        group.headerMatch = vmItem as ResultItemVM
        usedNavigationLinks.add(navigation)
      }
    } else {
      if (group.children.length < maxMatchPerPage.value) {
        group.children.push(vmItem as ResultItemVM)
        usedNavigationLinks.add(navigation)
      }
    }
  })

  // 4. Final Indexing Pass
  let runningIndex = 0
  const groups = Array.from(map.values())
  const navList: Array<{ path: string }> = []

  groups.forEach(group => {
    if (group.headerMatch) {
      group.headerMatch.flatIndex = runningIndex++
      navList.push({ path: group.headerMatch.navigation })
    }
    group.children.forEach(child => {
      child.flatIndex = runningIndex++
      navList.push({ path: child.navigation })
    })
  })

  const processingEnd = ENABLE_PROFILING ? getTime() : 0
  if (ENABLE_PROFILING && currentProfile) {
    currentProfile.processingEndTime = processingEnd
  }

  displayGroups.value = groups
  flatNavigationList.value = navList

  // Reset selectedIndex if it's out of bounds for the new results
  if (selectedIndex.value >= navList.length) {
    selectedIndex.value = Math.max(0, navList.length - 1)
  }

  status.value = 'ready'

  // Wait for next tick to ensure visibleGroups has computed
  if (ENABLE_PROFILING && currentProfile) {
    nextTick(() => {
      const totalEnd = getTime()
      currentProfile!.totalTime = totalEnd - currentProfile!.inputTime
      logProfile()
    })
  }
}

// --------- Get Type Icon Function -----------
// Returns the appropriate icon SVG for each content type
function getTypeIcon(type: 'page' | 'header' | 'text' | 'code') {
  switch (type) {
    case 'page':
      return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>'
    case 'header':
      return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>'
    case 'code':
      return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>'
    case 'text':
    default:
      return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>'
  }
}

// --------- Handle Select Function -----------
// Handles the selection of a search result item
function handleSelect(index: number) {
  // Bounds check to prevent out-of-bounds access
  if (index < 0 || index >= flatNavigationList.value.length) {
    return
  }

  const item = flatNavigationList.value[index]

  if (item?.path) {
    try {
      router.go(item.path)
      emit('close')
    } catch (error) {
      console.error('Navigation failed:', error)
      // Don't close modal if navigation fails
    }
  }
}

// --------- Scroll to Active Item Function -----------
// Scrolls to the active search result item
function scrollToActive() {
  nextTick(() => {
    const activeEl = el.value?.querySelector('.Moss-Item[aria-selected="true"]')
    activeEl?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  })
}

// --------- Initialize Moss Client Function -----------
// Initializes the Moss client and starts loading the search index in the background
// The client can handle queries immediately - it will use cloud fallback until local index is ready
async function initMoss() {
  if (mossClient.value || initPromise) return initPromise
  status.value = 'initializing'
  initPromise = (async () => {
    try {
      const { MossClient } = await import('@inferedge/moss')
      const client = new MossClient((options.value as any).projectId, (options.value as any).projectKey)
      const indexName = (options.value as any).indexName

      // Make client available immediately for queries (will use cloud fallback)
      mossClient.value = client
      status.value = 'ready'

      // Load index in background - queries will automatically switch to local once ready
      if (ENABLE_PROFILING) {
        const loadStart = performance?.now?.() ?? Date.now()
        client.loadIndex(indexName).then(() => {
          const loadTime = Math.round(((performance?.now?.() ?? Date.now()) - loadStart))
          console.log(`[Moss] ✓ Local index loaded successfully in ${loadTime}ms - queries will now run locally`)
        }).catch(e => {
          console.warn('[Moss] Failed to load local index, will continue using cloud fallback:', e)
        })
      } else {
        client.loadIndex(indexName).catch(() => {
          // Silently fall back to cloud if local index fails to load
        })
      }
    } catch (e) {
      status.value = 'error'
      console.error('Failed to initialize Moss client:', e)
      errorMessage.value = `Failed to initialize search: ${e instanceof Error ? e.message : String(e)}`
      initPromise = null
      throw e
    }
  })()
  return initPromise
}

// --------- Perform Search Function -----------
// Triggered by Debounce
// Performs the search and updates the UI
const performSearch = async (q: string) => {
  const currentQuery = q.trim()
  if (!currentQuery) {
    rawResults.value = []
    displayGroups.value = []
    flatNavigationList.value = []
    selectedIndex.value = 0
    status.value = 'ready'
    return
  }

  const token = ++lastQueryToken
  try {
    if (!mossClient.value) await initMoss()
  } catch { return }

  try {
    status.value = 'searching'
    const searchStart = getTime()
    if (ENABLE_PROFILING) {
      // Use existing profile if it exists (created in onInput)
      if (!currentProfile) {
        currentProfile = {
          query: currentQuery,
          inputTime: searchStart,
          searchStartTime: searchStart,
          searchEndTime: 0,
          processingStartTime: 0,
          processingEndTime: 0,
          escapeHtmlTime: 0,
          generateSnippetTime: 0,
          highlightBreadcrumbTime: 0,
          visibleGroupsTime: 0,
          totalTime: 0
        }
      } else {
        currentProfile.searchStartTime = searchStart
        currentProfile.query = currentQuery
      }
    }
    
    const topk = (options.value as any).topk ?? 20 // Can likely increase this now
    const response = (await mossClient.value.query((options.value as any).indexName, currentQuery, topk)) as SearchResult
    
    if (token !== lastQueryToken || currentQuery !== searchQuery.value.trim()) return
    
    const searchEnd = getTime()
    if (ENABLE_PROFILING && currentProfile) {
      currentProfile.searchEndTime = searchEnd
    }
    
    // Set raw results, then trigger the Async Processor
    rawResults.value = Array.isArray(response?.docs) ? response.docs : []
    if (ENABLE_PROFILING) {
      logMossResults(currentQuery, searchStart, response)
    }
    updateDisplayGroups() // <--- Trigger the non-blocking processor
    
    selectedIndex.value = 0
  } catch (e) {
    status.value = 'error'
    errorMessage.value = 'Search failed.'
    if (ENABLE_PROFILING) {
      currentProfile = null
    }
  }
}

// --------- On Input Function -----------
// Handles the input event of the search input
// Calls performSearch directly - cancellation tokens prevent overlapping work
function onInput() {
  const q = inputValue.value
  
  // Track input time for profiling
  const inputTime = ENABLE_PROFILING ? getTime() : 0
  
  // Update the query state immediately
  searchQuery.value = q
  
  // Initialize profile for this search
  if (ENABLE_PROFILING) {
    currentProfile = {
      query: q,
      inputTime: inputTime,
      searchStartTime: 0,
      searchEndTime: 0,
      processingStartTime: 0,
      processingEndTime: 0,
      escapeHtmlTime: 0,
      generateSnippetTime: 0,
      highlightBreadcrumbTime: 0,
      visibleGroupsTime: 0,
      totalTime: 0
    }
  }
  
  // Run search immediately - no debounce needed due to cancellation tokens
  performSearch(q)
}

// --------- Clear Search Function -----------
// Clears the search input and resets the UI
function clearSearch() {
  inputValue.value = ''
  searchQuery.value = ''
  rawResults.value = []
  displayGroups.value = []
  flatNavigationList.value = []
  selectedIndex.value = 0
  status.value = 'ready'
}

// --------- Watchers -----------
// Watches the open state of the search box and activates/deactivates the focus trap
const { activate, deactivate } = useFocusTrap(el, { immediate: false, escapeDeactivates: false })
const isLocked = useScrollLock(typeof window !== 'undefined' ? document.body : null)

// --------- Open State Watcher -----------
// Watches the open state of the search box and activates/deactivates the focus trap
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    isLocked.value = true
    nextTick(() => { activate(); searchInput.value?.focus() })
  } else {
    isLocked.value = false
    deactivate()
    clearSearch()
    status.value = 'idle'
  }
})

// --------- On Mounted Function -----------
// Initializes the Moss client and loads the search index
onMounted(() => { isMounted.value = true; initMoss().catch(() => {}) })
onBeforeUnmount(() => { 
  isLocked.value = false
  deactivate()
  clearSpinnerTimers()
})

// --------- On Key Stroke Function -----------
// Handles the key stroke event of the search input
onKeyStroke('Escape', () => emit('close'))

// --------- On Arrow Up Function -----------
// Handles the arrow up event of the search input
onKeyStroke('ArrowUp', (e) => {
  if (!props.open) return
  e.preventDefault()
  selectedIndex.value = Math.max(0, selectedIndex.value - 1)
  scrollToActive()
})

// --------- On Arrow Down Function -----------
// Handles the arrow down event of the search input
onKeyStroke('ArrowDown', (e) => {
  if (!props.open) return
  e.preventDefault()
  const maxIndex = Math.max(0, flatNavigationList.value.length - 1)
  selectedIndex.value = Math.min(maxIndex, selectedIndex.value + 1)
  scrollToActive()
})

// --------- On Enter Function -----------
// Handles the enter event of the search input
onKeyStroke('Enter', (e) => {
  if (!props.open) return
  e.preventDefault()
  handleSelect(selectedIndex.value)
})
</script>
  
  <template>
    <Teleport to="body">
      <div v-if="open && isMounted" ref="el" class="Moss-Container" role="dialog" aria-modal="true">
        <div class="Moss-Backdrop" @click="$emit('close')" />
        <div class="Moss-Modal">
          
          <header class="Moss-Header">
            <form class="Moss-Form" @submit.prevent>
              <label class="Moss-MagnifierLabel" for="moss-search-input">
                <svg v-if="isSpinnerVisible" width="20" height="20" class="Moss-Spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke-width="4" stroke-opacity="0.3"></circle><path d="M12 2C6.48 2 2 6.48 2 12" stroke-width="4" stroke-linecap="round"></path></svg>
                <svg v-else width="20" height="20" class="Moss-SearchIcon" viewBox="0 0 20 20"><path d="M14.386 14.386l4.0877 4.0877-4.0877-4.0877c-2.9418 2.9419-7.7115 2.9419-10.6533 0-2.9419-2.9418-2.9419-7.7115 0-10.6533 2.9418-2.9419 7.7115-2.9419 10.6533 0 2.9419 2.9418 2.9419 7.7115 0 10.6533z" stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg>
              </label>
              <input id="moss-search-input" ref="searchInput" v-model="inputValue" @input="onInput" class="Moss-Input" placeholder="Ask me anything..." autocomplete="off" />
              <div class="Moss-Controls">
                <button v-if="inputValue" class="Moss-Reset" type="button" @click="clearSearch"><svg width="18" height="18" viewBox="0 0 20 20"><path d="M10 10l5.09-5.09L10 10l5.09 5.09L10 10zm0 0L4.91 4.91 10 10l-5.09 5.09L10 10z" stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>
                <button v-else class="Moss-Cancel" type="button" @click="$emit('close')">Esc</button>
              </div>
            </form>
          </header>
  
          <div class="Moss-Dropdown" ref="dropdownEl">
            <div v-if="status === 'error'" class="Moss-State error">{{ errorMessage }}</div>
            <div v-else-if="inputValue.trim() && flatNavigationList.length === 0 && status === 'ready' && inputValue === searchQuery" class="Moss-State">No results for "<span class="q-text">{{ inputValue }}</span>"</div>

            <div class="Moss-Results" v-if="flatNavigationList.length > 0">
              <div v-for="group in visibleGroups" :key="group.path" class="Moss-Group">
                
                <div 
                  v-if="group.headerMatch"
                  class="Moss-Item Moss-PageHeader"
                  :aria-selected="selectedIndex === group.headerMatch.flatIndex"
                  @click="handleSelect(group.headerMatch.flatIndex)"
                  @mouseenter="selectedIndex = group.headerMatch.flatIndex"
                >
                  <div class="Moss-IconContainer">
                     <span v-html="getTypeIcon(group.headerMatch?.type || 'page')"></span>
                  </div>
                  <div class="Moss-Content">
                    <div class="Moss-Title" v-html="group.headerMatch?.titleHtml || group.title"></div>
                  </div>
                </div>
                <div v-if="group.children.length > 0" class="Moss-Children">
                  <div 
                    v-for="child in group.children" 
                    :key="child.id"
                    class="Moss-Item Moss-ChildItem"
                    :class="`Moss-Item--${child.type}`"
                    :aria-selected="selectedIndex === child.flatIndex"
                    @click="handleSelect(child.flatIndex)"
                    @mouseenter="selectedIndex = child.flatIndex"
                  >
                    <div class="Moss-IconContainer mini">
                       <span v-html="getTypeIcon(child.type || 'text')"></span>
                    </div>
                    <div class="Moss-Content">
                      <div v-if="child.breadcrumb" class="Moss-Breadcrumb" v-html="child.breadcrumbHtml || child.breadcrumb"></div>
                      <div class="Moss-Text" v-html="child.htmlSnippet"></div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
          
          <footer class="Moss-Footer">
            <ul class="Moss-Commands">
              <li><kbd class="Moss-Key">↵</kbd><span class="Moss-Label">select</span></li>
              <li><kbd class="Moss-Key">↓</kbd><kbd class="Moss-Key">↑</kbd><span class="Moss-Label">navigate</span></li>
              <li><kbd class="Moss-Key">esc</kbd><span class="Moss-Label">close</span></li>
            </ul>
            <div class="Moss-Logo"><span>Search by</span><div class="MossBrand-Container"><img :src="mossLogo" alt="InferEdge Moss logo" class="MossBrand-Logo" /><span class="MossBrand-Text">Moss</span></div></div>
          </footer>
        </div>
      </div>
    </Teleport>
  </template>
  
  <style scoped>
  /* --- Core Variables --- */
  .Moss-Container {
    --moss-modal-bg: var(--vp-c-bg);
    --moss-modal-width: 750px;
    --moss-primary: var(--vp-c-brand-1);
    --moss-text-primary: var(--vp-c-text-1);
    --moss-text-muted: var(--vp-c-text-2);
    --moss-border: var(--vp-c-divider);
    --moss-bg-soft: var(--vp-c-bg-soft);
    --moss-selection-bg: var(--vp-c-brand-1);
    --moss-key-bg: var(--vp-c-bg-alt);
    --moss-key-border: var(--vp-c-divider);
  }
  
  .dark .Moss-Container {
      --moss-bg-soft: #1e1e20;
  }
  
  /* --- Layout --- */
  .Moss-Container { position: fixed; inset: 0; z-index: 100; display: flex; align-items: flex-start; padding-top: 10vh; justify-content: center; font-family: var(--vp-font-family-base, sans-serif); font-size: 15px; }
  .Moss-Backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); }
.Moss-Modal { position: relative; width: 100%; max-width: var(--moss-modal-width); background: var(--moss-modal-bg); border-radius: 12px; display: flex; flex-direction: column; max-height: 70vh; overflow: hidden; box-shadow: 0 20px 60px -10px rgba(0,0,0,0.4); border: 1px solid var(--moss-border); overscroll-behavior: contain; }
  
  /* --- Header --- */
  .Moss-Header { padding: 12px 12px 0; }
  .Moss-Form { display: flex; align-items: center; padding: 0 12px; height: 50px; }
  .Moss-Input { flex: 1; background: transparent; border: none; outline: none; color: var(--moss-text-primary); font-size: 1.1em; margin-left: 12px; height: 100%; }
  .Moss-SearchIcon, .Moss-Spinner { color: var(--moss-text-muted); flex-shrink: 0; }
  .Moss-Spinner { animation: moss-spin 1s linear infinite; }
  @keyframes moss-spin { to { transform: rotate(360deg); } }
  
  .Moss-Cancel {
  background: var(--moss-key-bg);
  border: 1px solid var(--moss-key-border);
  border-radius: 4px;
  padding: 2px 6px;
  font-family: inherit;
  font-size: 0.8em;
  color: var(--moss-text-muted);
  cursor: pointer;
  box-shadow: 0 1px 0 var(--moss-key-border);
  }
  
  .Moss-Reset {
  background: transparent;
  border: none;
  color: var(--moss-text-muted);
  cursor: pointer;
  padding: 0;
  display: flex;
  }
  
  /* --- Results Area --- */
.Moss-Dropdown { 
  flex: 1; 
  overflow-y: auto; 
  padding: 0 12px 12px; 
  scroll-behavior: smooth; 
  overscroll-behavior: contain;
  /* CSS Optimization: Helps browser separate scroll layer */
  will-change: scroll-position; 
}
  .Moss-Group { 
    margin-bottom: 12px; 
    background: var(--moss-bg-soft); 
    border-radius: 8px; 
    overflow: hidden; 
    border: 1px solid var(--moss-border);
    /* CSS Optimization: Prevents layout shifts and speeds up rendering */
    content-visibility: auto; 
    contain-intrinsic-size: 50px; /* Estimate height of a group header */
  }
  
  .Moss-Item { display: flex; align-items: center; padding: 12px; cursor: pointer; transition: all 0.1s; border-left: 4px solid transparent; }
  .Moss-Item[aria-selected="true"] { background: var(--moss-selection-bg); }
  .Moss-Item[aria-selected="true"] * { color: #fff !important; }
  
  /* Page Header (Parent) */
  .Moss-PageHeader { background: transparent; border-bottom: none; }
.Moss-PageHeader--label { cursor: default; }
.Moss-PageHeader--label:hover { background: transparent; }
  .Moss-PageHeader .Moss-Title { font-weight: 600; font-size: 0.85rem; color: var(--moss-text-primary); }
  .Moss-PageHeader .Moss-IconContainer { color: var(--moss-text-primary); }
.Moss-PageHeader.Moss-PageHeader--label .Moss-Title { color: var(--moss-text-muted); font-size: 0.85rem; }
.Moss-PageHeader.Moss-PageHeader--label .Moss-IconContainer { color: var(--moss-text-muted); }
  
  /* Children (Tree Items) */
  .Moss-Children { padding: 0; background: transparent; }
  .Moss-ChildItem { position: relative; padding-top: 6px; padding-bottom: 6px; }
  
  /* Type-specific styling for visual distinction */
  .Moss-Item--header .Moss-IconContainer { color: var(--moss-primary); }
  .Moss-Item--code .Moss-IconContainer { color: #e06c75; }
  .Moss-Item--text .Moss-IconContainer { color: var(--moss-text-muted); }
  .Moss-Item--page .Moss-IconContainer { color: var(--moss-text-primary); }
  
  .Moss-Item[aria-selected="true"] .Moss-IconContainer { color: #fff !important; }
  
  .Moss-IconContainer { width: 24px; margin-right: 12px; display: flex; justify-content: center; align-items: center; }
  .Moss-IconContainer.mini { width: 24px; margin-right: 8px; opacity: 0.6; }
  
  .Moss-Breadcrumb { font-weight: 600; font-size: 0.85rem; margin-bottom: 2px; color: var(--moss-text-primary); }
.Moss-Breadcrumb--page { margin-top: 2px; }
  .Moss-Text { font-size: 0.8rem; color: var(--moss-text-muted); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-top: 2px; }
  
/* Highlighting */
:deep(.Moss-Match) { color: var(--moss-primary); font-weight: 700; background: none; padding: 0; text-decoration: underline; text-decoration-color: var(--moss-primary); text-decoration-thickness: 2px; text-underline-offset: 2px; }
.Moss-Item[aria-selected="true"] :deep(.Moss-Match) { color: #fff; text-decoration-color: #fff; }
  
  /* --- Footer --- */
  .Moss-Footer { padding: 0 16px; height: 44px; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--moss-border); background: var(--moss-modal-bg); color: var(--moss-text-muted); font-size: 0.8em; }
  .Moss-Commands { display: flex; gap: 12px; }
  .Moss-Key { background: var(--moss-key-bg); border: 1px solid var(--moss-key-border); border-radius: 4px; padding: 2px 5px; font-family: inherit; font-size: 0.9em; min-width: 18px; text-align: center; margin-right: 4px; box-shadow: 0 1px 0 var(--moss-key-border); }
  .Moss-Logo { display: flex; align-items: center; }
  .MossBrand-Container { display: flex; align-items: center; gap: 4px; margin-left: 6px; }
  .MossBrand-Logo { height: 14px; }
  .MossBrand-Text { font-weight: 700; color: var(--moss-primary); }
  </style>