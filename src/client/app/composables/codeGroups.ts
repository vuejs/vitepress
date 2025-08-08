import { inBrowser, onContentUpdated } from 'vitepress'

const SCROLL_OPTIONS: ScrollIntoViewOptions = { block: 'nearest' }
const codeGroupCache = new Map<string, HTMLElement[]>()

export function useCodeGroups() {
  if (import.meta.env.DEV) {
    onContentUpdated(() => {
      clearCache()

      document.querySelectorAll('.vp-code-group > .blocks').forEach((el) => {
        Array.from(el.children).forEach((child) => {
          child.classList.remove('active')
        })
        el.children[0].classList.add('active')
      })

      handleQueryParamNavigation()
    })
  }

  if (inBrowser) {
    const handleUrlChange = () => {
      handleQueryParamNavigation()
    }

    handleQueryParamNavigation()

    window.addEventListener('popstate', handleUrlChange)

    window.addEventListener('click', (e) => {
      const el = e.target as HTMLInputElement

      if (el.matches('.vp-code-group input')) {
        const group = el.parentElement?.parentElement
        if (!group) return

        const label = group?.querySelector(`label[for="${el.id}"]`)
        if (!label) return

        // Activate the clicked tab
        if (!activateTab(group, el)) return

        label.scrollIntoView({ block: 'nearest' })

        // Get the group key and tab title for URL update and sync
        const groupKey = group.getAttribute('data-group-key')
        const tabTitle = label.getAttribute('data-title')?.toLowerCase()

        if (groupKey && tabTitle) {
          // Synchronize all other code groups with the same key
          syncCodeGroupsByKeyAndValue(groupKey, tabTitle, group)

          // Update URL query parameter with key=value format
          updateUrl(groupKey, tabTitle)
        }
      }
    })
  }
}

function getCodeGroupsByKey(groupKey: string): HTMLElement[] {
  if (!codeGroupCache.has(groupKey)) {
    codeGroupCache.set(
      groupKey,
      Array.from(
        document.querySelectorAll(
          `.vp-code-group[data-group-key="${groupKey}"]`
        )
      )
    )
  }
  return codeGroupCache.get(groupKey) || []
}

function clearCache() {
  codeGroupCache.clear()
}

function activateTab(group: HTMLElement, input: HTMLInputElement): boolean {
  const inputs = Array.from(
    group.querySelectorAll('input')
  ) as HTMLInputElement[]
  const index = inputs.indexOf(input)
  if (index < 0) return false

  const blocks = group.querySelector('.blocks')
  if (!blocks) return false

  // Remove active class from all blocks and add to the target block
  Array.from(blocks.children).forEach((child, i) => {
    child.classList.toggle('active', i === index)
  })

  return true
}

function findTabByTitle(
  group: HTMLElement,
  tabTitle: string
): HTMLInputElement | null {
  if (!tabTitle) return null
  const labels = Array.from(group.querySelectorAll('label[data-title]'))
  const targetLabel = labels.find(
    (label) =>
      label.getAttribute('data-title')?.toLowerCase() === tabTitle.toLowerCase()
  )

  if (!targetLabel) return null

  const inputId = targetLabel.getAttribute('for')
  if (!inputId) return null

  return group.querySelector(`#${inputId}`)
}

function syncCodeGroupsByKeyAndValue(
  groupKey: string,
  tabValue: string,
  excludeGroup?: HTMLElement
) {
  const groups = getCodeGroupsByKey(groupKey)

  groups.forEach((group) => {
    // Skip the group that was just clicked
    if (excludeGroup && group === excludeGroup) return

    const input = findTabByTitle(group, tabValue)
    if (input) {
      activateTab(group, input)
    }
  })
}

function updateUrl(groupKey: string, tabValue: string) {
  const url = new URL(window.location.href)
  url.searchParams.set(groupKey, tabValue)
  window.history.replaceState(null, '', url.toString())
}

function handleQueryParamNavigation() {
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.size === 0) return

  const matches: HTMLElement[] = []

  for (const [groupKey, tabValue] of urlParams.entries()) {
    const groups = getCodeGroupsByKey(groupKey)

    for (const group of groups) {
      const input = findTabByTitle(group, tabValue)
      if (input && activateTab(group, input)) {
        matches.push(group)
      }
    }
  }

  // Scroll to the first matching group
  if (matches.length > 0) {
    const firstMatchGroup = matches[0]
    const firstLabel = firstMatchGroup.querySelector('label[data-title]')
    firstLabel?.scrollIntoView(SCROLL_OPTIONS)
  }
}
