import { mkdist } from 'mkdist'

await mkdist({
  srcDir: 'src/client',
  distDir: 'dist/client',
  format: 'esm',
  declaration: true,
  addRelativeDeclarationExtensions: true,
  ext: 'js',
  pattern: '**/*.{vue,ts,css,woff2}'
})
