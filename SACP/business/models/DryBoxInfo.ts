import { readInt16, readUint16, readUint32, readUint8, writeUint8 } from '../../helper';
import { Serializable } from '../../Serializable';

export class DryBoxStatus implements Serializable {
    dryState: number = 0;

    tempCurrentChamber: number = 0;

    tempTargetChamber: number = 0;

    currentHumidity: number = 0;

    tempWindHole: number = 0;

    targetHumidity: number = 0;

    surplusTime: number = 0;

    targetTime: number = 0;

    totalTime: number = 0;

    lidStatus: number = 0;

    powerStatus: number = 0;

    toBuffer(): Buffer {
        throw new Error('Method not implemented.');
    }

    fromBuffer(buffer: Buffer) {
        this.dryState = readUint8(buffer, 0);
        this.tempCurrentChamber = readInt16(buffer, 1);
        this.tempTargetChamber = readInt16(buffer, 3);
        this.tempWindHole = readInt16(buffer, 5);
        this.currentHumidity = readUint16(buffer, 7);
        this.targetHumidity = readUint16(buffer, 9);
        this.surplusTime = readUint32(buffer, 11);
        this.targetTime = readUint32(buffer, 15);
        this.totalTime = readUint32(buffer, 19);
        this.lidStatus = readUint8(buffer, 23);
        this.powerStatus = readUint8(buffer, 24);
        return this;
    }
}

export default class DryBoxInfo implements Serializable {
    key: number = 0;

    moduleStatus : number = 0;

    dryBoxStatus : DryBoxStatus = new DryBoxStatus();

    constructor(key?: number) {
        this.key = key ?? 0;
    }

    toBuffer(): Buffer {
        const buffer = Buffer.alloc(1, 0);
        writeUint8(buffer, 0, this.key);
        return buffer;
    }

    fromBuffer(buffer: Buffer) {
        this.key = readUint8(buffer, 0);
        this.moduleStatus = readUint8(buffer, 1);
        this.dryBoxStatus = new DryBoxStatus().fromBuffer(buffer.slice(2));
        return this;
    }
}
