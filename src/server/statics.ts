// statics.ts: types & constants for ./server

export enum CloseCodes {
    CONNECTION_LIMIT_REACHED = 4001,
    IP_DEPENDANT_CONNECTION_LIMIT_REACHED = 4002,
    UNAUTHORIZED = 4003,
    UNIDENTIFIED_SOURCE = 4004,
    CONNECTION_RATELIMITED = 4005
}

export enum PacketIdentifiers {
    HELLO
}

export interface InvalidConnectionAttempt {
    count: number
    expire: number
}

export type Serializable = string | number | boolean
export type RawPacket = { [key: string]: Serializable }
export interface Packet {
    i: PacketIdentifiers
    d: RawPacket
}

export interface HelloPacket extends Packet {
    i: PacketIdentifiers.HELLO
    d: {
        heartbeat_interval: number
        maximum_concurrent_jobs: number
    }
}