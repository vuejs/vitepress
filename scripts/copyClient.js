import { copy } from 'fs-extra'
import fg from 'fast-glob'

function toDest(file) {
  return file.replace(/^src\//, 'dist/')
}

await Promise.all(
  fg.sync('src/client/**').map((file) => {
    if (/(\.ts|tsconfig\.json)$/.test(file)) return
    return copy(file, toDest(file))
  })
)
