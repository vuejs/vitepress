import { buildClient } from './buildClient'
import { BuildOptions } from 'vite'

export async function build(options: BuildOptions = {}) {
  await buildClient(options)
}
