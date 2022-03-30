import { readUint8 } from '../../helper';
import { Serializable } from '../../Serializable';
import CoordinateInfo from './CoordinateInfo';

export default class MachineSize implements Serializable {
    axisLength: CoordinateInfo[];

    homeOffset: CoordinateInfo[];

    constructor(axisLength?: CoordinateInfo[], homeOffset?: CoordinateInfo[]) {
        this.axisLength = axisLength ?? [];
        this.homeOffset = homeOffset ?? [];
    }

    toBuffer(): Buffer {
        throw new Error('Method not implemented.');
    }

    fromBuffer(buffer: Buffer) {
        this.axisLength = CoordinateInfo.parseArray(buffer);

        const arrLength = readUint8(buffer, 0);
        buffer = buffer.slice(arrLength * CoordinateInfo.byteLength + 1);

        this.homeOffset = CoordinateInfo.parseArray(buffer);
        return {
            axisLength: this.axisLength,
            homeOffset: this.homeOffset
        }
    }
}
