// copy and watch non-ts files in src/client
const fs = require('fs-extra')
const chokidar = require('chokidar')

function toDest(file) {
  return file.replace(/^src\//, 'dist/')
}

chokidar
  .watch('src/client/**/!(*.ts|tsconfig.json)')
  .on('change', (file) => fs.copy(file, toDest(file)))
  .on('add', (file) => fs.copy(file, toDest(file)))
  .on('unlink', (file) => fs.remove(toDest(file)))
