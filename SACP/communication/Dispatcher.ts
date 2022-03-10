import EventEmitter from "events";
import Communication from "../communication/Communication";
import TCPConnection from "../connection/TCPConnection";
import SerialPortConnection from "../connection/SerialPortConnection";
import Packet from "../communication/Packet";
import Header, { Attribute } from "../communication/Header";
import Response from '../communication/Response';

export type ResponseData = {
    response: Response;
    packet: Packet;
}

export type RequestParam = {
    param: Buffer,
    packet: Packet
}

export type ResponseCallback = (data: ResponseData) => void;
export type RequestCallback = (data: RequestParam) => void;

export default class Dispatcher extends EventEmitter {
    communication: Communication | null;

    handlerMap: Map<number, RequestCallback>;

    constructor(type: string, socket: any) {
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

        this.communication.on('request', (packet) => {
            this.packetHandler(packet);
        });
    }

    dispose() {
        this.communication?.dispose();
        this.communication = null;
        this.handlerMap.clear();
    }

    // handle request from Controller or Screen
    private packetHandler(packet: Packet) {
        const commandSet = packet.header.commandSet;
        const commandId = packet.header.commandId;
        const businessId = commandSet * 256 + commandId;
        // this is a notification
        if (commandSet === 0x01 && commandId >= 0xa0) {
            const response = new Response().fromBuffer(packet.payload);
            this.emit(`${businessId}`, { response, packet } as ResponseData);
        } else if (packet.header.attribute === Attribute.REQUEST) {
            // a request packet
            const callback = this.handlerMap.get(businessId);
            // console.log(callback, packet)
            callback && callback({ param: packet.payload, packet });
        }
    }

    setHandler(commandSet: number, commandId: number, callback: RequestCallback) {
        const businessId = commandSet * 256 + commandId;
        this.handlerMap.set(businessId, callback);
    }

    send(commandSet: number, commandId: number, payload: Buffer) {
        if (this.communication) {
            const header = new Header();
            header.length = payload.byteLength + 8;
            header.commandSet = commandSet;
            header.commandId = commandId;
            header.attribute = Attribute.REQUEST;
            header.sequence = this.communication.getSequence();
    
            const packet = new Packet(header, payload);
            return this.communication.send(packet.toBuffer()).then(packet => {
                const response = new Response().fromBuffer(packet.payload);
                return { response, packet } as ResponseData;
            });
        }
        return Promise.reject(new Error('communication not initialize'))
    }

    ack(commandSet: number, commandId: number, requestPacket: Packet, payload: Buffer) {
        if (this.communication) {
            const header = new Header();
            header.length = payload.byteLength + 8;
            header.commandSet = commandSet;
            header.commandId = commandId;
            header.attribute = Attribute.ACK;
            header.sequence = requestPacket.header.sequence;
    
            const packet = new Packet(header, payload);
            console.log('ack', packet.toBuffer())
            return this.communication.send(packet.toBuffer()).then(packet => {
                const response = new Response().fromBuffer(packet.payload);
                return { response, packet } as ResponseData;
            });;
        }
        return Promise.reject(new Error('communication not initialize'))
    }

    read(buffer: Buffer) {
        this.communication?.connection?.read(buffer);
    }

    end() {
        this.communication?.connection?.end();
    }

    subscribe(commandSet: number, commandId: number, interval: number, callback: ResponseCallback) {
        const businessId = `${commandSet * 256 + commandId}`;

        if (this.listenerCount(businessId) > 0) {
            this.on(businessId, callback);
            return Promise.resolve({
                response: new Response(),
                packet: new Packet()
            } as ResponseData);
        } else {
            const intervalBuffer = Buffer.alloc(2, 0);
            intervalBuffer.writeUint16LE(interval, 0);

            const payload = Buffer.concat([Buffer.from([commandSet, commandId]), intervalBuffer]);
            return this.send(0x01, 0x00, payload).then((res) => {
                if (res.response?.result === 0) {
                    this.on(businessId, callback);
                }
                return res;
            });
        }
    }

    unsubscribe(commandSet: number, commandId: number, callback: ResponseCallback) {
        const payload = Buffer.from([commandSet, commandId]);
        return this.send(0x01, 0x01, payload).then((res) => {
            if (res.response?.result === 0) {
                const commandSet = res.packet.header.commandSet;
                const commandId = res.packet.header.commandId;
                const businessId = `${commandSet * 256 + commandId}`;
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
