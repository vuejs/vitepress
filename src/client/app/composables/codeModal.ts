import { inBrowser } from 'vitepress'

export function useCodeModal() {
  if (inBrowser) {
    window.addEventListener('click', (e) => {
      const el = e.target as HTMLElement

      if (el.matches('div[class*="language-"] > button.modal')) {
        //remove focus from button
        el.blur()

        const parent = el.parentElement
        const sibling = el.nextElementSibling
        if (!parent || !sibling) {
          return
        }

        sibling.classList.add('open')
      }

      if (
        el.matches('div[class*="language-"] div.modal-container button.close')
      ) {
        const parent = el.parentElement?.parentElement
        if (!parent) {
          return
        }

        parent.classList.remove('open')
      }

      if (el.matches('div[class*="language-"] > div.modal-container')) {
        el.classList.remove('open')
      }
    })

    window.addEventListener('keydown', (ev) => {
      if (ev.key == 'Escape') {
        let modal = window.document.querySelector(
          'div[class*="language-"] > div.modal-container.open'
        )

        if (!modal) {
          return
        }

        modal.classList.remove('open')
      }
    })
  }
}
