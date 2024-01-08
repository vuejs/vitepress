// Asynchronous queue with a close method
export default class Queue<T> {
  private queue: Array<T> = []
  private pending: Array<(data: T | null) => void> = []
  #closed: boolean = false

  get closed() {
    return this.#closed
  }

  async *items() {
    while (true) {
      const item = await this.dequeue()
      if (item === null) break
      yield item
    }
  }

  enqueue(data: T) {
    if (this.closed)
      throw new Error(`Failed to enqueue ${data}, queue already closed`)
    if (data === null) return this.close()
    if (this.pending.length) this.pending.shift()!(data)
    else this.queue.push(data)
  }

  async dequeue(): Promise<T | null> {
    if (this.closed) return null
    if (this.queue.length) return this.queue.shift()!
    return new Promise((res) => this.pending.push(res))
  }

  close() {
    this.#closed = true
    for (const res of this.pending) res(null)
  }
}
