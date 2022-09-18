import { inBrowser } from '../utils.js'

export function useCodeGroup() {
  if (inBrowser) {
    window.addEventListener('click', (e) => {
      const el = e.target as HTMLElement
      if (el.matches('.code-group>.tabs-header>button')) {
        const codeblocks =
          el.parentElement!.parentElement!.querySelectorAll('.code-block')
        const buttons =
          el.parentElement!.parentElement!.querySelectorAll('button')
        const index = parseInt(el.getAttribute('tab-index')!)
        codeblocks.forEach((ele) => ele.classList.remove('active'))
        buttons.forEach((ele) => ele.classList.remove('active'))
        el.classList.add('active')
        codeblocks[index].classList.add('active')
      }
    })
  }
}
