import { dir } from 'console';
import { readFloat, readString, readUint32, readUint8, stringToBuffer, writeFloat, writeUint32, writeUint8 } from '../../helper';
import { Serializable } from '../../Serializable';

export default class ExtruderOffset implements Serializable {
    key: number;

    index: number;

    direction: number;

    distance: number;

    offsets: any[] = [];

    constructor(key?: number, index?: number, direction?: number, distance?: number) {
        this.key = key ?? 0;
        this.index = index ?? 0;
        this.direction = direction ?? 0
        this.distance = distance ?? 0
    }

    toBuffer(): Buffer {
        const buffer = Buffer.alloc(1 + 1 + 1 + 1 + 4, 0);
        writeUint8(buffer, 0, 1); // array length
        writeUint8(buffer, 1, this.key);
        writeUint8(buffer, 2, this.index);
        writeUint8(buffer, 3, this.direction);
        writeFloat(buffer, 4, this.distance);
        return buffer;
    }

    fromBuffer(buffer: Buffer) {
        const length = readUint8(buffer, 0);
        this.offsets = [];
        for (let i = 0; i < length; i++) {
            const index = readUint8(buffer, 1 + i * 6);
            const direction = readUint8(buffer, 2 + i * 6);
            const distance = readFloat(buffer, 3 + i * 6);
            this.offsets.push({
                index,
                direction,
                distance
            });
        }
        return this.offsets;
    }
}
