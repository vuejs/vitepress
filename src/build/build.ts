import { bundle } from './bundle'
import { BuildOptions as ViteBuildOptions } from 'vite'

export type BuildOptions = Pick<
  ViteBuildOptions,
  'root' | 'rollupInputOptions' | 'rollupOutputOptions'
>

export async function build(options: BuildOptions = {}) {
  await bundle(options)
}
