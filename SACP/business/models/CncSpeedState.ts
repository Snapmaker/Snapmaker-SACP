import { readInt32, readUint8 } from '../../helper';
import { Serializable } from '../../Serializable';

export default class CncSpeedState implements Serializable {
    key: number;

    runningState: number;

    currentPower: number;

    targetPower: number;

    currentSpeed: number;

    targetSpeed: number;

    controlMode: number;


    constructor(key?: number, runningState?: number, currentPower?: number, targetPower?: number, currentSpeed?: number, targetSpeed?: number, controlMode?: number) {
        this.key = key ?? 0;
        this.runningState = runningState ?? 0;
        this.currentPower = currentPower ?? 0;
        this.targetPower = targetPower ?? 0;
        this.currentSpeed = currentSpeed ?? 0;
        this.targetSpeed = targetSpeed ?? 0;
        this.controlMode = controlMode ?? 0;
    }

    toBuffer(): Buffer {
        throw new Error('Method not implemented.');
    }

    fromBuffer(buffer: Buffer) {
        this.key = readUint8(buffer, 0);
        this.runningState = readUint8(buffer, 1);
        this.currentPower = readUint8(buffer, 2);
        this.targetPower = readUint8(buffer, 3);
        this.currentSpeed = readInt32(buffer, 4);
        this.targetSpeed = readInt32(buffer, 8);
        this.controlMode = readUint8(buffer, 12);
        return this;
    }
}
