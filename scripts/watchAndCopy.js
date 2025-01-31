import { watch } from 'chokidar'
import { copy, remove } from 'fs-extra'
import { normalizePath } from 'vite'

function toClientAndNode(method, file) {
  file = normalizePath(file)
  if (method === 'copy') {
    copy(file, file.replace(/^src\/shared\//, 'src/node/'))
    copy(file, file.replace(/^src\/shared\//, 'src/client/'))
  } else if (method === 'remove') {
    remove(file.replace(/^src\/shared\//, 'src/node/'))
    remove(file.replace(/^src\/shared\//, 'src/client/'))
  }
}

function toDist(file) {
  return normalizePath(file).replace(/^src\//, 'dist/')
}

// copy shared files to the client and node directory whenever they change.
watch('src/shared', {
  ignored: (path, stats) => stats?.isFile() && !path.endsWith('.ts')
})
  .on('change', (file) => toClientAndNode('copy', file))
  .on('add', (file) => toClientAndNode('copy', file))
  .on('unlink', (file) => toClientAndNode('remove', file))

// copy non ts files, such as an html or css, to the dist directory whenever
// they change.
watch('src/client', {
  ignored: (path, stats) =>
    stats?.isFile() && (path.endsWith('.ts') || path.endsWith('tsconfig.json'))
})
  .on('change', (file) => copy(file, toDist(file)))
  .on('add', (file) => copy(file, toDist(file)))
  .on('unlink', (file) => remove(toDist(file)))
