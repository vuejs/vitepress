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

const workers: Worker[] = []

export async function launchWorkers(numWorkers: number, context: Object) {
  const ctx = new RpcContext()
  const workerData = await ctx.serialize({
    [WORKER_MAGIC]: '',
    getNextTask,
    context
  })
  for (let i = 0; i < numWorkers; i++) {
    const worker = new Worker(new URL(import.meta.url), { workerData })
    ctx.bind(worker)
    workers.push(worker)
  }
}

export function updateContext(context: Object) {
  for (const worker of workers) {
    worker.postMessage({
      [WORKER_MAGIC]: 'update/context',
      context
    })
  }
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
    getNextTask,
    context
  }: {
    getNextTask: () => Promise<WorkerTask | null>
    context: Object
  } = ctx.deserialize(workerData)

  parentPort!.on('message', (msg) => {
    if (msg?.[WORKER_MAGIC] === 'update/context') {
      Object.assign(context, msg.context)
    }
  })

  while (true) {
    const task = await getNextTask()
    if (task === null) break
    const { name, argv, resolve, reject } = task
    if (!registry.has(name)) throw new Error(`No task "${name}" registered.`)
    const { main, init } = registry.get(name)!
    if (init) {
      init.apply(context)
      delete registry.get(name)!.init
    }
    await (main.apply(context, argv) as Promise<any>).then(resolve, reject)
  }
  ctx.reset()
  process.exit(0)
}

if (!isMainThread && WORKER_MAGIC in workerData) workerMain()
