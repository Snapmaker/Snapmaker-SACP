import { Serializable } from '../../Serializable';
import { readBool, readUint8 } from '../../helper';

export default class EndstopsInfo implements Serializable {
    EndstopsInfoList: any;

    constructor() {
        this.EndstopsInfoList = [];
    }

    toBuffer(): Buffer {
        throw new Error('Method not implemented.');
    }

    fromBuffer(buffer: Buffer) {
        const endstopsInfoCount = readUint8(buffer, 0);
        const endstopsInfoLength = 2;
        const endstopsInfoBuffer = buffer.slice(1);
        for (let i = 0; i < endstopsInfoCount; i++) {
            const moudul = endstopsInfoBuffer.slice(endstopsInfoLength * i, endstopsInfoLength * (i + 1));
            const moudulInfo: any = {};
            const subindex = readUint8(moudul, 0);
            const switchState = readBool(moudul, 1);
            moudulInfo.subindex = subindex;
            moudulInfo.switchState = switchState;
            this.EndstopsInfoList.push(moudulInfo);
        }
        return this;
    }
}

