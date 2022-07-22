import { Serializable } from '../types';
import { readFloat, readUint8 } from '../helper';

export default class FdmZaxisHeight implements Serializable {
    pointIndex: number = 0;

    height: number = 0;

    toBuffer(): Buffer {
        throw new Error('Method not implemented.');
    }

    fromBuffer(buffer: Buffer): any {
        this.pointIndex = readUint8(buffer, 0);
        this.height = readFloat(buffer, 1);
        return this;
    }
}
