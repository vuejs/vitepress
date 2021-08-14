const fs = require('fs-extra')
const glob = require('globby')
const { normalizePath } = require('vite')

function toDist(file) {
  file = normalizePath(file)
  return file.replace(/^src\//, 'dist/')
}

glob.sync('src/client/**/!(*.ts|tsconfig.json)').forEach((file) => {
  fs.copy(file, toDist(file))
})
