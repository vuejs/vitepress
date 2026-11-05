import { inBrowser } from 'vitepress'

import { isShell } from '../../shared'

const ignoredNodes = ['.vp-copy-ignore', '.diff.remove'].join(', ')

export function useCopyCode() {
  if (inBrowser) {
    const timeoutIdMap: WeakMap<HTMLElement, number> = new WeakMap()
    window.addEventListener('click', (e) => {
      const el = e.target as HTMLElement
      if (el.matches('div[class*="language-"] > button.copy')) {
        const parent = el.parentElement
        const sibling = el.nextElementSibling?.nextElementSibling // <pre> tag
        if (!parent || !sibling) {
          return
        }

        // Clone the node and remove the ignored nodes
        const clone = sibling.cloneNode(true) as HTMLElement
        clone.querySelectorAll(ignoredNodes).forEach((node) => node.remove())
        // remove extra newlines left after removing ignored nodes (affecting textContent because it is inside `<pre>`)
        // doesn't affect the newlines already in the code because they are rendered as `\n<span class="line"></span>`
        clone.innerHTML = clone.innerHTML.replace(/\n+/g, '\n')

        let text = clone.textContent || ''

        // NOTE: Any changes to this the code here may also need to update
        // `transformerDisableShellSymbolSelect` in `src/node/markdown/plugins/highlight.ts`
        const lang = /language-(\w+)/.exec(parent.className)?.[1] || ''
        if (isShell(lang)) {
          text = text.replace(/^ *(\$|>) /gm, '').trim()
        }

        clearTimeout(timeoutIdMap.get(el))
        timeoutIdMap.delete(el)
        el.classList.remove('copied')
        copyToClipboard(text)
          .then(() => {
            el.classList.add('copied')
            clearTimeout(timeoutIdMap.get(el))
            const timeoutId = window.setTimeout(() => {
              el.classList.remove('copied')
              el.blur()
              timeoutIdMap.delete(el)
            }, 2000)
            timeoutIdMap.set(el, timeoutId)
          })
          .catch(() => {
            // Leave the code selected for a manual copy when both methods fail.
            window.getSelection()?.selectAllChildren(sibling)
          })
      }
    })
  }
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const element = document.createElement('textarea')
    const previouslyFocusedElement = document.activeElement

    element.value = text

    // Prevent keyboard from showing on mobile
    element.setAttribute('readonly', '')

    element.style.contain = 'strict'
    element.style.position = 'absolute'
    element.style.insetInlineStart = '-9999px'
    element.style.fontSize = '12pt' // Prevent zooming on iOS

    const selection = document.getSelection()
    const originalRanges = Array.from(
      { length: selection?.rangeCount ?? 0 },
      (_, index) => selection!.getRangeAt(index).cloneRange()
    )

    try {
      document.body.appendChild(element)
      element.select()

      // Explicit selection workaround for iOS
      element.selectionStart = 0
      element.selectionEnd = text.length

      const ok = document.execCommand('copy')
      if (!ok) throw new Error('execCommand copy failed')
    } finally {
      element.remove()

      // Restore focus before selection: focusing may change the selection.
      if (previouslyFocusedElement instanceof HTMLElement) {
        previouslyFocusedElement.focus({ preventScroll: true })
      }

      selection?.removeAllRanges()
      for (const range of originalRanges) selection?.addRange(range)
    }
  }
}
