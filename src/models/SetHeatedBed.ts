import { writeUint16, writeUint8 } from '../helper';
import { Serializable } from '../types';

export default class SetHeatedBed implements Serializable {
    key: number;

    zoneIndex: number;

    temperature: number;

    constructor(key: number, zoneIndex: number, temperature: number) {
        this.key = key;
        this.zoneIndex = zoneIndex;
        this.temperature = temperature;
    }

    toBuffer(): Buffer {
        const buffer = Buffer.alloc(4, 0);
        writeUint8(buffer, 0, this.key);
        writeUint8(buffer, 1, this.zoneIndex);
        writeUint16(buffer, 2, this.temperature);
        return buffer;
    }

    fromBuffer() {
        return this;
    }
}
