import { nextTick, watch } from 'vue'
import { inBrowser, useData } from 'vitepress'

export function useCopyCode() {
  const { page } = useData()

  if (inBrowser)
    watch(
      () => page.value.relativePath,
      () => {
        nextTick(() => {
          document
            .querySelectorAll<HTMLSpanElement>(
              '.vp-doc div[class*="language-"]>span.copy'
            )
            .forEach(handleElement)
        })
      },
      { immediate: true, flush: 'post' }
    )
}

function handleElement(el: HTMLElement) {
  el.onclick = () => {
    const parent = el.parentElement

    if (!parent) {
      return
    }

    const isShell =
      parent.classList.contains('language-sh') ||
      parent.classList.contains('language-bash')

    let { innerText: text = '' } = parent

    if (isShell) {
      text = text.replace(/^ *\$ /gm, '')
    }

    navigator.clipboard.writeText(text).then(() => {
      el.classList.add('copied')
      setTimeout(() => {
        el.classList.remove('copied')
      }, 3000)
    })
  }
}
