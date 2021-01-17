// statics.ts: types & constants for ./server

export enum CloseCodes {
    CONNECTION_LIMIT_REACHED = 4001,
    IP_DEPENDANT_CONNECTION_LIMIT_REACHED = 4002,
    UNAUTHORIZED = 4003,
    UNIDENTIFIED_SOURCE = 4004,
    CONNECTION_RATELIMITED = 4005,
    MALFORMED_PACKET = 4006,
    PENDING_JOB_NOT_SATISFIED = 4007
}

export enum PacketIdentifiers {
    HELLO,
    HEARTBEAT,
    HEARTBEAT_ACK,
    HEATBEAT_NOT_RECIEVED,
    JOB_COMPLETE,
    JOB_COMPLETE_ACK,
    JOB_COMPLETE_DATA,
    JOB_FAIL,
    JOB_INIT,
    JOB_INIT_ACK,
    JOB_INIT_DATA,
    JOB_STATUS
}

export interface InvalidConnectionAttempt {
    count: number
    expire: number
}

export type Serializable = string | number | boolean
export type RawPacket = { [key: string]: Serializable }
export interface Packet {
    i: PacketIdentifiers
    d?: RawPacket
}

export interface HelloPacket extends Packet {
    i: PacketIdentifiers.HELLO
    d: {
        heartbeat_interval: number
        maximum_concurrent_jobs: number
    }
}

export interface HeartbeatPacket extends Packet {
    i: PacketIdentifiers.HEARTBEAT
}

export interface HeartbeatAckPacket extends Packet {
    i: PacketIdentifiers.HEARTBEAT_ACK
}

export interface JobInitPacket extends Packet {
    i: PacketIdentifiers.JOB_INIT
    d: {
        job: string
    }
}

export interface JobInitAckPacket extends Packet {
    i: PacketIdentifiers.JOB_INIT_ACK,
    d: {
        id: string
        awaiting_data: boolean
    }
}
