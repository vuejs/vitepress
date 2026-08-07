import { cp } from 'node:fs/promises'
import { globSync } from 'tinyglobby'

function toDest(file: string) {
  return file.replace(/^src\//, 'dist/')
}

globSync(['src/client/**']).forEach((file) => {
  if (/(\.ts|tsconfig\.json)$/.test(file)) return
  cp(file, toDest(file))
})
