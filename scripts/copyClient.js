import { copy } from 'fs-extra'
import { sync } from 'globby'

function toDest(file) {
  return file.replace(/^src\//, 'dist/')
}

sync('src/client/**').forEach((file) => {
  if (/(\.ts|tsconfig\.json)$/.test(file)) return
  copy(file, toDest(file))
})
