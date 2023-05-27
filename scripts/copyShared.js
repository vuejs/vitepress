import { copy } from 'fs-extra'
import fg from 'fast-glob'

const copyPromises = []
fg.stream('src/shared/**/*.ts').on('data', (file) => {
  copyPromises.push(
    copy(file, file.replace(/^src\/shared\//, 'src/node/')),
    copy(file, file.replace(/^src\/shared\//, 'src/client/'))
  )
})

await Promise.all(copyPromises)
