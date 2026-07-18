import { watch } from 'chokidar'
import { cp, rm } from 'node:fs/promises'
import { normalizePath } from 'vite'

function toClientAndNode(method: 'copy' | 'remove', file: string) {
  file = normalizePath(file)
  if (method === 'copy') {
    cp(file, file.replace(/^src\/shared\//, 'src/node/'))
    cp(file, file.replace(/^src\/shared\//, 'src/client/'))
  } else if (method === 'remove') {
    rm(file.replace(/^src\/shared\//, 'src/node/'), { force: true })
    rm(file.replace(/^src\/shared\//, 'src/client/'), { force: true })
  }
}

function toDist(file: string) {
  return normalizePath(file).replace(/^src\//, 'dist/')
}

// copy shared files to the client and node directory whenever they change.
watch('src/shared', {
  ignored: (path, stats) => !!stats?.isFile() && !path.endsWith('.ts')
})
  .on('change', (file) => toClientAndNode('copy', file))
  .on('add', (file) => toClientAndNode('copy', file))
  .on('unlink', (file) => toClientAndNode('remove', file))

// copy non ts files, such as an html or css, to the dist directory whenever
// they change.
watch('src/client', {
  ignored: (path, stats) =>
    !!stats?.isFile() &&
    (path.endsWith('.ts') || path.endsWith('tsconfig.json'))
})
  .on('change', (file) => cp(file, toDist(file)))
  .on('add', (file) => cp(file, toDist(file)))
  .on('unlink', (file) => rm(toDist(file), { force: true }))
