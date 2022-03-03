import { readUint32, readUint8 } from '../helper';

enum Direction {
    X1, Y1, Z1, A1, B1, C1, X2
}

export default class CoordinateInfo {
    static byteLength: number = 5;

    key: Direction;

    value: number;

    constructor(buffer: Buffer) {
        this.key = readUint8(buffer) as Direction;
        this.value = readUint32(buffer, 1) / 1000;
    }

    static parseArray(buffer: Buffer): CoordinateInfo[] {
        const result = [];
        for (let i = 0; i < buffer.length; i += CoordinateInfo.byteLength) {
            const info = buffer.slice(i, i + CoordinateInfo.byteLength);
            result.push(new CoordinateInfo(info));
        }
        return result;
    }
}
