import { copy } from 'fs-extra'
import { globSync } from 'tinyglobby'

globSync(['src/shared/**/*.ts']).forEach(async (file) => {
  await Promise.all([
    copy(file, file.replace(/^src\/shared\//, 'src/node/')),
    copy(file, file.replace(/^src\/shared\//, 'src/client/'))
  ])
})
