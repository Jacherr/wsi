import { Worker } from "../worker/worker";
import { Connection } from "../server/connection";

export interface PendingJob {
    jobId: string
    jobName: string
    setAt: number
}

export interface ActiveJob {
    worker: Worker
    jobId: string
    connection: Connection
}