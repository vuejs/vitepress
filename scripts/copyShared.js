import { copy } from 'fs-extra'
import fg from 'fast-glob'

fg.sync('src/shared/**/*.ts').map(async (file) => {
  await copy(file, file.replace(/^src\/shared\//, 'src/node/'))
  await copy(file, file.replace(/^src\/shared\//, 'src/client/'))
})
