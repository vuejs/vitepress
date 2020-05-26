const fs = require('fs-extra')
const glob = require('globby')

function toDest(file) {
  return file.replace(/^src\//, 'dist/')
}

glob.sync('src/client/**/!(*.ts|tsconfig.json)').forEach((file) => {
  fs.copy(file, toDest(file))
})
