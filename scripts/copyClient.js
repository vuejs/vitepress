const fs = require('fs-extra')
const glob = require('globby')

function toDest(file) {
  return file.replace(/^src\//, 'dist/')
}

glob.sync('src/client/**').forEach((file) => {
  if (/(\.ts|tsconfig\.json)$/.test(file)) return
  fs.copy(file, toDest(file))
})
