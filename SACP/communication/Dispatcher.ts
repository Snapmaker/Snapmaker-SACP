import EventEmitter from 'events';
import Communication from './Communication';
import TCPConnection from '../connection/TCPConnection';
import SerialPortConnection from '../connection/SerialPortConnection';
import Packet from './Packet';
import Header, { Attribute, PeerId } from './Header';
import Response from './Response';
import { writeUint16 } from '../helper';

export type ResponseData = {
    response: Response;
    packet: Packet;
    data?: any;
}

export type RequestData = {
    param: Buffer,
    packet: Packet
}

export type ResponseCallback = (data: ResponseData) => void;
export type RequestCallback = (data: RequestData) => void;

export default class Dispatcher extends EventEmitter {
    communication: Communication | null;

    handlerMap: Map<number, RequestCallback>;

    writeLog: Function | undefined;

    constructor(type: string, socket: any, writeLog: Function | undefined = undefined) {
        super();
        if (!socket) {
            throw new Error('missing socket');
        }

        this.communication = new Communication();
        this.handlerMap = new Map();

        let connection;
        if (type === 'tcp') {
            connection = new TCPConnection(this.communication, socket);
        } else if (type === 'serialport') {
            connection = new SerialPortConnection(this.communication, socket);
        } else {
            throw new Error('missing type');
        }
        this.communication.setConnection(connection);

        this.communication.on('request', (packet: Packet) => {
            this.packetHandler(packet);
        });

        this.writeLog = writeLog;
    }

    dispose() {
        if (this.communication) {
            this.communication.dispose();
            this.communication = null;
        }
        this.handlerMap.clear();
    }

    resetBuffer() {
        if (this.communication) {
            this.communication.end();
        }
    }

    // handle request from Controller or Screen
    private packetHandler(packet: Packet) {
        const businessId = this.evalBusinessId(packet.header.commandSet, packet.header.commandId);
        const businessIdStr = `${businessId}`;
        // this is a notification
        if (this.listenerCount(businessIdStr) > 0) {
            const response = new Response().fromBuffer(packet.payload);
            this.emit(businessIdStr, { response, packet } as ResponseData);
        } else if (packet.header.attribute === Attribute.REQUEST) {
            // a request packet
            const callback = this.handlerMap.get(businessId);
            callback && callback({ param: packet.payload, packet } as RequestData);
        }
    }

    setHandler(commandSet: number, commandId: number, callback: RequestCallback) {
        const businessId = this.evalBusinessId(commandSet, commandId);
        this.handlerMap.set(businessId, callback);
    }

    unsetHandler(commandSet: number, commandId: number) {
        const businessId = this.evalBusinessId(commandSet, commandId);
        this.handlerMap.delete(businessId);
    }

    evalBusinessId(commandSet: number, commandId: number) {
        return commandSet * 256 + commandId;
    }

    send(commandSet: number, commandId: number, peerId: PeerId = PeerId.CONTROLLER, payload: Buffer) {
        if (this.communication) {
            const header = new Header();
            header.length = payload.byteLength + 8;
            header.commandSet = commandSet;
            header.commandId = commandId;
            header.attribute = Attribute.REQUEST;
            header.receiverId = peerId;
            header.sequence = this.communication.getSequence();

            const packet = new Packet(header, payload);
            this.writeLog && this.writeLog(`Send: ${packet.toBuffer().toString('hex')}`);
            // console.log('send before send:', packet.toBuffer());
            const businessId = this.evalBusinessId(commandSet, commandId);
            return this.communication.send(`${businessId}-${header.sequence}`, packet.toBuffer()).then(resPacket => {
                const response = new Response().fromBuffer(resPacket!.payload);
                return { response, packet: resPacket } as ResponseData;
            });
        }
        return Promise.reject(new Error('communication not initialize'));
    }

    ack(commandSet: number, commandId: number, requestPacket: Packet, payload: Buffer) {
        if (this.communication) {
            const header = new Header();
            header.length = payload.byteLength + 8;
            header.commandSet = commandSet;
            header.commandId = commandId;
            header.attribute = Attribute.ACK;
            header.sequence = requestPacket.header.sequence;
            header.receiverId = requestPacket.header.senderId;

            const packet = new Packet(header, payload);
            this.writeLog && this.writeLog(`Ack: ${packet.toBuffer().toString('hex')}`);
            // console.log('ack before send:', packet.toBuffer());
            const businessId = this.evalBusinessId(commandSet, commandId);
            return this.communication.send(`${businessId}-${header.sequence}`, packet.toBuffer(), false);
        }
        return Promise.reject(new Error('communication not initialize'));
    }

    read(buffer: Buffer) {
        if (this.communication && this.communication.connection) {
            this.communication.connection.read(buffer);
        }
    }

    end() {
        if (this.communication && this.communication.connection) {
            this.communication.connection.end();
        }
    }

    subscribe(commandSet: number, commandId: number, interval: number, callback: ResponseCallback) {
        const businessIdStr = `${this.evalBusinessId(commandSet, commandId)}`;
        if (this.listenerCount(businessIdStr) > 0) {
            if (this.listeners(businessIdStr).indexOf(callback) === -1) {
                this.on(businessIdStr, callback);
            }
            return Promise.resolve({
                response: new Response(),
                packet: new Packet()
            } as ResponseData);
        } else {
            const intervalBuffer = Buffer.alloc(2, 0);
            writeUint16(intervalBuffer, 0, interval);

            const payload = Buffer.concat([Buffer.from([commandSet, commandId]), intervalBuffer]);
            return this.send(0x01, 0x00, PeerId.CONTROLLER, payload).then((res) => {
                if (res.response?.result === 0) {
                    this.on(businessIdStr, callback);
                }
                return res;
            });
        }
    }

    unsubscribe(commandSet: number, commandId: number, callback: ResponseCallback) {
        const payload = Buffer.from([commandSet, commandId]);
        return this.send(0x01, 0x01, PeerId.CONTROLLER, payload).then((res) => {
            if (res.response?.result === 0) {
                const businessId = `${this.evalBusinessId(commandSet, commandId)}`;
                if (this.listenerCount(businessId) > 1) {
                    this.removeListener(businessId, callback);
                } else {
                    this.removeAllListeners(businessId);
                }
            }
            return res;
        });
    }
}
