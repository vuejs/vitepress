import { inBrowser } from '../../shared'
import { ref } from 'vue'

const hashRef = ref(inBrowser ? location.hash : '')

if (inBrowser) {
  window.addEventListener('hashchange', () => {
    hashRef.value = location.hash
  })
}

export { hashRef }
