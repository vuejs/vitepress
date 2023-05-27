import { copy } from 'fs-extra'
import fg from 'fast-glob'

function toDest(file) {
  return file.replace(/^src\//, 'dist/')
}

const copyPromises = []
fg.stream('src/client/**').on('data', (file) => {
  if (/(\.ts|tsconfig\.json)$/.test(file)) return
  copyPromises.push(copy(file, toDest(file)))
})

await Promise.all(copyPromises)
