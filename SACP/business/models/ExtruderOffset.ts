import { dir } from 'console';
import { readFloat, readString, readUint32, readUint8, stringToBuffer, writeFloat, writeUint32, writeUint8 } from '../../helper';
import { Serializable } from '../../Serializable';

export default class ExtruderOffset implements Serializable {
    key: number;
    index: number;
    direction: number;
    distance: number

    constructor(key?: number, index?: number, direction?: number, distance?: number) {
        this.key = key ?? 0;
        this.index = index ?? 0;
        this.direction = direction ?? 0
        this.distance = distance ?? 0
    }

    toBuffer(): Buffer {
        const buffer = Buffer.alloc(1 + 1 + 1 + 4, 0);
        writeUint8(buffer, 0, this.key);
        writeUint8(buffer, 1, this.index);
        writeUint8(buffer, 2, this.distance);
        writeFloat(buffer, 3, this.distance);
        return buffer;
    }

    fromBuffer(buffer: Buffer) {
        this.index = readUint8(buffer, 1);
        this.distance = readUint8(buffer, 2);
        this.distance = readFloat(buffer, 3);
    }
}
