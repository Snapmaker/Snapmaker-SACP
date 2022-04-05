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
        this.fanlist = fanlist?? {};
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
        const fanlength = readUint8(buffer, 14);
        const fanInfo :any = {}
        for (let i = 0; i < fanlength; i++) {
            if(i === 0){
                const fanIndex = readUint8(buffer, i+15)
                const fanType = readUint8(buffer,i+16)
                const fanSpeed = readUint8(buffer,i+17)
                fanInfo[0] = fanIndex
                fanInfo[1] = fanType
                fanInfo[2] = fanSpeed
                this.fanlist[i]=fanInfo
            }else{
                const fanIndex = readUint8(buffer, i+15+2)
                const fanType = readUint8(buffer,i+16+2)
                const fanSpeed = readUint8(buffer,i+17)
                fanInfo[0] = fanIndex
                fanInfo[1] = fanType
                fanInfo[2] = fanSpeed
                this.fanlist.push(fanInfo)
            }

        }
        return this
    }
}
