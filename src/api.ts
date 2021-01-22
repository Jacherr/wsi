import { readdirSync } from 'fs';

import { WsiServer, WsiServerOptions } from './server/server';
import { Scheduler, SchedulerOptions } from './scheduler/scheduler';
import { Job } from './jobs/_job';
import { WorkerManager, WorkerManagerOptions } from './worker/manager';

export interface WsiOptions extends WsiServerOptions, SchedulerOptions, WorkerManagerOptions {
  verbose?: boolean
}

export class Wsi {
    readonly jobs: Job[] = []
    readonly scheduler: Scheduler
    readonly server: WsiServer
    readonly workerManager: WorkerManager
    readonly verbose: boolean = false;

    constructor (options: WsiOptions = {}) {
      this.verbose = options.verbose ?? this.verbose;
      this.scheduler = new Scheduler(this, options);
      this.logIfVerbose('Initialised Scheduler');
      this.workerManager = new WorkerManager(this, options);
      this.logIfVerbose('Initialised Worker Pool');
      this.loadJobs();
      this.server = new WsiServer(this, options, () => this.logIfVerbose('Initialised WebSocket Server'));
    }

    private loadJobs () {
      for (const filename of readdirSync('./jobs')) {
        if (filename.startsWith('_')) continue;
        import(`./jobs/${filename}`).then(module => {
          const JobClass = module.default;
          const thisJob = new JobClass();
          this.jobs.push();
          this.logIfVerbose(`Job ${thisJob.name} loaded`);
        });
      }
    }

    logIfVerbose (message: any, ...optionalParams: any[]) {
      if (this.verbose) console.log(message, ...optionalParams);
    }
}
