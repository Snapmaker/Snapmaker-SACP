import { readFloat, readUint8 } from '../../helper';
import { Serializable } from '../../Serializable';

export default class ModuleInfo implements Serializable {
    motherBoardTemperatureInfo: any = [];

    constructor(motherBoardTemperatureInfo: any = []) {
        this.motherBoardTemperatureInfo = motherBoardTemperatureInfo;
    }

    toBuffer(): Buffer {
        throw new Error('Method not implemented.');
    }

    fromBuffer(buffer: Buffer) {
        const len = readUint8(buffer, 0);
        const info:any = [];
        for (let i = 0; i < len; i++) {
            info.index = readUint8(buffer, 1 + i * 5);
            info.temperature = readFloat(buffer, 2 + i * 5);
            this.motherBoardTemperatureInfo.push(info);
        }
        return this;
    }
}
