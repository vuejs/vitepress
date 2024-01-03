import { Worker, isMainThread, parentPort, workerData } from 'worker_threads'
import RpcContext from 'rpc-magic-proxy'
import Queue from './utils/queue'

const WORKER_MAGIC = '::vitepress::build-worker::'

interface WorkerTask {
  name: string
  argv: any[]
  resolve: (retVal: any) => void
  reject: (error?: any) => void
}

interface WorkerHooks {
  // Update worker's context
  context: (ctx: Object | null) => void
}

function deferPromise<T>(): {
  promise: Promise<T>
  resolve: (val: T) => void
  reject: (error?: any) => void
} {
  let resolve: (val: T) => void
  let reject: (error?: any) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve: resolve!, reject: reject! }
}

/*=============================== Main Thread ===============================*/

// Owned by main thread, will be distributed to workers
const taskQueue = new Queue<WorkerTask>()

// This function will be exposed to workers via magic proxy
function getNextTask() {
  return taskQueue.dequeue()
}

export function dispatchWork(name: string, ...argv: any[]): Promise<any> {
  return new Promise((resolve, reject) =>
    taskQueue.enqueue({ name, argv, resolve, reject })
  )
}

const workers: Array<Worker & { hooks: WorkerHooks }> = []

export async function launchWorkers(numWorkers: number, context: Object) {
  const allInitialized: Array<Promise<void>> = []
  const ctx = new RpcContext()
  for (let i = 0; i < numWorkers; i++) {
    const { promise, resolve } = deferPromise<void>()
    const initWorkerHooks = (hooks: WorkerHooks) => {
      worker.hooks = hooks
      resolve()
    }
    const payload = await ctx.serialize({
      initWorkerHooks,
      getNextTask,
      context
    })
    const worker = new Worker(new URL(import.meta.url), {
      workerData: { [WORKER_MAGIC]: payload }
    }) as Worker & { hooks: WorkerHooks }
    ctx.bind(worker)
    workers.push(worker)
    allInitialized.push(promise)
    worker.on('error', console.error)
  }
  await Promise.all(allInitialized)
}

export function updateContext(context: Object) {
  return Promise.all(workers.map(({ hooks }) => hooks.context(context)))
}

// Wait for workers to drain the taskQueue and exit.
export function waitWorkers() {
  const allClosed = workers.map(
    (w) => new Promise((res) => w.once('exit', res))
  )
  taskQueue.close()
  return Promise.all(allClosed)
}

/*============================== Worker Thread ==============================*/

const registry: Map<string, { main: Function; init?: Function }> = new Map()

export function registerWorkload(
  name: string,
  main: (...argv: any[]) => any,
  init?: () => void
) {
  // Only register workload in worker threads
  if (isMainThread) return
  if (registry.has(name)) {
    throw new Error(`Workload "${name}" already registered.`)
  }
  registry.set(name, { main, init })
}

// Will keep querying next workload from main thread
async function workerMain() {
  const ctx = new RpcContext(parentPort!)
  const {
    initWorkerHooks,
    getNextTask,
    context
  }: {
    getNextTask: () => Promise<WorkerTask | null>
    initWorkerHooks: (hooks: Object) => Promise<void>
    context: Object
  } = ctx.deserialize(workerData[WORKER_MAGIC])
  // Upon worker initialization, report back the hooks that main thread can use
  // to reach this worker.
  await initWorkerHooks({
    context(ctx: Object | null) {
      if (ctx === null) for (const k in context) delete (context as any)[k]
      else Object.assign(context, ctx)
    }
  })

  while (true) {
    const task = await getNextTask()
    if (task === null) break
    const { name, argv, resolve, reject } = task
    if (!registry.has(name)) throw new Error(`No task "${name}" registered.`)
    const el = registry.get(name)!
    const { main, init } = el
    if (init) {
      try {
        await init.apply(context)
      } catch (e) {
        console.error(`worker: failed to init workload "${name}": ${e}`)
      }
      el.init = undefined
    }
    try {
      resolve(await main.apply(context, argv))
    } catch (e) {
      console.error(`worker: task "${name}" error`, e)
      reject(e)
    }
  }

  ctx.reset()
}

if (!isMainThread && WORKER_MAGIC in workerData) workerMain()
