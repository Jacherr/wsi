import { WsiServer, WsiServerOptions } from './server/server';
import { Scheduler, SchedulerOptions } from './scheduler/scheduler';
import { Job } from './jobs/_job';
import { WorkerManager, WorkerManagerOptions } from './worker/manager';

export interface WsiOptions extends WsiServerOptions, SchedulerOptions, WorkerManagerOptions {

}

export class Wsi {
    readonly jobs: Job[] = []
    readonly scheduler: Scheduler
    readonly server: WsiServer
    readonly workerManager: WorkerManager

    constructor (options: WsiOptions = {}) {
      this.scheduler = new Scheduler(this, options);
      this.server = new WsiServer(this, options);
      this.workerManager = new WorkerManager(this, options);
    }
}
