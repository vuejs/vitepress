import { Plugin } from 'vite'

const webfontMarkerRE =
  /\/\* *webfont-marker-begin *\*\/([^]*?)\/\* *webfont-marker-end *\*\//

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
