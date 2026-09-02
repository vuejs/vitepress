import { defineComponent, h } from 'vue'

import { withBase } from '../utils'

/**
 * The not-found page content of a site whose theme provides none. Same
 * shape as the default theme's, so a theme can style it the same way.
 */
export const NotFound = defineComponent({
  name: 'VitePressNotFound',
  setup() {
    return () =>
      h('div', { class: 'vp-not-found' }, [
        h('p', { class: 'code' }, '404'),
        h('h1', { class: 'title' }, 'Page not found'),
        h('a', { class: 'link', href: withBase('/') }, 'Take me home')
      ])
  }
})
