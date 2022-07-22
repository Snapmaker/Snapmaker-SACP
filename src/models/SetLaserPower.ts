import { writeFloat, writeUint8 } from '../helper';
import { Serializable } from '../types';

export default class SetLaserPower implements Serializable {
    key: number;

    power: number;

    constructor(key?: number, power?: number) {
        this.key = key ?? 0;
        this.power = power ?? 0;
    }

    toBuffer(): Buffer {
        const buffer = Buffer.alloc(1 + 4, 0);
        writeUint8(buffer, 0, this.key);
        writeFloat(buffer, 1, this.power);
        return buffer;
    }

    fromBuffer() {
    }
}
