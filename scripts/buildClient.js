import { copy } from 'fs-extra'
import { mkdist } from 'mkdist'
import { glob } from 'tinyglobby'

await mkdist({
  srcDir: 'src/client',
  distDir: 'dist/client',
  format: 'esm',
  declaration: true,
  addRelativeDeclarationExtensions: true,
  ext: 'js',
  pattern: '**/*.{vue,ts,css,woff2}'
})

// skip transpiling .vue files
await Promise.all(
  (await glob('src/client/**/*.vue')).map((file) => {
    copy(file, file.replace(/^src\//, 'dist/'))
  })
)
