import { inBrowser, onContentUpdated } from 'vitepress'

const STORAGE_KEY = 'vitepress:tabsCache'

function getStoredTabIndex(groupName: string): number | null {
  if (!inBrowser) return null
  try {
    const cache = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return cache[groupName] ?? null
  } catch {
    return null
  }
}

function setStoredTabIndex(groupName: string, index: number) {
  if (!inBrowser) return
  try {
    const cache = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    cache[groupName] = index
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache))
  } catch {
    // Silently ignore localStorage errors
  }
}

export function useCodeGroups() {
  if (import.meta.env.DEV) {
    onContentUpdated(() => {
      document.querySelectorAll('.vp-code-group > .blocks').forEach((el) => {
        const group = el.closest('.vp-code-group')
        const groupName = group?.getAttribute('data-group-name')

        // Don't reset if user has a saved preference
        if (groupName && getStoredTabIndex(groupName) !== null) {
          return // Keep user's preference
        }

        // Only reset groups without saved preferences
        Array.from(el.children).forEach((child) => {
          child.classList.remove('active')
        })
        activate(el.children[0])
      })
    })
  }

  if (inBrowser) {
    // Restore tabs from localStorage on page load, but only on first content load
    let hasRestoredTabs = false
    onContentUpdated(() => {
      if (hasRestoredTabs) return
      hasRestoredTabs = true

      document
        .querySelectorAll('.vp-code-group[data-group-name]')
        .forEach((group) => {
          const groupName = group.getAttribute('data-group-name')
          if (!groupName) return

          const storedIndex = getStoredTabIndex(groupName)
          if (storedIndex === null) return

          const inputs = group.querySelectorAll('input')
          const blocks = group.querySelector('.blocks')
          if (!blocks || !inputs[storedIndex]) return

          // Update radio input
          inputs[storedIndex].checked = true

          // Update active block
          const currentActive = blocks.querySelector('.active')
          const newActive = blocks.children[storedIndex]
          if (currentActive && newActive && currentActive !== newActive) {
            currentActive.classList.remove('active')
            newActive.classList.add('active')
          }
        })
    })

    window.addEventListener('click', (e) => {
      const el = e.target as HTMLInputElement

      if (el.matches('.vp-code-group input')) {
        // input <- .tabs <- .vp-code-group
        const group = el.parentElement?.parentElement
        if (!group) return

        const i = Array.from(group.querySelectorAll('input')).indexOf(el)
        if (i < 0) return

        // Update current group
        const blocks = group.querySelector('.blocks')
        if (!blocks) return

        const current = Array.from(blocks.children).find((child) =>
          child.classList.contains('active')
        )
        if (!current) return

        const next = blocks.children[i]
        if (!next || current === next) return

        current.classList.remove('active')
        activate(next)

        const label = group?.querySelector(`label[for="${el.id}"]`)
        label?.scrollIntoView({ block: 'nearest' })

        // Sync other groups with same group-name and save to localStorage
        const groupName = group.getAttribute('data-group-name')
        if (groupName) {
          setStoredTabIndex(groupName, i)
          syncTabsInOtherGroups(groupName, i, group as HTMLElement)
        }
      }
    })
  }
}

function syncTabsInOtherGroups(
  groupName: string,
  tabIndex: number,
  currentGroup: HTMLElement
) {
  // Find all code groups with the same group-name
  const groups = document.querySelectorAll(
    `.vp-code-group[data-group-name="${groupName}"]`
  )

  groups.forEach((g) => {
    // Skip the current group that was clicked
    if (g === currentGroup) return

    const inputs = g.querySelectorAll('input')
    const blocks = g.querySelector('.blocks')
    if (!blocks || !inputs[tabIndex]) return

    // Update radio input
    inputs[tabIndex].checked = true

    // Update active block
    const currentActive = blocks.querySelector('.active')
    const newActive = blocks.children[tabIndex]
    if (currentActive && newActive && currentActive !== newActive) {
      currentActive.classList.remove('active')
      newActive.classList.add('active')
    }
  })
}

function activate(el: Element): void {
  el.classList.add('active')
  window.dispatchEvent(
    new CustomEvent('vitepress:codeGroupTabActivate', { detail: el })
  )
}
