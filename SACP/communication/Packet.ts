import { calcChecksum } from '../helper';
import Header from './Header';

export default class Packet {
    header: Header;

    payload: Buffer;

    checksum: Buffer;

    constructor(header: Header, payload: Buffer, checksum?: Buffer) {
        this.header = header;
        this.payload = payload;
        this.checksum = checksum ?? Buffer.alloc(2, 0);
    }

    toBuffer() {
        const buffer = Buffer.concat([this.header.toBuffer(), this.payload]);
        const checksumNumber = calcChecksum(buffer, 7, buffer.byteLength - 7);
        this.checksum = Buffer.alloc(2, 0);
        this.checksum.writeUint16LE(checksumNumber, 0);
        return Buffer.concat([buffer, this.checksum]);
    }

    static parse(buffer: Buffer) {
        const header = new Header().parse(buffer.slice(0, 13));
        const payload = buffer.slice(13, buffer.length - 2);
        const checksum = buffer.slice(buffer.length - 2);
        return new Packet(header, payload, checksum);
    }
}
