import { readFloat, readUint8, writeFloat, writeUint8 } from '../helper';
import { Serializable } from '../types';

export default class ExtruderOffset implements Serializable {
    key: number;

    index: number;

    distance: number;

    offsets: any[] = [];

    constructor(key?: number, index?: number, distance?: number) {
        this.key = key ?? 0;
        this.index = index ?? 0;
        this.distance = distance ?? 0;
    }

    toBuffer(): Buffer {
        const buffer = Buffer.alloc(1 + 1 + 1 + 1 + 4, 0);
        writeUint8(buffer, 0, this.key);
        writeUint8(buffer, 1, this.index);
        writeFloat(buffer, 2, this.distance);
        return buffer;
    }

    fromBuffer(buffer: Buffer) {
        // TODO
        this.key = readUint8(buffer, 0);
        const length = readUint8(buffer, 1);
        for (let i = 0; i < length; i++) {
            const index = readUint8(buffer, 2 + i * 3);
            const distance = readFloat(buffer, 3 + i * 3);
            this.offsets.push({
                index,
                distance
            });
        }
        return this.offsets;
    }
}
