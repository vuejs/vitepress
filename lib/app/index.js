import { createApp, ref, provide, h } from 'vue'
import { Layout } from '/@theme/index.js'

const app = createApp({
  setup() {
    const path = ref(window.location.pathname)

    // window.addEventListener('click', e => {
    //   if (e.target.tagName === 'A') {
    //     e.preventDefault()
    //     if (e.target.href && e.target.href.indexOf(location.host)) {
    //       history.pushState(null, '', e.target.href)
    //     }
    //   }
    // })

    provide('vitepress:path', path)

    return () => h(Layout)
  }
})

app.mount('#app')
