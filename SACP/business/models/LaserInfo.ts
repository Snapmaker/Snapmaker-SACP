import { readFloat, readString, readUint32, readUint8, stringToBuffer, writeUint32, writeUint8 } from '../../helper';
import { Serializable } from '../../Serializable';

export default class Laserinfo implements Serializable {
    key: number;
    headStatus: number;
    laserFocalLength: number;
    laserTubeState: number;

    constructor(key?: number, headStatus?: number, laserFocalLength?: number, laserTubeState?: number) {
        this.key = key ?? 0;
        this.headStatus = headStatus ?? 0;
        this.laserFocalLength = laserFocalLength ?? 0;
        this.laserTubeState = laserTubeState ?? 0;



    }

    toBuffer(): Buffer {
        throw new Error('Method not implemented.');
    }

    fromBuffer(buffer: Buffer) {
        this.key = readUint8(buffer, 0);
        this.headStatus = readUint8(buffer, 1);
        this.laserFocalLength = readFloat(buffer, 2);
        this.laserTubeState = readFloat(buffer,3)



    }
}
