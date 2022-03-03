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

    updateChecksum() {
        this.header.updateBuffer();
        const buffer = Buffer.concat([this.header.buffer, this.payload]);
        this.checksum = calcChecksum(buffer, 7, buffer.byteLength - 9);
    }

    parse(buffer: Buffer) {
        
    }
}
