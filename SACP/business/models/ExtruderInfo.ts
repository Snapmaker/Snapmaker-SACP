import { Serializable } from '../../Serializable';
import { readBool, readFloat, readUint8 } from '../../helper';

export default class ExtruderInfo implements Serializable {
    key: number = 0;

    extruderList: any;

    constructor() {
        this.extruderList = [];
    }

    toBuffer(): Buffer {
        return Buffer.alloc(0);
    }

    fromBuffer(buffer: Buffer) {
        this.key = readUint8(buffer, 0);
        const extruderCount = readUint8(buffer, 1);
        const extrudeByteLength = 17;
        const extruderBuffer = buffer.slice(2, extruderCount * extrudeByteLength + 4);
        for (let i = 0; i < extruderCount; i++) {
            const extruder = extruderBuffer.slice(extrudeByteLength * i, extrudeByteLength * (i + 1));
            const extruderInfo: any = {};
            const index = readUint8(extruder, 0);
            const filamentStatus = readBool(extruder, 1);
            const materiaDetection = readUint8(extruder, 2);
            const status = readUint8(extruder, 3);
            const type = readUint8(extruder, 4);
            const diameter = readFloat(extruder, 5);
            const currentTemperature = readFloat(extruder, 9);
            const targetTemperature = readFloat(extruder, 13);
            extruderInfo.index = index;
            extruderInfo.filamentStatus = filamentStatus;
            extruderInfo.materiaDetection = materiaDetection;
            extruderInfo.status = status;
            extruderInfo.type = type;
            extruderInfo.diameter = diameter;
            extruderInfo.currentTemperature = currentTemperature;
            extruderInfo.targetTemperature = targetTemperature;
            this.extruderList.push(extruderInfo);
        }
        return this;
    }
}
