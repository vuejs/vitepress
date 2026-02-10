import type { Plugin } from 'vite'

const webfontMarkerRE =
  /\/[\/*]!?\s*webfont-marker-begin(?:\s*\*\/)?([^]*?)\/[\/*]!?\s*webfont-marker-end(?:\s*\*\/)?/

export const webFontsPlugin = (enabled = false): Plugin => ({
  name: 'vitepress:webfonts',
  enforce: 'pre',

  transform: {
    filter: { id: /[\\/]fonts\.s?css(?:$|\?)/ },
    handler(code) {
      if (enabled) {
        return code.match(webfontMarkerRE)?.[1].trim()
      } else {
        return code.replace(webfontMarkerRE, '')
      }
    }
  }
})
