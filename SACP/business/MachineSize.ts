import { readArray } from '../helper';
import CoordinateInfo from './CoordinateInfo';

export default class MachineSize {
    axisLength: CoordinateInfo[] = [];

    homeOffset: CoordinateInfo[] = [];

    constructor(buffer: Buffer) {
        const axisLengthBuffer = readArray(buffer, 0);
        this.axisLength = CoordinateInfo.parseArray(axisLengthBuffer);

        const homeOffsetBuffer = readArray(buffer, axisLengthBuffer.byteLength);
        this.homeOffset = CoordinateInfo.parseArray(homeOffsetBuffer);
    }
}
