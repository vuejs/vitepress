// markdown-it plugin for wrapping <table> ... </table>.
//
// If your plugin was chained before tableWrapper, you can add additional element directly.
// If your plugin was chained after tableWrapper, you can use these slots:
//   1. <!--beforebegin-->
//   2. <!--afterbegin-->
//   3. <!--beforeend-->
//   4. <!--afterend-->

import MarkdownIt from 'markdown-it'

export const tableWrapperPlugin = (md: MarkdownIt) => {
  md.renderer.rules.table_open = () => {
    return `<div class="table-wrapper" markdown="block"><table>`
  }

  md.renderer.rules.table_close = () => {
    return `</table></div>`
  }
}
