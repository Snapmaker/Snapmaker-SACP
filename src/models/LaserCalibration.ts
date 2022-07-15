import { writeUint8 } from '@/helper';
import { Serializable } from '@/types';

export default class LaserCalibration implements Serializable {
    calibrationMode: number;

    constructor(calibrationMode?: number) {
        this.calibrationMode = calibrationMode ?? 0;
    }

    toBuffer(): Buffer {
        const buffer = Buffer.alloc(1, 0);
        writeUint8(buffer, 0, this.calibrationMode);
        return buffer;
    }

    fromBuffer() {
    }
}
