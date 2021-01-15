import { Connection } from "../server/connection";

import { PendingJob, ActiveJob } from "./statics";

export interface SchedulerOptions {
    globalJobTimeout?: number
    maximumConcurrentJobsPerConnection?: number
}

export class Scheduler {
    readonly jobTimeout: number = 60000
    readonly jobTimeoutInterval: NodeJS.Timeout
    readonly maxumumConcurrentJobsPerConnection: number = 3
    private readonly pendingJobs = new Map<Connection, PendingJob>()
    private readonly activeJobs = new Set<ActiveJob>()

    constructor(options: SchedulerOptions = {}) {
        this.jobTimeout = options.globalJobTimeout ?? this.jobTimeout;
        this.jobTimeoutInterval = setInterval(this.clearExpiredPendingJobs.bind(this), this.jobTimeout);
        this.maxumumConcurrentJobsPerConnection = 
            options.maximumConcurrentJobsPerConnection ?? this.maxumumConcurrentJobsPerConnection;
    }

    private clearExpiredPendingJobs() {
        for(const [connection, job] of this.pendingJobs.entries()) {
            if(job.setAt + this.jobTimeout < Date.now()) {
                this.pendingJobs.delete(connection);
                connection.pendingJobExpired();
            }
        }
    }

    onJobDataRecieved(connection: Connection) {
        if(!this.jobIsPendingFor(connection)) {
            throw new Error('This connection has no pending jobs for the data to be applied to.')
        }
    }

    jobIsPendingFor(connection: Connection) {
        return this.pendingJobs.has(connection);
    }

    setPendingJob(connection: Connection, jobId: string, jobName: string) {
        this.pendingJobs.set(connection, {
            jobId,
            jobName,
            setAt: Date.now()
        });
    }
}