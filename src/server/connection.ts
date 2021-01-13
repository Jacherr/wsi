import WebSocket from 'ws';
import { RawPacket, Packet, PacketIdentifiers, HelloPacket } from './statics';
import { WsiServer } from './server';

export class Connection {
    readonly server: WsiServer
    readonly socket: WebSocket
    readonly source: string

    constructor(server: WsiServer, socket: WebSocket, source: string) {
        this.server = server;
        this.socket = socket;
        this.source = source;

        this.socket.on('message', this.onMessage.bind(this));
    }

    hello() {
        return this.sendPacket<HelloPacket>({
            i: PacketIdentifiers.HELLO,
            d: {
                heartbeat_interval: this.server.heartbeatFrequency,
                maximum_concurrent_jobs: 5  // todo
            }
        })
    }

    onMessage(message: WebSocket.Data) {
        
    }

    sendPacket<T = Packet>(data: T) {
        return new Promise((resolve, reject) => {
            this.socket.send(data, (err?: Error) => {
                if(err) reject(err);
                resolve();
            });
        })
    }
}