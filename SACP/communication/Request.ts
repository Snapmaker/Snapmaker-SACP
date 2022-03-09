import EventEmitter from "events";
import Communication from "../communication/Communication";
import TCPConnection from "../connection/TCPConnection";
import SerialPortConnection from "../connection/SerialPortConnection";
import Packet from "../communication/Packet";
import Header, { Attribute } from "../communication/Header";
import Response from '../communication/Response';

export type HandlerResponse = {
    response: Response;
    packet: Packet | null;
}

export type Callback = (handlerResponse: HandlerResponse) => void;
export default class Request extends EventEmitter {
    communication: Communication | null;

    handlerMap: Map<number, Callback>;

    events: Map<number, Function[]>;

    constructor(type: string, socket: any) {
        super();
        if (!socket) {
            throw new Error('missing socket');
        }

        this.communication = new Communication();
        this.handlerMap = new Map();
        this.events = new Map();

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
            console.log(packet)
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
        // console.log(packet)
        const commandSet = packet.header.commandSet;
        const commandId = packet.header.commandId;
        const businessId = commandSet * 256 + commandId;
        // this is a notification
        if (commandSet === 0x01 && commandId >= 0xa0) {
            console.log(commandSet, commandId)
            const response = new Response(packet.payload);
            const cbs = this.events.get(businessId);
            console.log(cbs)
            cbs?.forEach(cb => {
                cb({ response, packet } as HandlerResponse);
            })
        } else if (packet.header.attribute === Attribute.REQUEST) {
            // a request packet
            const callback = this.handlerMap.get(businessId);
            const response = new Response(packet.payload);
            callback && callback({ response, packet });
        }
    }

    setHandler(commandSet: number, commandId: number, callback: Callback) {
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
                const response = new Response(packet.payload);
                return { response, packet } as HandlerResponse;
            });
        }
        return Promise.reject(new Error('communication not initialize'))
    }

    ack(commandSet: number, commandId: number, payload: Buffer) {
        if (this.communication) {
            const header = new Header();
            header.length = payload.byteLength + 8;
            header.commandSet = commandSet;
            header.commandId = commandId;
            header.attribute = Attribute.ACK;
            header.sequence = this.communication.getSequence();
    
            const packet = new Packet(header, payload);
            return this.communication.send(packet.toBuffer()).then(packet => {
                const response = new Response(packet.payload);
                return { response, packet } as HandlerResponse;
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

    subscribe(commandSet: number, commandId: number, interval: number, callback: Callback) {
        const businessId = commandSet * 256 + commandId;

        let cbs = this.events.get(businessId);
        if (cbs && cbs.length > 0) {
            cbs.push(callback);
            this.events.set(businessId, cbs);
            return Promise.resolve({
                response: { result: 0, data: Buffer.alloc(0) },
                packet: null
            } as HandlerResponse);
        } else {
            const intervalBuffer = Buffer.alloc(2, 0);
            intervalBuffer.writeUint16LE(interval, 0);

            const payload = Buffer.concat([Buffer.from([commandSet, commandId]), intervalBuffer]);
            return this.send(0x01, 0x00, payload).then((res) => {
                // console.log(res)
                if (res.response.result === 0) {
                    if (!cbs) {
                        cbs = [];
                    }
                    cbs.push(callback);
                    this.events.set(businessId, cbs);
                }
                return res;
            });
        }
    }

    unsubscribe(commandSet: number, commandId: number, callback: Callback) {
        const payload = Buffer.from([commandSet, commandId]);
        return this.send(0x01, 0x01, payload).then((res) => {
            if (res.response.result === 0) {
                const commandSet = res.packet!.header.commandSet;
                const commandId = res.packet!.header.commandId;
                const businessId = commandSet * 256 + commandId;

                const cbs = this.events.get(businessId);
                if (cbs && cbs.length > 1) {
                    const index = cbs.indexOf(callback);
                    cbs.splice(index, 1);
                    this.events.set(businessId, cbs);
                } else {
                    this.events.delete(businessId);
                }
            }
            return res;
        });
    }
}
