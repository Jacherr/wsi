import WebSocket, { Server } from 'ws';
import { IncomingMessage } from 'http';

import { Connection } from './connection';
import { CloseCodes } from './statics';

export interface WsiServerOptions {
    authorization?: string
    heartbeatFrequency?: number
    isProxied?: boolean
    maxConnections?: number
    maxConnectionsPerSourceIp?: number
    port?: number
}

export class WsiServer {
    readonly authorization?: string
    readonly connections = new Map<number, Connection>()
    readonly heartbeatFrequency: number = 30000
    readonly isProxied: boolean = false
    readonly maxConnections: number = 5
    readonly maxConnectionsPerSourceIp: number = 1

    private connectionsLength = 0
    private wss: Server

    constructor(options: WsiServerOptions = {}, cb?: () => void) {
        this.authorization = options.authorization;
        this.heartbeatFrequency = options.heartbeatFrequency ?? this.heartbeatFrequency;
        this.isProxied = options.isProxied ?? this.isProxied;
        this.maxConnections = options.maxConnections ?? this.maxConnections;
        this.maxConnectionsPerSourceIp = options.maxConnectionsPerSourceIp ?? this.maxConnectionsPerSourceIp;

        this.wss = new Server({
            port: options.port ?? 51432
        }, cb);

        this.wss.on('connection', this.onConnection.bind(this));
    }

    onConnection(socket: WebSocket, request: IncomingMessage) {
        const { headers } = request;
        const [authorization, originIp] = [headers['authorization'], this.isProxied ? headers['x-forwarded-for'] : request.socket.remoteAddress];
        const sourceIp = Array.isArray(originIp) ? originIp[0] : originIp;

        if(!originIp) {
            return socket.close(CloseCodes.UNIDENTIFIED_SOURCE, 'The server was unable to parse the source IP from your connection request.')
        } else if(!authorization || authorization !== this.authorization) {
            return socket.close(CloseCodes.UNAUTHORIZED, 'Authorization missing or invalid.');
        } else if(this.connectionsLength === this.maxConnections) {
            return socket.close(CloseCodes.CONNECTION_LIMIT_REACHED, 'This server has reached its connection limit.')
        }

        const connectionsOnIp = Array.from(this.connections.values()).filter(c => c.source === sourceIp).length;
        if(connectionsOnIp === this.maxConnectionsPerSourceIp) {
            return socket.close(CloseCodes.IP_DEPENDANT_CONNECTION_LIMIT_REACHED, 'You have reached the maximum number of concurrent connections on this IP.')
        }

        this.connections.set(this.connectionsLength, new Connection(socket, sourceIp as string));
        this.connectionsLength++;
    }
}