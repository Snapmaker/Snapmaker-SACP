import { readFloat } from '../../helper';
import { Serializable } from '../../Serializable';

export default class LaserTubeState implements Serializable {
    currentPower: number;
    targetPower : number;

    constructor(currentPower?: number, targetPower?: number) {
        this.currentPower = currentPower ?? 0;
        this.targetPower = targetPower ?? 0;
    }

    toBuffer(): Buffer {
        throw new Error('Method not implemented.');
    }

    fromBuffer(buffer: Buffer) {
        this.currentPower = readFloat(buffer, 0);
        this.targetPower = readFloat(buffer, 4);
        return this;
    }
}