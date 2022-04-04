import { readFloat, readString, readUint32, readUint8, stringToBuffer, writeUint32, writeUint8 } from '../../helper';
import { Serializable } from '../../Serializable';

export default class Laserinfo implements Serializable {
    key: number;
    headStatus: number;
    laserFocalLength: number;
    laserCurrentPower: number;
    laserTargetPower: number;
    fanlist: any;

    constructor(key?: number, headStatus?: number, laserFocalLength?: number, laserCurrentPower?: number, laserTargetPower?: number, fanlist?:any[]) {
        this.key = key ?? 0;
        this.headStatus = headStatus ?? 0;
        this.laserFocalLength = laserFocalLength ?? 0;
        this.laserCurrentPower = laserCurrentPower ?? 0;
        this.laserTargetPower = laserTargetPower ?? 0;

        this.fanlist = fanlist?? [];
    }

    toBuffer(): Buffer {
        const buffer = Buffer.alloc(1,0);
        writeUint8(buffer, 0, this.key);
        return buffer
    }

    fromBuffer(buffer: Buffer) {
        this.key = readUint8(buffer, 0);
        this.headStatus = readUint8(buffer, 1);
        this.laserFocalLength = readFloat(buffer, 5);
        this.laserCurrentPower = readFloat(buffer, 9);
        this.laserTargetPower = readFloat(buffer, 13);
        const fanCount = readUint8(buffer, 14);
        const fanBuffer = buffer.slice(15)
        const byteLength = 3
        const fanInfo :any = {}
        for (let i = 0; i < fanCount; i++) {
            const fan = fanBuffer.slice(byteLength*i,byteLength*(i+1))
            const fanIndex = readUint8(fan, 0)
            const fanType = readUint8(fan ,1)
            const fanSpeed = readUint8(fan ,2)
            fanInfo[0] = fanIndex
            fanInfo[1] = fanType
            fanInfo[2] = fanSpeed
            this.fanlist.push(fanInfo)
        }
        return this
    }
}
