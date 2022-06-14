import { nextTick, watch } from 'vue'
import { inBrowser, useData } from 'vitepress'

let copyToClipboard: (text: string) => Promise<void>

if (navigator.clipboard) {
  copyToClipboard = (text: string) => navigator.clipboard.writeText(text)
} else {
  copyToClipboard = async (text: string) => {
    const tmp = document.createElement('TEXTAREA') as HTMLTextAreaElement
    const activeElement = document.activeElement as HTMLElement
    
    tmp.value = text
    document.body.appendChild(tmp)
    tmp.select()
    document.execCommand('copy')
    document.body.removeChild(tmp)
    
    activeElement?.focus()
  }
}

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

    copyToClipboard(text).then(() => {
      el.classList.add('copied')
      setTimeout(() => {
        el.classList.remove('copied')
      }, 3000)
    })
  }
}
