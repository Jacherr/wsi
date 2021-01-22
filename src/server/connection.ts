import WebSocket from 'ws';
import { randomBytes } from 'crypto';

import { Packet, PacketIdentifiers, HelloPacket, CloseCodes, HeartbeatAckPacket, JobInitPacket, JobInitAckPacket } from './statics';
import { WsiServer } from './server';

export class Connection {
    readonly server: WsiServer
    readonly socket: WebSocket
    readonly source: string

    private lastHeartbeat: number = Date.now()

    constructor (server: WsiServer, socket: WebSocket, source: string) {
      this.server = server;
      this.socket = socket;
      this.source = source;

      this.socket.on('message', this.onMessage.bind(this));
    }

    close (code?: number, reason?: string) {
      this.close(code, reason);
      this.server.connections.delete(this);
    }

    hello () {
      return this.sendPacket<HelloPacket>({
        i: PacketIdentifiers.HELLO,
        d: {
          heartbeat_interval: this.server.heartbeatFrequency,
          maximum_concurrent_jobs: 5 // todo
        }
      });
    }

    onMessage (message: WebSocket.Data) {
      let packet: Packet;
      try {
        packet = this.parseMessage(message);
      } catch (e) {
        return this.close(CloseCodes.MALFORMED_PACKET, e.message);
      }
      switch (packet.i) {
        case PacketIdentifiers.HEARTBEAT: {
          this.lastHeartbeat = Date.now();
          this.sendPacket<HeartbeatAckPacket>({
            i: PacketIdentifiers.HEARTBEAT_ACK
          });
          break;
        }
        case PacketIdentifiers.JOB_INIT_DATA: {
          break;
        }
        case PacketIdentifiers.JOB_INIT: {
          const parsedPacket = packet as JobInitPacket;
          if (!parsedPacket.d.job) {
            this.socket.close(CloseCodes.MALFORMED_PACKET, 'No job name provided.');
          }
          try {
            this.processJobInit(parsedPacket.d.job, parsedPacket.d.willSendData);
          } catch (e) {
            this.socket.close(CloseCodes.MALFORMED_PACKET, e.message);
          }
          break;
        }
        default: {
          this.close(CloseCodes.MALFORMED_PACKET, 'Invalid packet identifier.');
          break;
        }
      }
    }

    sendJobInitAck (jobId: string, awaitingData: boolean) {
      return this.sendPacket<JobInitAckPacket>({
        i: PacketIdentifiers.JOB_INIT_ACK,
        d: {
          id: jobId,
          awaiting_data: awaitingData
        }
      });
    }

    sendPacket<T = Packet> (data: T) {
      return new Promise((resolve, reject) => {
        this.socket.send(data, (err?: Error) => {
          if (err) reject(err);
          resolve();
        });
      });
    }

    sendStatus (status: string) {
      return this.sendPacket({
        i: PacketIdentifiers.JOB_STATUS,
        d: {
          status
        }
      });
    }

    parseMessage (message: WebSocket.Data): Packet {
      if (typeof (message) !== 'string') throw new Error(`Packets must be valid JSON. (Receieved ${message.constructor.name})`);
      let json;
      try {
        json = JSON.parse(message);
      } catch (e) {
        throw new Error(`Packets must be valid JSON. (${e.message})`);
      }
      if (!json.i) throw new Error('Packets must contain a valid identifier (`i` property)');
      return json;
    }

    pendingJobExpired () {
      this.close(CloseCodes.PENDING_JOB_NOT_SATISFIED, 'A pending job timed out before data was recieved.');
    }

    processJobInit (jobName: string, willSendData: boolean) {
      const connectionHasPendingJob = this.server.scheduler.jobIsPendingFor(this);
      if (connectionHasPendingJob) throw new Error('This connection already has an unsatisfied pending job.');
      const jobId = randomBytes(8).toString('hex');
      try {
        this.server.scheduler.setPendingJob(this, jobId, jobName, willSendData);
      } catch (e) {
        this.close(CloseCodes.INVALID_JOB_REQUEST, e.message);
      }
      this.sendJobInitAck(jobId, true);
    }
}
