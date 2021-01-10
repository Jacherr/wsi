export interface WsiServerOptions {
    authorization?: string
    heartbeatFrequency?: number
    maxConnections?: number
}

export class WsiServer {
    authorization?: string
    heartbeatFrequency = 30000

    constructor(options: WsiServerOptions = {}) {
        this.authorization = options.authorization
    }
}