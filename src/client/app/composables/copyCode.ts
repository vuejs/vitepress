import { inBrowser } from 'vitepress'
import { isShell } from '../../shared'

const ignoredNodes = ['.vp-copy-ignore', '.diff.remove'].join(', ')

export function useCopyCode() {
  if (inBrowser) {
    const timeoutIdMap: WeakMap<HTMLElement, NodeJS.Timeout> = new WeakMap()
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

        copyToClipboard(text).then(() => {
          el.classList.add('copied')
          clearTimeout(timeoutIdMap.get(el))
          const timeoutId = setTimeout(() => {
            el.classList.remove('copied')
            el.blur()
            timeoutIdMap.delete(el)
          }, 2000)
          timeoutIdMap.set(el, timeoutId)
        })
      }
    })
  }
}

async function copyToClipboard(text: string) {
  try {
    return navigator.clipboard.writeText(text)
  } catch {
    const element = document.createElement('textarea')
    const previouslyFocusedElement = document.activeElement

    element.value = text

    // Prevent keyboard from showing on mobile
    element.setAttribute('readonly', '')

    element.style.contain = 'strict'
    element.style.position = 'absolute'
    element.style.left = '-9999px'
    element.style.fontSize = '12pt' // Prevent zooming on iOS

    const selection = document.getSelection()
    const originalRange = selection
      ? selection.rangeCount > 0 && selection.getRangeAt(0)
      : null

    document.body.appendChild(element)
    element.select()

    // Explicit selection workaround for iOS
    element.selectionStart = 0
    element.selectionEnd = text.length

    document.execCommand('copy')
    document.body.removeChild(element)

    if (originalRange) {
      selection!.removeAllRanges() // originalRange can't be truthy when selection is falsy
      selection!.addRange(originalRange)
    }

    // Get the focus back on the previously focused element, if any
    if (previouslyFocusedElement) {
      ;(previouslyFocusedElement as HTMLElement).focus()
    }
  }
}
