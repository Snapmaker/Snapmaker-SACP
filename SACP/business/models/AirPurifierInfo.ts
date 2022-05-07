import { readBool, readUint8, writeUint8 } from '../../helper';
import { Serializable } from '../../Serializable';

class AirPurifierStatus implements Serializable {
    powerState: boolean = false;

    fanState: boolean = false;

    speedLevel: number = 0;

    lifeLevel: number = 0;

    filter: boolean = false;

    toBuffer(): Buffer {
        throw new Error('Method not implemented.');
    }

    fromBuffer(buffer: Buffer) {
        this.powerState = readBool(buffer, 0);
        this.fanState = readBool(buffer, 1);
        this.speedLevel = readUint8(buffer, 2);
        this.lifeLevel = readUint8(buffer, 3);
        this.filter = readBool(buffer, 4);
        return this;
    }
}

export default class AirPurifierInfo implements Serializable {
    key: number = 0;

    moduleStatus : number = 0;

    airPurifierStatus : AirPurifierStatus = new AirPurifierStatus();

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
        this.airPurifierStatus = new AirPurifierStatus().fromBuffer(buffer.slice(2));
        return this;
    }
}
