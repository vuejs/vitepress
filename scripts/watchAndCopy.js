const fs = require('fs-extra')
const chokidar = require('chokidar')

function toClientAndNode(method, file) {
  if (method === 'copy') {
    fs.copy(file, file.replace(/^src\/shared\//, 'src/node/'))
    fs.copy(file, file.replace(/^src\/shared\//, 'src/client/'))
  } else if (method === 'remove') {
    fs.remove(file.replace(/^src\/shared\//, 'src/node/'))
    fs.remove(file.replace(/^src\/shared\//, 'src/client/'))
  }
}

function toDist(file) {
  return file.replace(/^src\//, 'dist/')
}

// copy shared files to the client and node directory whenever they change.
chokidar
  .watch('src/shared/**/*.ts')
  .on('change', (file) => toClientAndNode('copy', file))
  .on('add', (file) => toClientAndNode('copy', file))
  .on('unlink', (file) => toClientAndNode('remove', file))

// copy non ts files, such as an html or css, to the dist directory whenever
// they change.
chokidar
  .watch('src/client/**/!(*.ts|tsconfig.json)')
  .on('change', (file) => fs.copy(file, toDist(file)))
  .on('add', (file) => fs.copy(file, toDist(file)))
  .on('unlink', (file) => fs.remove(toDist(file)))
