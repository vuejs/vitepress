import { inBrowser, onContentUpdated } from 'vitepress'

export function useCodeGroups() {
  if (import.meta.env.DEV) {
    onContentUpdated(() => {
      document.querySelectorAll('.vp-code-group > .blocks').forEach((el) => {
        Array.from(el.children).forEach((child) => {
          child.classList.remove('active')
        })
        el.children[0].classList.add('active')
      })
    })
  }

  if (inBrowser) {
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
        next.classList.add('active')

        const label = group?.querySelector(`label[for="${el.id}"]`)
        label?.scrollIntoView({ block: 'nearest' })

        // Sync other groups with same group-name
        const groupName = group.getAttribute('data-group-name')
        if (groupName) {
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
