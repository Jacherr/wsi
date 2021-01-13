import WebSocket from 'ws';

export class Connection {
    readonly socket: WebSocket
    readonly source: string

    constructor(socket: WebSocket, source: string) {
        this.socket = socket;
        this.source = source;
    }
}