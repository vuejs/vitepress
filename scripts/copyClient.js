import { copy } from 'fs-extra'
import fg from 'fast-glob'

function toDest(file) {
  return file.replace(/^src\//, 'dist/')
}

fg.sync('src/client/**').forEach((file) => {
  if (/(\.ts|tsconfig\.json)$/.test(file)) return
  copy(file, toDest(file))
})
