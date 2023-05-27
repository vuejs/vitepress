import { copy } from 'fs-extra'
import fg from 'fast-glob'

await Promise.all(
  fg
    .sync('src/shared/**/*.ts')
    .map((file) => [
      copy(file, file.replace(/^src\/shared\//, 'src/node/')),
      copy(file, file.replace(/^src\/shared\//, 'src/client/'))
    ])
    .flat()
)
