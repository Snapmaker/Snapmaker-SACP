import { readString, readUint32, stringToBuffer, writeFloat, writeUint32, writeUint8 } from '../../helper';
import { Serializable } from '../../Serializable';

export default class ExtruderMovement implements Serializable {
    key: number;

    movementType: number;

    lengthIn: number;

    speedIn: number;

    lengthOut: number;
    
    speedOut: number;


    constructor(key?: number, movementType?: number, lengthIn?: number, speedIn?: number, lengthOut?: number, speedOut?: number) {
        this.key = key ?? 0;
        this.movementType = movementType ?? 0;
        this.lengthIn = lengthIn ?? 0;
        this.speedIn = speedIn ?? 0;
        this.lengthOut = lengthOut ?? 0;
        this.speedOut = speedOut ?? 0;
    }

    toBuffer(): Buffer {
        const buffer = Buffer.alloc(18,0);
        writeUint8(buffer, 0, this.key);
        writeUint8(buffer, 1, this.movementType);
        writeFloat(buffer, 2, this.lengthIn);
        writeFloat(buffer, 6, this.speedIn);
        writeFloat(buffer, 10, this.lengthOut);
        writeFloat(buffer, 14, this.speedOut);
        return buffer
    }

    fromBuffer() {
    }
}
