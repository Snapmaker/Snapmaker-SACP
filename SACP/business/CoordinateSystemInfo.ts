import { readArray, readBool, readUint8 } from '../helper';
import CoordinateInfo from './CoordinateInfo';

export default class CoordinateSystemInfo {
    homed: number;

    coordinateSystemId: number;

    isOriginOffsetCoordinateSystem: boolean;

    coordinates: CoordinateInfo[];

    originOffset: CoordinateInfo[];

    constructor(buffer: Buffer) {
        this.homed = readUint8(buffer, 0);
        this.coordinateSystemId = readUint8(buffer, 1);
        this.isOriginOffsetCoordinateSystem = readBool(buffer, 2);

        const coordinatesBuffer = readArray(buffer, 3);
        this.coordinates = CoordinateInfo.parseArray(coordinatesBuffer);

        const originOffsetBuffer = readArray(buffer, coordinatesBuffer.length + 3);
        this.originOffset = CoordinateInfo.parseArray(originOffsetBuffer);
    }
}
