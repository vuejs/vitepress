import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)

// vitepress may itself be executed inside a vite module runner, e.g. when
// `build()` is called from a vitest global setup file with vitepress not
// externalized. the runner rewrites every dynamic import to be resolved
// through vite, which cannot load the temp SSR bundle and its relative page
// imports, and runtime-constructed `import()` wrappers fail there with
// ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING. require(esm) is supported by all
// node versions vitepress runs on and always uses node's own loader.
export async function nativeImport(file: string): Promise<any> {
  try {
    return require(file)
  } catch (e: any) {
    // require() cannot load modules that use top-level await - fall back to
    // a plain dynamic import, which only misbehaves inside a module runner
    if (e.code === 'ERR_REQUIRE_ASYNC_MODULE') {
      return import(pathToFileURL(file).href)
    }
    throw e
  }
}
