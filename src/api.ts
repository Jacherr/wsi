import { WsiServer, WsiServerOptions } from "./server/server";
import { Scheduler, SchedulerOptions } from "./scheduler/scheduler";
import { Job } from "./jobs/_job";

export interface WsiOptions extends WsiServerOptions, SchedulerOptions {

}

export class Wsi {
    readonly jobs: Job[] = []
    readonly scheduler: Scheduler
    readonly server: WsiServer

    constructor(options: WsiOptions = {}) {
        this.scheduler = new Scheduler(options);
        this.server = new WsiServer(this, options);
    }
}