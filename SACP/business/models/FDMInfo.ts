import { readBool, readFloat, readUint16, readUint8, writeUint8 } from '../../helper';
import { Serializable } from '../../Serializable';

export default class FDMInfo implements Serializable {
    key: number;

    headStatus: number;

    headActive: boolean;

    extruderList: any;

    fansList : any;

    constructor(key?: number, headStatus?: number, headActive?: boolean, extruderList?: any, fansList?: any) {
        this.key = key ?? 0;
        this.headStatus = headStatus ?? 0;
        this.headActive = headActive ?? false;
        this.extruderList = extruderList ?? [];
        this.fansList = fansList ?? [];
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
        const extruderCount = readUint8(buffer, 3);
        //The information length of one nozzle in the array is 17;
        const extrudeByteLength = 17;
        const extruderBuffer = buffer.slice(4, extruderCount * extrudeByteLength + 4);
        for (let i = 0; i < extruderCount; i++) {
            const extruderInfo :any = {};
            const index = readUint8(extruderBuffer, 0);
            const filamentStatus = readBool(extruderBuffer, 1);
            const materiaDetection = readUint8(extruderBuffer, 2);
            const status = readUint8(extruderBuffer, 3);
            const type = readUint8(extruderBuffer, 4);
            const diameter = readFloat(extruderBuffer, 5);
            const currentTemperature = readFloat(extruderBuffer, 9);
            const targetTemperature = readUint16(extruderBuffer, 13);
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
        const fanCount = readUint8(buffer, extruderCount * extrudeByteLength);
        const fanBuffer = buffer.slice(extruderCount * extrudeByteLength + 1 + 4);
        //The length of information for one fan in the array is 3
        const fanByteLength = 3;
        for (let i = 0; i < fanCount; i++) {
            const fan = fanBuffer.slice(fanByteLength * i, fanByteLength * (i + 1));
            const fanInfo :any = {};
            const fanIndex = readUint8(fan, 0);
            const fanType = readUint8(fan, 1);
            const fanSpeen = readUint8(fan, 2);
            fanInfo.fanIndex = fanIndex;
            fanInfo.fanType = fanType;
            fanInfo.fanSpeen = fanSpeen;
            this.fansList.push(fanInfo);
        }
        return this;
    }
}
