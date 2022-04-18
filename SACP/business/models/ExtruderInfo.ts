import { Serializable } from "../../Serializable";
import {readBool, readFloat, readUint16, readUint8 } from '../../helper';

export default class ExtruderInfo implements Serializable {
    extruderList: any;

    constructor() {
        this.extruderList = [];
    }

    toBuffer(): Buffer {
        return Buffer.alloc(0);
    }

    fromBuffer(buffer: Buffer) {
        const extruderCount = readUint8(buffer, 0);
        //数组内一个喷嘴的信息长度是17
        const extrudeByteLength = 17;
        const extruderBuffer = buffer.slice(1, extruderCount * extrudeByteLength + 4);
        for (let i = 0; i < extruderCount; i++) {
            const extruder = extruderBuffer.slice(extrudeByteLength * i, extrudeByteLength * (i + 1));
            const extruderInfo: any = {};
            const index = readUint8(extruderBuffer, 0);
            const filamentStatus = readBool(extruderBuffer, 1);
            const materiaDetection = readUint8(extruderBuffer, 2);
            const status = readUint8(extruderBuffer, 3);
            const type = readUint8(extruderBuffer, 4);
            const diameter = readFloat(extruderBuffer, 5);
            const currentTemperature = readFloat(extruderBuffer, 9);
            const targetTemperature = readUint16(extruderBuffer, 13);
            extruderInfo['index'] = index;
            extruderInfo['filamentStatus'] = filamentStatus;
            extruderInfo['materiaDetection'] = materiaDetection;
            extruderInfo['status'] = status;
            extruderInfo['type'] = type;
            extruderInfo['diameter'] = diameter;
            extruderInfo['currentTemperature'] = currentTemperature;
            extruderInfo['targetTemperature'] = targetTemperature;
            this.extruderList.push(extruderInfo);
        }
    }
}
