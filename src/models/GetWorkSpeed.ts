import { readUint8, readInt16 } from '@/helper';
import { Serializable } from  '@/types';

export default class Laserinfo implements Serializable {
    key: number;

    feedRate: number;

    constructor(key?: number, zoneList?: any) {
        this.key = key ?? 0;
    }

    toBuffer(): Buffer {
        const buffer = Buffer.alloc(1, 0);
        writeUint8(buffer, 0, this.key);
        return buffer;
    }

    fromBuffer(buffer: Buffer) {
        this.key = readUint8(buffer, 0);
        this.feedRate = readInt16(buffer, 1);
        return this;
    }
}
