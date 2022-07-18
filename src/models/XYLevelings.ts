import { Serializable } from '@/types';
import { readFloat, readUint8, writeFloat, writeUint8 } from '@/helper';

export default class XYLevelings implements Serializable {
    /**
     * xyLeveling: {
     *     axis: 0(x), 1(y)
     *     offset: float
     * }
     */

    constructor(public xyLevelings: any = []) {
        this.xyLevelings = xyLevelings || [];
    }

    toBuffer(): Buffer {
        const buffer = Buffer.alloc(1 + this.xyLevelings.length * 5, 0);
        writeUint8(buffer, 0, this.xyLevelings.length);
        for (let i = 0; i < this.xyLevelings.length; i++) {
            writeUint8(buffer, 1 + i * 5, this.xyLevelings.axis);
            writeFloat(buffer, 1 + i * 5 + 1, this.xyLevelings.offset);
        }
        return buffer;
    }

    fromBuffer(buffer: Buffer): any {
        const length = readUint8(buffer, 0);
        this.xyLevelings = [];
        for (let i = 0; i < length; i++) {
            this.xyLevelings.push({
                axis: readUint8(buffer, 1 + i * 5),
                offset: readFloat(buffer, 1 + i * 5 + 1)
            });
        }
    }
}
