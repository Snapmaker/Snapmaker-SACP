import { readFloat, readUint8, writeUint8, readInt16 } from '../../helper';
import { Serializable } from '../../Serializable';

export default class Laserinfo implements Serializable {
    key: number;

    zoneList: any;

    constructor(key?: number, zoneList?: any) {
        this.key = key ?? 0;
        this.zoneList = zoneList ?? [];
    }

    toBuffer(): Buffer {
        const buffer = Buffer.alloc(1, 0);
        writeUint8(buffer, 0, this.key);
        return buffer;
    }

    fromBuffer(buffer: Buffer) {
        this.key = readUint8(buffer, 0);
        const zenoCount = readUint8(buffer, 1);
        const zenoBuffer = buffer.slice(2);
        const byteLength = 7;
        for (let i = 0; i < zenoCount; i++) {
            const zenoInfo :any = {};
            const zeno = zenoBuffer.slice(byteLength * i, byteLength * (i + 1));
            const zoneIndex = readUint8(zeno, 0);
            const currentTemperature = readFloat(zeno, 1);
            const targetTemzperature = readInt16(zeno, 5);
            zenoInfo.zoneIndex = zoneIndex;
            zenoInfo.currentTemperature = currentTemperature;
            zenoInfo.targetTemzperature = targetTemzperature;
            this.zoneList.push(zenoInfo);
        }
        return this;
    }
}
