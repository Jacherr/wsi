import { RawPacket } from '../server/statics';

export enum WorkerIpcIdentifierCodes {
    JOB_COMPLETE,
    JOB_ERROR,
    JOB_START,
    JOB_STATUS,
    WORKER_INIT
}

export interface WorkerIpcMessage {
    i: WorkerIpcIdentifierCodes
    d?: RawPacket
}

export enum WorkerStates {
    IDLE,
    PROCESSING
}
