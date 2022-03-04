import { calcCRC8, readUint16, readUint8, writeSOF, writeUint16, writeUint8 } from '../helper';

export enum PeerId {
    LUBAN, CONTROLLER, SCREEN
}

export enum Attribute {
    REQUEST, ACK
}

let defaultReceiverId = PeerId.CONTROLLER;
let defaultSenderId = PeerId.LUBAN;

export default class Header {
    static byteLength = 13;

    sof: number = 0xaa55;

    length: number = 0;

    version: number = 0x01;

    receiverId: PeerId = defaultReceiverId;

    crc: number = 0;

    senderId: PeerId = defaultSenderId;

    attribute: Attribute = Attribute.REQUEST;

    sequence: number = 0;

    commandSet: number = 0;

    commandId: number = 0;

    buffer: Buffer = Buffer.alloc(0);

    constructor() {
        this.buffer = Buffer.alloc(Header.byteLength, 0);
        writeSOF(this.buffer, 0, this.sof);
    }

    static updateDefaultReceiverId(id: PeerId) {
        defaultReceiverId = id;
    }

    static updateDefaultSenderId(id: PeerId) {
        defaultSenderId = id;
    }

    updateBuffer() {
        // set the value of properties of Header instance and call this method to update buffer
        writeUint16(this.buffer, 2, this.length);
        writeUint8(this.buffer, 4, this.version);
        writeUint8(this.buffer, 5, this.receiverId);

        this.crc = calcCRC8(this.buffer, 0, 6);

        writeUint8(this.buffer, 6, this.crc);
        writeUint8(this.buffer, 7, this.senderId);
        writeUint8(this.buffer, 8, this.attribute);
        writeUint16(this.buffer, 9, this.sequence);
        writeUint8(this.buffer, 11, this.commandSet);
        writeUint8(this.buffer, 12, this.commandId);
    }

    parse(buffer: Buffer) {
        this.sof = readUint16(buffer, 0);
        this.length = readUint16(buffer, 2);
        this.version = readUint8(buffer, 4);
        this.receiverId = readUint8(buffer, 5);
        this.crc = readUint8(buffer, 6);
        this.senderId = readUint8(buffer, 7);
        this.attribute = readUint8(buffer, 8);
        this.sequence = readUint16(buffer, 9);
        this.commandSet = readUint8(buffer, 11);
        this.commandId = readUint8(buffer, 12);
        return this;
    }
}
