import { Connection } from '../server/connection';

import { PendingJob, ActiveJob } from './statics';
import { Wsi } from '../api';

export interface SchedulerOptions {
    globalJobTimeout?: number
    maximumConcurrentJobsPerConnection?: number
}

export class Scheduler {
    readonly api: Wsi
    readonly jobTimeout: number = 60000
    readonly jobTimeoutInterval: NodeJS.Timeout
    readonly maxumumConcurrentJobsPerConnection: number = 3
    private readonly pendingJobs = new Map<Connection, PendingJob>()
    private readonly activeJobs = new Set<ActiveJob>()

    constructor (api: Wsi, options: SchedulerOptions = {}) {
      this.api = api;
      this.jobTimeout = options.globalJobTimeout ?? this.jobTimeout;
      this.jobTimeoutInterval = setInterval(this.clearExpiredPendingJobs.bind(this), this.jobTimeout);
      this.maxumumConcurrentJobsPerConnection =
            options.maximumConcurrentJobsPerConnection ?? this.maxumumConcurrentJobsPerConnection;
    }

    private clearExpiredPendingJobs () {
      for (const [connection, job] of this.pendingJobs.entries()) {
        if (job.setAt + this.jobTimeout < Date.now()) {
          this.pendingJobs.delete(connection);
          connection.pendingJobExpired();
        }
      }
    }

    onJobDataRecieved (connection: Connection) {
      if (!this.jobIsPendingFor(connection)) {
        throw new Error('This connection has no pending jobs for the data to be applied to.');
      }
    }

    jobIsPendingFor (connection: Connection) {
      return this.pendingJobs.has(connection);
    }

    setPendingJob (connection: Connection, jobId: string, jobName: string) {
      const job = this.api.jobs.find(j => j.name === jobName);
      if (!job) {
        throw new Error('No job with this name exists.');
      };
      this.pendingJobs.set(connection, {
        id: jobId,
        job,
        setAt: Date.now()
      });
    }
}
