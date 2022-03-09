import { readUint32, readUint8 } from '../../helper';

enum Direction {
    X1, Y1, Z1, A1, B1, C1, X2
}

export default class CoordinateInfo {
    static byteLength: number = 5;

    key: Direction;

    value: number;

    constructor(buffer: Buffer) {
        console.log(buffer)
        this.key = readUint8(buffer) as Direction;
        this.value = readUint32(buffer, 1) / 1000;
    }

    static parseArray(buffer: Buffer): CoordinateInfo[] {
        const result = [];
        const arrLength = buffer.readUint8(0);
        const targetBuffer = buffer.slice(1);
        for (let i = 0; i < arrLength; i++) {
            const info = targetBuffer.slice(i * CoordinateInfo.byteLength, (i + 1) * CoordinateInfo.byteLength);
            result.push(new CoordinateInfo(info));
        }
        return result;
    }
}
