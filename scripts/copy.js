// copy and watch non-ts files in src/client
const fs = require('fs-extra')
const path = require('path')
const globby = require('globby')
const chokidar = require('chokidar')

const pattern = 'src/client/**/!(*.ts|tsconfig.json)'

function toDest(file) {
  return file.replace(/^src\//, 'dist/')
}

function copy(file) {
  fs.copy(file, toDest(file))
}

// copy on start
;(async () => {
  for (const file of await globby(pattern)) {
    copy(file)
  }
})()

chokidar
  .watch(pattern)
  .on('change', copy)
  .on('add', copy)
  .on('unlink', (file) => {
    fs.remove(toDest(file))
  })
