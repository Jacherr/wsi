import { Worker as WorkerThread } from 'worker_threads';
import { WorkerIpcMessage, WorkerIpcIdentifierCodes, WorkerStates } from './statics';
import { ActiveJob } from '../scheduler/statics';

export class WorkerMaster {
    private jobProcessing?: ActiveJob
    private slave: WorkerThread
    private state: WorkerStates
    private timeSinceStateChange: number = Date.now()

    constructor () {
      this.state = WorkerStates.IDLE;
      this.slave = new WorkerThread('./worker/slave');
      this.slave.on('error', this.onError.bind(this));
      this.slave.on('exit', this.onExit.bind(this));
      this.slave.on('message', this.onMessage.bind(this));
      this.slave.on('online', this.onSpawn.bind(this));
      this.send({
        i: WorkerIpcIdentifierCodes.WORKER_INIT
      });
    }

    get processing () {
      return this.jobProcessing;
    }

    private onError (err: Error) {
      console.error(err);
    }

    private onExit () {
      this.state = WorkerStates.IDLE;
      this.slave = this.slave = new WorkerThread('./worker/slave');
    }

    private onMessage (message: WorkerIpcMessage) {
      switch (message.i) {
        default: {
          break;
        }
      }
    }

    private onSpawn () {
      this.state = WorkerStates.IDLE;
    }

    private send (message: WorkerIpcMessage) {
      this.slave.postMessage(message);
    }

    stopJob () {
      if (this.state !== WorkerStates.PROCESSING) {
        throw new Error('This worker is not processing a job.');
      }
      return this.slave.terminate();
    }
}
