import { readBool, readUint32, readUint8, writeUint8 } from '../../helper';
import { Serializable } from '../../Serializable';

export default class CNCToolHeadInfo implements Serializable {
    key: number;

    headStatus: number;

    headActive : boolean;

    runningState : number;

    controlMode : number;

    currentPower : number;

    targetPower : number;

    currentSpeed : number;

    targetSpeed : number;

    constructor(key?: number, headStatus?: number, headActive?: boolean, runningState?: number, controlMode?: number, currentPower?: number, targetPower?: number, currentSpeed?: number, targetSpeed?: number) {
        this.key = key ?? 0;
        this.headStatus = headStatus ?? 0;
        this.headActive = headActive ?? false;
        this.runningState = runningState ?? 0;
        this.controlMode = controlMode ?? 0;
        this.currentPower = currentPower ?? 0;
        this.targetPower = targetPower ?? 0;
        this.currentSpeed = currentSpeed ?? 0;
        this.targetSpeed = targetSpeed ?? 0;
    }

    toBuffer(): Buffer {
        const buffer = Buffer.alloc(1, 0);
        writeUint8(buffer, 0, this.key);
        return buffer;
    }

    fromBuffer(buffer: Buffer) {
        this.key = readUint8(buffer, 0);
        this.headStatus = readUint8(buffer, 1);
        this.headActive = readBool(buffer, 2);
        this.runningState = readUint8(buffer, 3);
        this.controlMode = readUint8(buffer, 4);
        this.currentPower = readUint8(buffer, 5);
        this.targetPower = readUint8(buffer, 6);
        this.currentSpeed = readUint32(buffer, 7);
        this.targetSpeed = readUint32(buffer, 11);
        return this;
    }
}
