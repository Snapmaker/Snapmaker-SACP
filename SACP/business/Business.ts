import EventEmitter from "events";
import Communication from "../communication/Communication";
import TCPConnection from "../connection/TCPConnection";
import SerialPortConnection from "../connection/SerialPortConnection";
import Packet from "../communication/Packet";
import Header, { Attribute } from "../communication/Header";
import Response from '../communication/Response';

export type HandlerResponse = {
    response: Response;
    packet: Packet;
}

type Callback = (handlerResponse: HandlerResponse) => void;
export default class Business extends EventEmitter {
    communication: Communication;

    handlerMap: Map<number, Callback>;

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

    // handle request from Controller or Screen
    private packetHandler(packet: Packet) {
        console.log(packet)
        const commandSet = packet.header.commandSet;
        const commandId = packet.header.commandId;
        const businessId = commandSet * 256 + commandId;
        // this is a notification
        if (commandSet === 0x01 && commandId >= 0xa0) {
            const response = new Response(packet.payload);
            this.emit(`${businessId}`, { response, packet } as HandlerResponse);
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
        const header = new Header();
        header.length = payload.byteLength + 8;
        header.commandSet = commandSet;
        header.commandId = commandId;
        header.attribute = Attribute.REQUEST;
        header.sequence = this.communication.getSequence();
        header.updateBuffer();

        const packet = new Packet(header, payload);
        return this.communication.send(packet.toBuffer()).then(packet => {
            const response = new Response(packet.payload);
            return { response, packet } as HandlerResponse;
        });
    }

    ack(commandSet: number, commandId: number, payload: Buffer) {
        const header = new Header();
        header.length = payload.byteLength + 8;
        header.commandSet = commandSet;
        header.commandId = commandId;
        header.attribute = Attribute.ACK;
        header.sequence = this.communication.getSequence();
        header.updateBuffer();

        const packet = new Packet(header, payload);
        return this.communication.send(packet.toBuffer()).then(packet => {
            const response = new Response(packet.payload);
            return { response, packet } as HandlerResponse;
        });;
    }

    read(buffer: Buffer) {
        this.communication.connection?.read(buffer);
    }

    end() {
        this.communication.connection?.end();
    }

    subscribe(commandSet: number, commandId: number, interval: number, callback: Callback) {
        const businessId = commandSet * 256 + commandId;

        const listeners = this.listeners(`${businessId}`);
        console.log(listeners)
        if (listeners.length > 0) {
            this.on(`${businessId}`, callback);
            return Promise.resolve();
        } else {
            this.on(`${businessId}`, callback);
            const intervalBuffer = Buffer.alloc(2, 0);
            intervalBuffer.writeUint16LE(interval, 0);

            const payload = Buffer.concat([Buffer.from([commandSet, commandId]), intervalBuffer]);
            return this.send(0x01, 0x00, payload).catch(() => {
                callback && this.off(`${businessId}`, callback);
            });
        }
    }

    unsubscribe(commandSet: number, commandId: number, callback: Callback) {
        const payload = Buffer.from([commandSet, commandId]);
        return this.send(0x01, 0x01, payload).then(({ response, packet }) => {
            if (response.result === 0) {
                const commandSet = packet.header.commandSet;
                const commandId = packet.header.commandId;
                const businessId = commandSet * 256 + commandId;
                this.removeAllListeners(`${businessId}`);
            }
        });
    }

    subHeartbeat({ interval = 1000 }, callback: Callback) {
        this.subscribe(0x01, 0xa0, interval, callback);
    }
}
