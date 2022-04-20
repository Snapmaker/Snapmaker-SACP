import { Serializable } from '../../Serializable';
import { writeFloat, writeUint8, writeUint16, readUint8, readFloat, readUint16 } from '../../helper';

export default class ZoneInfo implements Serializable {
    zoneIndex: number;

    currentTemperature: number;

    targetTemperature: number;

    constructor(zoneIndex?: number, currentTemperature?: number, targetTemperature?: number) {
        this.zoneIndex = zoneIndex ?? 0;
        this.currentTemperature = currentTemperature ?? 0;
        this.targetTemperature = targetTemperature ?? 0;
    }

    toBuffer(): Buffer {
        const buffer = Buffer.alloc(1 + 4 + 2, 0);
        writeUint8(buffer, 0, this.zoneIndex);
        writeFloat(buffer, 1, this.currentTemperature);
        writeUint16(buffer, 5, this.targetTemperature);
        return buffer;
    }

    fromBuffer(buffer: Buffer): any {
        this.zoneIndex = readUint8(buffer, 0);
        this.currentTemperature = readFloat(buffer, 1);
        this.targetTemperature = readUint16(buffer, 5);
        return this;
    }
}
