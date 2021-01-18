import { workerData, parentPort } from 'worker_threads';
import { WorkerIpcMessage, WorkerIpcIdentifierCodes } from './statics';

let slave;

export class WorkerSlave {
  executeJob () {

  }
}

parentPort?.on('message', (message: WorkerIpcMessage) => {
  switch (message.i) {
    case WorkerIpcIdentifierCodes.WORKER_INIT: {
      slave = new WorkerSlave();
      break;
    }
    default: {
      break;
    }
  }
});
