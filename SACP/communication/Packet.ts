import { calcChecksum } from '../helper';
import Header from './Header';
// import Payload from './Payload';

export default class Packet {
    header: Header;

    payload: Buffer;

    checksum: number;

    constructor(header: Header, payload: Buffer) {
        this.header = header;
        this.payload = payload;
    }

    toBuffer() {
        this.header.updateBuffer();
        const buffer = Buffer.concat([this.header.buffer, this.payload]);
        this.checksum = calcChecksum(buffer, 7, buffer.byteLength - 9);
        return Buffer.concat([buffer, Buffer.from([this.checksum])]);
    }

    static parse(buffer: Buffer) {
        const header = new Header().parse(buffer.slice(0, 13));
        const payload = buffer.slice(13);
        return new Packet(header, payload);
    }
}
