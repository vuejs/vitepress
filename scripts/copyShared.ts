import { cp } from 'node:fs/promises'
import { globSync } from 'tinyglobby'

globSync(['src/shared/**/*.ts']).forEach(async (file) => {
  await Promise.all([
    cp(file, file.replace(/^src\/shared\//, 'src/node/')),
    cp(file, file.replace(/^src\/shared\//, 'src/client/'))
  ])
})
