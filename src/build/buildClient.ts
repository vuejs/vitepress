import { build, BuildOptions } from 'vite'

export async function buildClient(options: BuildOptions) {
  await build({
    ...options,
    cdn: false
  })
}
