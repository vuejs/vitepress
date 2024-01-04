import { Worker, isMainThread, parentPort, workerData } from 'worker_threads'
import RpcContext, { deferPromise } from 'rpc-magic-proxy'
import { task, updateCurrentTask } from './utils/task'
import Queue from './utils/queue'
import _debug from 'debug'

let debug = _debug('vitepress:worker:main')
const WORKER_MAGIC = 'vitepress:worker'

function debugArgv(...argv: any[]) {
  if (!debug.enabled) return ''
  return argv
    .map((v) => {
      const t = typeof v
      if (v?.length !== undefined) return `${t}[${v.length}]`
      else return t
    })
    .join(', ')
}
/*=============================== Main Thread ===============================*/
interface WorkerTask {
  name: string
  argv: any[]
  resolve: (retVal: any) => void
  reject: (error?: any) => void
}

// Owned by main thread, will be distributed to workers
const taskQueue = new Queue<WorkerTask>()

function dispatchWork(name: string, ...argv: any[]): Promise<any> {
  if (workerMeta) {
    return workerMeta.dispatchWork(name, ...argv)
  } else {
    return new Promise((resolve, reject) =>
      taskQueue.enqueue({ name, argv, resolve, reject })
    )
  }
}

type WorkerWithHooks = Worker & {
  hooks: {
    // Update worker's context
    updateContext: (ctx: Object | null) => void
  }
}

const workers: Array<WorkerWithHooks> = []

export async function launchWorkers(numWorkers: number, context: Object) {
  const allInitialized: Array<Promise<void>> = []
  const ctx = new RpcContext()
  const getNextTask = () => taskQueue.dequeue()
  for (let i = 0; i < numWorkers; i++) {
    const workerId = (i + 1).toString().padStart(2, '0')
    const { promise, resolve } = deferPromise()
    const initWorkerHooks = (hooks: WorkerWithHooks['hooks']) => {
      worker.hooks = hooks
      resolve()
    }
    const debug = _debug(`vitepress:worker:${workerId.padEnd(4)}`)
    const payload = await ctx.serialize({
      workerMeta: {
        workerId,
        dispatchWork,
        debug: debug.enabled ? debug : null,
        task,
        updateCurrentTask
      } as typeof workerMeta,
      initWorkerHooks,
      getNextTask,
      context
    })
    const worker = new Worker(new URL(import.meta.url), {
      workerData: { [WORKER_MAGIC]: payload }
    }) as WorkerWithHooks
    ctx.bind(worker)
    workers.push(worker)
    allInitialized.push(promise)
    worker.on('error', console.error)
  }
  await Promise.all(allInitialized)
}

export function updateContext(context: Object) {
  return Promise.all(workers.map(({ hooks }) => hooks.updateContext(context)))
}

// Wait for workers to drain the taskQueue and exit.
export async function stopWorkers(reason: string = 'exit') {
  const allClosed = workers.map(
    (w) => new Promise((res) => w.once('exit', res))
  )
  taskQueue.close()
  debug('waiting for workers, exiting because', reason)
  const success = await Promise.any([
    Promise.all(allClosed).then(() => true),
    new Promise<false>((res) => setTimeout(() => res(false), 1000))
  ])
  if (!success) {
    console.warn('forcefully terminating workers')
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
  task: typeof task
  updateCurrentTask: typeof updateCurrentTask
} | null = null

const registry: Map<string, { main: Function; init?: Function }> = new Map()

export function registerWorkload<T extends Object, K extends any[], V>(
  name: string,
  main: (this: T, ...args: K) => V,
  init?: (this: T, ...args: void[]) => void
) {
  if (!isMainThread) {
    // Only register workload in worker threads
    if (registry.has(name)) {
      throw new Error(`Workload "${name}" already registered.`)
    }
    registry.set(name, { main, init })
  }
  return (...args: Parameters<typeof main>) =>
    dispatchWork(name, ...args) as Promise<Awaited<ReturnType<typeof main>>>
}

// Will keep querying next workload from main thread
async function workerMainLoop() {
  const ctx = new RpcContext(parentPort!)
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
  } = ctx.deserialize(workerData[WORKER_MAGIC])
  // Set up magic proxy to main thread dispatchWork
  workerMeta = _workerMeta!
  if (workerMeta.debug) debug = workerMeta.debug
  else debug = (() => {}) as any as typeof debug
  // Upon worker initialization, report back the hooks that main thread can use
  // to reach this worker.
  await initWorkerHooks({
    updateContext(ctx: Object | null) {
      if (ctx === null) for (const k in context) delete (context as any)[k]
      else Object.assign(context, ctx)
    }
  })

  while (true) {
    const task = await getNextTask()
    if (task === null) break
    const { name, argv, resolve, reject } = task
    debug('got task', name, '(', debugArgv(...argv), ')')
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
      console.error(`worker:${workerMeta.workerId}: task "${name}" error`, e)
      reject(e)
    }
  }
  ctx.reset()
}

if (!isMainThread && WORKER_MAGIC in workerData) workerMainLoop()
