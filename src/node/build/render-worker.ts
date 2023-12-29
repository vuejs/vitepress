import { Worker, workerData, isMainThread, parentPort } from 'worker_threads'
import { type UpdateHandle } from '../utils/task'
import { type RenderPageContext } from './render'

type TaskAllocator<T> = () => Promise<T | undefined>

import RpcContext from 'rpc-magic-proxy'

export default async function cluster(
  entryPath: string,
  context: RenderPageContext,
  pages: string[],
  update: UpdateHandle
) {
  const concurrency = context.config.buildConcurrency || 1
  const num_tasks = pages.length
  let progress = -concurrency

  const pageAlloc: TaskAllocator<string> = async () => {
    progress++
    if (progress >= 0) update(progress, num_tasks)
    return pages.shift()
  }

  const tasks = []

  for (let _ = 0; _ < concurrency; _++) {
    const ctx = new RpcContext()
    const workerData = await ctx.serialize({
      entryPath,
      pageAlloc,
      context,
      workload: 'render'
    })
    const worker = new Worker(new URL(import.meta.url), { workerData })
    ctx.bind(worker)
    tasks.push(
      new Promise((res, rej) =>
        worker.once('exit', (code) => {
          if (code === 0) res(code)
          else rej()
        })
      )
    )
  }

  await Promise.all(tasks)
}

async function renderWorker() {
  const ctx = new RpcContext(parentPort!)
  try {
    const {
      entryPath,
      pageAlloc,
      context
    }: {
      entryPath: string
      pageAlloc: TaskAllocator<string>
      context: RenderPageContext
    } = ctx.deserialize(workerData)
    const { pathToFileURL } = await import('url')
    const { renderPage } = await import('./render')
    const { render } = await import(pathToFileURL(entryPath).toString())
    while (true) {
      const page = await pageAlloc()
      if (!page) break
      await renderPage(render, page, context)
    }
  } catch (e) {
    console.error(e)
  } finally {
    ctx.reset()
  }
}

if (!isMainThread && workerData?.workload === 'render') renderWorker()
