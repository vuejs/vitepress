import { inBrowser, onContentUpdated } from 'vitepress'

export function useCodeGroups() {
  if (import.meta.env.DEV) {
    onContentUpdated(() => {
      document.querySelectorAll('.vp-code-group > .blocks').forEach((el) => {
        Array.from(el.children).forEach((child) => {
          child.classList.remove('active')
        })
        el.querySelector('div[class^="language"]')?.classList.add('active')
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

        const codeBlocks = group.querySelectorAll(
          '.blocks > div[class^="language"]'
        )
        if (!codeBlocks) return

        const activeBlock = Array.from(codeBlocks).find((block) =>
          block.classList.contains('active')
        )
        if (!activeBlock) return

        const nextBlock = codeBlocks[i]
        if (!nextBlock || activeBlock === nextBlock) return

        activeBlock.classList.remove('active')
        nextBlock.classList.add('active')

        const label = group?.querySelector(`label[for="${el.id}"]`)
        label?.scrollIntoView({ block: 'nearest' })
      }
    })
  }
}
