import WebSocket, { Server } from 'ws';
import { IncomingMessage } from 'http';

import { Connection } from './connection';
import { CloseCodes, InvalidConnectionAttempt } from './statics';
import { Wsi } from '../api';

export interface WsiServerOptions {
    authorization?: string
    heartbeatFrequency?: number
    invalidConnectionsRatelimitLimit?: number
    invalidConnectionsRatelimitReset?: number
    isProxied?: boolean
    maxConnections?: number
    maxConnectionsPerSourceIp?: number
    port?: number
}

export class WsiServer {
    readonly api: Wsi
    readonly authorization?: string
    readonly connections = new Set<Connection>()
    readonly heartbeatFrequency: number = 30000
    readonly invalidConnectionAttempts = new Map<string, InvalidConnectionAttempt>()
    readonly invalidConnectionsRatelimitLimit: number = 3
    readonly invalidConnectionsRatelimitReset: number = 60000
    readonly isProxied: boolean = false
    readonly maxConnections: number = 5
    readonly maxConnectionsPerSourceIp: number = 1

    private connectionsLength = 0
    private wss: Server

    constructor (api: Wsi, options: WsiServerOptions = {}, cb?: () => void) {
      this.api = api;
      this.authorization = options.authorization;
      this.heartbeatFrequency = options.heartbeatFrequency ?? this.heartbeatFrequency;
      this.invalidConnectionsRatelimitLimit =
            options.invalidConnectionsRatelimitLimit ?? this.invalidConnectionsRatelimitLimit;
      this.invalidConnectionsRatelimitReset =
            options.invalidConnectionsRatelimitReset ?? this.invalidConnectionsRatelimitReset;
      this.isProxied = options.isProxied ?? this.isProxied;
      this.maxConnections = options.maxConnections ?? this.maxConnections;
      this.maxConnectionsPerSourceIp = options.maxConnectionsPerSourceIp ?? this.maxConnectionsPerSourceIp;

      this.wss = new Server({
        port: options.port ?? 51432
      }, cb);

      this.wss.on('connection', this.onConnection.bind(this));
    }

    get scheduler () {
      return this.api.scheduler;
    }

    private connectionRatelimitExceeded (sourceIp: string) {
      const data = this.invalidConnectionAttempts.get(sourceIp);
      if (!data) return false;
      else {
        if (Date.now() > data?.expire) {
          this.invalidConnectionAttempts.delete(sourceIp);
          return false;
        }
        if (data.count >= this.invalidConnectionsRatelimitLimit) return true;
        return false;
      }
    }

    onConnection (socket: WebSocket, request: IncomingMessage) {
      const { headers } = request;
      const [authorization, originIp] = [headers.authorization, this.isProxied ? headers['x-forwarded-for'] : request.socket.remoteAddress];
      const sourceIp = Array.isArray(originIp) ? originIp[0] : originIp;

      if (!sourceIp) {
        return socket.close(CloseCodes.UNIDENTIFIED_SOURCE, 'The server was unable to parse the source IP from your connection request.');
      } else if (this.connectionRatelimitExceeded(sourceIp)) {
        return socket.close(CloseCodes.CONNECTION_RATELIMITED, 'You are being rate limited.');
      } else if (this.authorization && (!authorization || authorization !== this.authorization)) {
        this.updateInvalidConnectionAttempts(sourceIp);
        return socket.close(CloseCodes.UNAUTHORIZED, 'Authorization missing or invalid.');
      } else if (this.connectionsLength === this.maxConnections) {
        return socket.close(CloseCodes.CONNECTION_LIMIT_REACHED, 'This server has reached its connection limit.');
      }

      const connectionsOnIp = Array.from(this.connections.values()).filter(c => c.source === sourceIp).length;
      if (connectionsOnIp === this.maxConnectionsPerSourceIp) {
        return socket.close(CloseCodes.IP_DEPENDANT_CONNECTION_LIMIT_REACHED, 'You have reached the maximum number of concurrent connections on this IP.');
      }

      const connection = new Connection(this, socket, sourceIp as string);

      this.connections.add(connection);
      this.connectionsLength++;

      connection.hello();
    }

    private updateInvalidConnectionAttempts (sourceIp: string) {
      const data = this.invalidConnectionAttempts.get(sourceIp);
      if (data) {
        this.invalidConnectionAttempts.set(sourceIp, {
          count: data.count + 1,
          expire: data.expire
        });
      } else {
        this.invalidConnectionAttempts.set(sourceIp, {
          count: 1,
          expire: Date.now() + this.invalidConnectionsRatelimitReset
        });
      }
    }
}
