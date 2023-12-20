/* ---------------------------------------------------------
 * Copyright (c) 2023 Yuxuan Zhang, web-dev@z-yx.cc
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------ */

import os from 'os'

/**
 * Create a callback pool, with a maximum number of parallel tasks.
 * Queued tasks will be executed directly when the pool is not full.
 * Otherwise, they will be executed in a first-in-first-out manner
 * when a dispatched task finishes.
 * ---
 * When used with 'node:child_process', you can control the pooling
 * of parallel tasks, and avoid spawning too many child processes.
 */
export default class Pool extends EventTarget {
  // Number of dispatched tasks (currently in progress)
  private numExecutors: number = 0

  // The pending task queue. Promise return type <T> varies by task
  private pendingTaskQueue: Array<() => Promise<any>> = []

  /**
   * This executor will keep executing next available task in queue.
   * Therefore, it always owns a running task until the queue drains.
   * You can think of it as a "worker thread" in a thread pool.
   */
  private executor() {
    // Only launch new executor when the pool is not full
    if (this.numExecutors >= this.maxThreads) return
    // Register new executor
    this.numExecutors++
    ;(async () => {
      while (this.pendingTaskQueue.length > 0) {
        try {
          const nextTaskInQueue = this.pendingTaskQueue.shift()!
          await nextTaskInQueue()
        } catch (e) {}
      }
      // Unregister the executor
      this.numExecutors--
      // Dispatch "drain" event when the last executor finishes
      if (this.numExecutors === 0) this.dispatchEvent(new Event('drain'))
    })()
  }

  /**
   * @param maxThreads Maximum number of parallel tasks
   */
  constructor(private maxThreads: number = os.cpus().length) {
    super()
  }

  /**
   * Dispatch a task to the pool. Use it like `new Promise<T>(task)`
   * @param task The task call back, just like the one in Promise constructor
   * @returns
   * The constructed promise object, will resolve to the value
   * passed to resolve callback
   */
  add<T = any>(task: (...args: any[]) => T, ...args: any[]): Promise<T> {
    // Create deferred promise handlers
    let resolve: (v: T) => void, reject: (reason?: any) => void
    const promise = new Promise<T>(
      (...callbacks) => ([resolve, reject] = callbacks)
    )
    // Push the task to queue for deferred resolution
    // Notice the task may NOT be invoked right away
    this.pendingTaskQueue.push(async () => {
      try {
        resolve(await task(...args))
      } catch (error: any) {
        reject(error)
      }
    })
    // Try to launch a new executor
    this.executor()
    // Return the promise
    return promise
  }

  /**
   * Wait for all dispatched executors to finish.
   * Return immediately if no executor is running.
   * @returns A promise that resolves when the pool drains
   */
  async drain() {
    if (this.numExecutors > 0)
      await new Promise<void>((resolve) =>
        this.addEventListener('drain', () => resolve(), { once: true })
      )
    return
  }
}
