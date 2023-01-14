import type { Plugin } from 'vite'

const webfontMarkerRE =
  /\/(?:\*|\/) *webfont-marker-begin *(?:\*\/|\n|\r|\n\r|\r\n)([^]*?)\/(?:\*|\/) *webfont-marker-end *(?:\*\/|\n|\r|\n\r|\r\n|$)/

export const webFontsPlugin = (enabled = false): Plugin => ({
  name: 'vitepress:webfonts',
  enforce: 'pre',

  transform(code, id) {
    if (/[\\/]fonts\.s?css/.test(id)) {
      if (enabled) {
        return code.match(webfontMarkerRE)?.[1]
      } else {
        return code.replace(webfontMarkerRE, '')
      }
    }
  }
})
