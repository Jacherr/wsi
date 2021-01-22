import { WorkerMaster } from '../worker/master';
import { Connection } from '../server/connection';
import { Job } from '../jobs/_job';

export interface PendingJob {
    id: string
    job: Job
    setAt: number
    willSendData: boolean
}

export interface ActiveJob {
    worker: WorkerMaster
    jobId: string
    connection: Connection
}
