import { Wsi } from '../api';
import { WorkerMaster } from './master';

export interface WorkerManagerOptions {
    globalJobTimeout?: number
    workerCount?: number
}

export class WorkerManager {
    readonly api: Wsi
    readonly globalJobTimeout: number = 60000
    readonly workerCount: number = 5
    readonly workers: WorkerMaster[] = []

    constructor (api: Wsi, options: WorkerManagerOptions = {}) {
      this.api = api;
      this.globalJobTimeout = options.globalJobTimeout ?? this.globalJobTimeout;
      this.workerCount = options.workerCount ?? this.workerCount;
    }

    async stopJobsFor (ids: string[]) {
      const applicableWorkers = this.workers.filter(w => w.processing && ids.includes(w.processing.jobId));
      for (const worker of applicableWorkers) {
        await worker.stopJob();
      }
    }
}
