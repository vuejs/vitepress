import { Worker, isMainThread, parentPort, workerData } from 'worker_threads'
import RPCContext, {
  deferPromise,
  type RPCContextOptions
} from 'rpc-magic-proxy'
import c from 'picocolors'
import Queue from './utils/queue'
import _debug from 'debug'
import type { SiteConfig } from 'siteConfig'

export type SupportsParallel = 'render' | 'local-search'

const options: RPCContextOptions = {
  carryThis: false,
  carrySideEffect: false
}
/**
 * Checks if the given task should be run in parallel.
 * If task is omitted, checks if any task should be run in parallel.
 */
export function shouldUseParallel(config: SiteConfig, task?: SupportsParallel) {
  const { parallel = false } = config
  if (task === undefined)
    return parallel === true || (Array.isArray(parallel) && parallel.length > 0)
  if (typeof parallel === 'boolean') return parallel
  if (Array.isArray(parallel)) return parallel.includes(task)
  throw new TypeError(`Invalid value for config.parallel: ${parallel}`)
}

let debug = _debug('vitepress:worker:main')
const WORKER_MAGIC = 'vitepress:worker'
/*=============================== Main Thread ===============================*/
interface WorkerTask {
  name: string
  argv: any[]
  resolve: (retVal: any) => void
  reject: (error?: any) => void
}

// Owned by main thread, will be distributed to workers
let taskQueue: Queue<WorkerTask> | null = null

function dispatchWork(name: string, ...argv: any[]): Promise<any> {
  if (workerMeta) {
    return workerMeta.dispatchWork(name, ...argv)
  } else if (taskQueue) {
    const { promise, resolve, reject } = deferPromise()
    taskQueue.enqueue({ name, argv, resolve, reject })
    return promise
  } else {
    throw new Error(`trying to dispatch ${name} before launching workers.`)
  }
}

type WorkerInstance = Worker & {
  workerId: string
  hooks: {
    // Update worker's context
    updateContext: (ctx: Object | null) => void
  }
}

const workers: Array<WorkerInstance> = []

export async function launchWorkers(numWorkers: number, context: Object) {
  debug(`launching ${numWorkers} workers`)
  taskQueue = new Queue<WorkerTask>()
  const allInitialized: Array<Promise<void>> = []
  const ctx = new RPCContext(options)
  const getNextTask = () => taskQueue?.dequeue() ?? null
  for (let i = 0; i < numWorkers; i++) {
    const workerId = (i + 1).toString().padStart(2, '0')
    const { promise, resolve } = deferPromise<void>()
    const initWorkerHooks = (hooks: WorkerInstance['hooks']) => {
      Object.assign(worker, { workerId, hooks })
      resolve()
    }
    const debug = _debug(`vitepress:worker:${workerId.padEnd(4)}`)
    const payload = await ctx.serialize({
      workerMeta: {
        workerId,
        dispatchWork,
        // Save some RPC overhead when debugger is not active
        debug: debug.enabled ? debug : null
      },
      initWorkerHooks,
      getNextTask,
      context
    })
    const worker = new Worker(new URL(import.meta.url), {
      workerData: { [WORKER_MAGIC]: payload }
    }) as WorkerInstance
    ctx.bind(worker as any)
    workers.push(worker)
    allInitialized.push(promise)
    worker.on('error', console.error)
  }
  await Promise.all(allInitialized)
}

export function updateContext(context: Object) {
  return Promise.all(workers.map(({ hooks }) => hooks.updateContext(context)))
}

// Wait for workers to finish and exit.
// Will return immediately if no worker exists.
export async function stopWorkers(reason: string = 'exit') {
  debug('stopping workers:', reason)
  const allClosed = workers.map((w) =>
    new Promise<void>((res) => w.once('exit', () => res())).then(() =>
      debug(`worker:${w.workerId} confirmed exit`)
    )
  )
  taskQueue?.close()
  taskQueue = null
  const success = await Promise.any([
    Promise.all(allClosed).then(() => true),
    new Promise<false>((res) => setTimeout(() => res(false), 1500))
  ])
  if (!success) {
    debug('forcefully terminating workers')
    for (const w of workers) {
      try {
        w.terminate()
      } catch (e) {}
    }
  }
}

/*============================== Worker Thread ==============================*/

export let workerMeta: {
  workerId: string
  dispatchWork: typeof dispatchWork
  debug: typeof debug
} | null = null

const registry: Map<string, { main: Function; init?: Function }> = new Map()

export function registerWorkload<T extends Object, K extends any[], V>(
  name: string,
  main: (this: T, ...args: K) => V,
  init?: (this: T, ...args: void[]) => void
) {
  // Only register workload in worker threads
  if (!isMainThread) {
    if (registry.has(name))
      throw new Error(`Workload "${name}" already registered.`)
    registry.set(name, { main, init })
  }
  return (...args: Parameters<typeof main>) =>
    dispatchWork(name, ...args) as Promise<Awaited<ReturnType<typeof main>>>
}

// Will keep querying next workload from main thread
async function workerMainLoop() {
  const ctx = new RPCContext(options).bind(parentPort! as any)
  const {
    workerMeta: _workerMeta,
    initWorkerHooks,
    getNextTask,
    context
  }: {
    workerMeta: typeof workerMeta
    getNextTask: () => Promise<WorkerTask | null>
    initWorkerHooks: (hooks: Object) => Promise<void>
    context: Object
  } = ctx.deserialize(workerData[WORKER_MAGIC]) as any
  // Set up magic proxy to main thread dispatchWork
  workerMeta = _workerMeta!
  if (workerMeta.debug) debug = workerMeta.debug
  else debug = (() => {}) as any as typeof debug
  debug(`started`)
  // Upon worker initialization, report back the hooks that main thread can use
  // to reach this worker.
  await initWorkerHooks({
    updateContext(ctx: Object | null) {
      if (ctx === null) for (const k in context) delete (context as any)[k]
      else Object.assign(context, ctx)
    }
  })

  let workTime = 0
  while (true) {
    const task = await getNextTask()
    if (task === null) break
    const { name, argv, resolve, reject } = task
    if (!registry.has(name)) throw new Error(`No task "${name}" registered.`)
    const el = registry.get(name)!
    const { main, init } = el
    const timeStart = performance.now()
    if (init) {
      try {
        await init.apply(context)
      } catch (e) {
        console.error(c.red(`worker: failed to init workload "${name}":`), e)
        reject(e)
      } finally {
        el.init = undefined
      }
    }
    try {
      resolve(await main.apply(context, argv))
    } catch (e) {
      console.error(
        c.red(`worker:${workerMeta.workerId} error running task "${name}":`),
        e
      )
      reject(e)
    } finally {
      workTime += performance.now() - timeStart
    }
  }
  ctx.reset()
  const duration = (workTime / 1000).toFixed(2)
  await debug(`stopped - total workload: ${duration}s`)
}

if (!isMainThread && workerData?.[WORKER_MAGIC])
  workerMainLoop().then(() => process.exit())
