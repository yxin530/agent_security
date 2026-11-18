type Task<T> = { run: () => Promise<T>; resolve: (value: T) => void; reject: (error: unknown) => void };

export class ScanQueue {
  private active = 0;
  private readonly queued: Task<any>[] = [];

  constructor(private readonly maxConcurrent: number, private readonly maxQueued: number) {
    if (!Number.isInteger(maxConcurrent) || maxConcurrent < 1 || maxConcurrent > 32) throw new Error('maxConcurrentScans must be an integer from 1 to 32');
    if (!Number.isInteger(maxQueued) || maxQueued < 0 || maxQueued > 1000) throw new Error('maxQueuedScans must be an integer from 0 to 1000');
  }

  run<T>(task: () => Promise<T>): Promise<T> {
    if (this.active >= this.maxConcurrent && this.queued.length >= this.maxQueued) return Promise.reject(new Error('scan queue full'));
    return new Promise<T>((resolve, reject) => {
      const item: Task<T> = { run: task, resolve, reject };
      if (this.active < this.maxConcurrent) this.start(item);
      else this.queued.push(item);
    });
  }

  private start(item: Task<any>): void {
    this.active++;
    Promise.resolve().then(item.run).then(item.resolve, item.reject).finally(() => {
      this.active--;
      const next = this.queued.shift();
      if (next) this.start(next);
    });
  }
}
