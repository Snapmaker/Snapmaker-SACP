import EventEmitter from 'events';
import ConnectionInterface from '../connection/ConnectionInterface';
import { calcChecksum, calcCRC8 } from '../helper';
import { Attribute } from './Header';
import Packet from './Packet';

type RequestHandler = {
    startTime: number,
    success: (pkt: Packet) => void,
    fail: Function
};

export default class Communication extends EventEmitter {
    private receiving: boolean = false;

    private receiveBuffer: Buffer = Buffer.alloc(0);

    private remainLength: number = 0;

    private requestHandlerMap: Map<string, RequestHandler> = new Map();

    public timeout: number = 0;

    public connection: ConnectionInterface | null = null;

    private sequence: number = 0;

    dispose() {
        this.receiveBuffer = Buffer.alloc(0);
        this.receiving = false;
        this.remainLength = 0;
        this.timeout = 0;
        this.requestHandlerMap.clear();
        this.connection = null;
    }

    resetSequence() {
        this.sequence = 0;
    }

    setInitialSequence(num: number) {
        this.sequence = num;
    }

    getReceiveBuffer() {
        const tempBuffer = Buffer.alloc(this.receiveBuffer.length);
        this.receiveBuffer.copy(tempBuffer);
        return tempBuffer;
    }

    setConnection(connection: ConnectionInterface) {
        this.connection = connection;
    }

    getSequence() {
        this.sequence++;
        this.sequence %= 0xffff;
        return this.sequence;
    }

    send(requestId: string, buffer: Buffer, needReply: boolean = true) {
        if (buffer.length >= 15) {
            if (needReply) {
                return new Promise<Packet>((resolve, reject) => {
                    // empty payload buffer should be length of 15
                    this.requestHandlerMap.set(requestId, {
                        startTime: Date.now(),
                        success: resolve,
                        fail: reject
                    });
                    this.connection && this.connection.write(buffer);
                });
            } else {
                this.connection && this.connection.write(buffer);
                return Promise.resolve();
            }
        } else {
            return Promise.reject(new Error('invalid SACP packet'));
        }
    }

    receive(buffer: Buffer) {
        if (!this.receiving) {
            for (let i = 0; i < buffer.byteLength - 1; i++) {
                if (buffer[i] === 0xaa && buffer[i + 1] === 0x55) {
                    const crc8 = calcCRC8(buffer, i, 6);
                    if (crc8 === buffer[i + 6]) {
                        this.receiving = true;
                        const length = buffer.readUInt16LE(i + 2);
                        if (i + 7 + length <= buffer.byteLength) {
                            this.receiveBuffer = Buffer.concat([this.receiveBuffer, buffer.slice(i, i + 7 + length)]);
                            this.remainLength = 0;
                            this.receiving = false;
                            this.reolvePacketBuffer();
                            i = i + 7 + length - 1;
                            continue;
                        } else {
                            this.remainLength = length - (buffer.byteLength - i) + 7;
                            this.receiveBuffer = Buffer.concat([this.receiveBuffer, buffer.slice(i, buffer.byteLength)]);
                            break;
                        }
                    }
                }
            }
        } else {
            // receive bytes from next buffer
            if (this.remainLength >= buffer.byteLength) {
                this.receiveBuffer = Buffer.concat([this.receiveBuffer, buffer.slice(0, buffer.byteLength)]);
                this.remainLength -= buffer.byteLength;
                if (this.remainLength === 0) {
                    this.receiving = false;
                    this.reolvePacketBuffer();
                }
            } else {
                this.receiveBuffer = Buffer.concat([this.receiveBuffer, buffer.slice(0, this.remainLength)]);
                const nextBuffer = buffer.slice(this.remainLength);
                this.remainLength = 0;
                this.receiving = false;
                this.reolvePacketBuffer();

                if (nextBuffer && nextBuffer.length > 0) {
                    this.receive(nextBuffer);
                }
            }
        }
    }

    end() {
        this.receiveBuffer = Buffer.alloc(0);
        this.receiving = false;
        this.remainLength = 0;
    }

    private reolvePacketBuffer() {
        if (this.validateChecksum(this.receiveBuffer)) {
            const packet = new Packet().fromBuffer(this.receiveBuffer);
            const attribute = packet.header.attribute;
            if (attribute === Attribute.ACK) {
                const sequence = packet.header.sequence;
                const commandSet = packet.header.commandSet;
                const commandId = packet.header.commandId;
                const businessId = commandSet * 256 + commandId;
                const requestId = `${businessId}-${sequence}`;
                const handler = this.requestHandlerMap.get(requestId);
                if (handler) {
                    // console.log('reolvePacketBuffer', this.receiveBuffer);
                    // ACK packet related to request
                    handler.success(packet);
                    this.requestHandlerMap.delete(requestId);
                } else {
                    // notification packet
                    this.emit('request', packet);
                }
            } else if (attribute === Attribute.REQUEST) {
                this.emit('request', packet);
            }
        }
        this.receiveBuffer = Buffer.alloc(0);
    }

    private validateChecksum(buffer: Buffer) {
        const checksum = calcChecksum(buffer, 7, buffer.byteLength - 9);
        if (checksum === buffer.readUInt16LE(buffer.byteLength - 2)) {
            return true;
        }
        return false;
    }
}
