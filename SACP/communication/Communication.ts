import EventEmitter from 'events';
import ConnectionInterface from '../connection/ConnectionInterface';
import { calcChecksum, calcCRC8 } from '../helper';

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

    private connection: ConnectionInterface | null = null;

    constructor() {
        super();
    }

    setConnection(connection: ConnectionInterface) {
        this.connection = connection;
    }

    request(buffer: Buffer) {
        globalSequence++;
        globalSequence %= 0xffff; 
        return new Promise((resolve, reject) => {
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
                        } else {
                            this.remainLength = length - (buffer.byteLength - i);
                            this.receiveBuffer = Buffer.concat([this.receiveBuffer, buffer.slice(i, buffer.byteLength)])
                        }
                    }
                    break;
                }
            }
        } else {
            // receive bytes from next buffer
            if (this.remainLength >= buffer.byteLength) {
                this.receiveBuffer = Buffer.concat([this.receiveBuffer, buffer.slice(0, buffer.byteLength)]);
                this.remainLength -= buffer.byteLength;
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
        if (this.validateChecksum(this.receiveBuffer)) {
            const attribute = this.receiveBuffer.readUInt8(8);
            console.log(attribute)
            if (attribute === 1) {
                // ACK packet
                const sequence = this.receiveBuffer.readUInt16LE(9);
                const handler = this.requestHandlerMap.get(sequence);
                if (handler) {
                    handler.success(this.receiveBuffer);
                    this.requestHandlerMap.delete(sequence);
                } else {
                    // const commandSet = this.receiveBuffer.readUInt8(11);
                    // const commandId = this.receiveBuffer.readUInt8(12);
                    // // a notification packet
                    // if (commandSet === 0x01 && commandId >= 0xa0) {
                    // }
                    this.emit('request', this.receiveBuffer);
                }
            } else if (attribute === 0) {
                // request packet
                this.emit('request', this.receiveBuffer);
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
