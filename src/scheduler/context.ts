import { Job } from '../jobs/_job';
import { Connection } from '../server/connection';

export class Context {
    readonly connection: Connection
    readonly jobId: string
    private _status?: string

    constructor (connection: Connection, jobId: string) {
      this.connection = connection;
      this.jobId = jobId;
    }

    get status () {
      return this._status;
    }

    setStatus (status: string | undefined) {
      this._status = status;
    }
}
