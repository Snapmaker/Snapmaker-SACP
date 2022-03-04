import { readUint8 } from '../helper';

export default class Response {
    result: number;

    data: Buffer;

    constructor(buffer: Buffer) {
        this.result = readUint8(buffer, 0);
        this.data = buffer.slice(1);
    }
}
