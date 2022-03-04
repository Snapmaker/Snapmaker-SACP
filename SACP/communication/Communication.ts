import EventEmitter from 'events';
import ConnectionInterface from '../connection/ConnectionInterface';
import { calcChecksum, calcCRC8 } from '../helper';
import Packet from './Packet';

let globalSequence: number = 0;

type RequestHandler = {
    startTime: number,
    success: Function,
    fail: Function
};

export default class Communication extends EventEmitter {
    private receiving: boolean = false;

    private receiveBuffer: Buffer = Buffer.alloc(0);

    private remainLength: number = 0;

    private requestHandlerMap: Map<number, RequestHandler> = new Map();

    public timeout: number = 0;

    public connection: ConnectionInterface | null = null;

    constructor() {
        super();
    }

    setConnection(connection: ConnectionInterface) {
        this.connection = connection;
    }

    getSequence() {
        globalSequence++;
        globalSequence %= 0xffff; 
        return globalSequence;
    }

    send(buffer: Buffer) {
        return new Promise<Packet>((resolve, reject) => {
            this.requestHandlerMap.set(globalSequence, {
                startTime: Date.now(),
                success: resolve,
                fail: reject
            });
            if (this.connection) {
                // buffer.writeUInt8(0, 8);
                buffer.writeUInt16LE(globalSequence, 9);
                this.connection.write(buffer);
            }
        });
    }

    receive(buffer: Buffer) {
        if (!this.receiving) {
            for (let i = 0; i < buffer.byteLength - 1; i++) {
                if (buffer[i] === 0xaa && buffer[i + 1] == 0x55) {
                    const crc8 = calcCRC8(buffer, i, 6);
                    if (crc8 === buffer[i + 6]) {
                        this.receiving = true;
                        const length = buffer.readUInt16LE(i + 2);
                        if (i + 7 + length <= buffer.byteLength) {
                            this.receiveBuffer = Buffer.concat([this.receiveBuffer, buffer.slice(i, i + 7 + length)])
                            this.remainLength = 0;
                            this.receiving = false;
                            this.reolvePacketBuffer();
                            i = i + 7 + length - 1;
                            continue;
                        } else {
                            this.remainLength = length - (buffer.byteLength - i) + 7;
                            this.receiveBuffer = Buffer.concat([this.receiveBuffer, buffer.slice(i, buffer.byteLength)])
                            break;
                        }
                    }
                }
            }
        } else {
            // receive bytes from next buffer
            console.log(this.remainLength, buffer.byteLength)
            if (this.remainLength >= buffer.byteLength) {
                this.receiveBuffer = Buffer.concat([this.receiveBuffer, buffer.slice(0, buffer.byteLength)]);
                this.remainLength -= buffer.byteLength;
                if (this.remainLength === 0) {
                    this.receiving = false;
                    this.reolvePacketBuffer();
                }
            } else {
                this.receiveBuffer = Buffer.concat([this.receiveBuffer, buffer.slice(0, this.remainLength)]);
                this.remainLength = 0;
                this.receiving = false;
                this.reolvePacketBuffer();
            }
        }
    }

    end() {
        this.receiveBuffer = Buffer.alloc(0);
        this.receiving = false;
        this.remainLength = 0;
    }

    private reolvePacketBuffer() {
        // console.log(1111)
        if (this.validateChecksum(this.receiveBuffer)) {
            // console.log(2221)
            const attribute = this.receiveBuffer.readUInt8(8);
            // console.log(attribute)
            if (attribute === 1) {
                const commandSet = this.receiveBuffer.readUInt8(11);
                const commandId = this.receiveBuffer.readUInt8(12);
                // a notification packet
                if (commandSet === 0x01 && commandId >= 0xa0) {
                    this.emit('request', Packet.parse(this.receiveBuffer));
                } else {
                    // ACK packet
                    const sequence = this.receiveBuffer.readUInt16LE(9);
                    const handler = this.requestHandlerMap.get(sequence);
                    if (handler) {
                        handler.success(Packet.parse(this.receiveBuffer));
                        this.requestHandlerMap.delete(sequence);
                    } else {
                        // invalid packet, drop it
                    }
                }
            } else if (attribute === 0) {
                // request packet
                const sequence = this.receiveBuffer.readUInt16LE(9);
                const handler = this.requestHandlerMap.get(sequence);
                if (handler) {
                    // ack a sent request, this is wrong, need fix
                    handler.success(Packet.parse(this.receiveBuffer));
                    this.requestHandlerMap.delete(sequence);
                } else {
                    this.emit('request', Packet.parse(this.receiveBuffer));
                }
            }
        }
        this.receiveBuffer = Buffer.alloc(0);
    }

    private validateChecksum(buffer: Buffer) {
        const checksum = calcChecksum(buffer, 7, buffer.byteLength - 9);
        console.log(checksum, buffer, buffer.readUInt16LE(buffer.byteLength - 2))
        if (checksum === buffer.readUInt16LE(buffer.byteLength - 2)) {
            console.log(0)
            return true;
        }
        return false;
    }
}
