import { readFloat, readUint8, writeFloat, writeInt16, writeInt8, writeUint8 } from '../../helper';
import { Serializable } from '../../Serializable';
import { CoordinateType } from '../Business';

export enum MoveDirection {
    X1, Y1, Z1, A1, B1, C1, X2
}

export default class MovementInstruction implements Serializable {
    direction: MoveDirection;

    distance: number;

    directions: MoveDirection[];

    distances: number[];

    speed: number;

    coordinateType: CoordinateType;

    constructor(
        direction?: MoveDirection, distance?: number, speed?: number, directions?: MoveDirection[], distances?: number[],
        coordinateType?: CoordinateType
    ) {
        this.directions = directions ?? [0];
        this.distances = distances ?? [0];
        this.direction = direction ?? 0;
        this.distance = distance ?? 0;
        this.speed = speed ?? 1200;
        this.coordinateType = coordinateType ?? 0;
    }

    toArrayBuffer(): Buffer {
        const buffer = Buffer.alloc(4 + 5 * this.directions.length);
        writeUint8(buffer, 0, this.directions.length);
        this.directions.forEach((item, index) => {
            console.log({ item, index });
            writeUint8(buffer, index * 5 + 1, item);
            writeFloat(buffer, index * 5 + 2, this.distances[index]);
        });
        writeInt16(buffer, this.directions.length * 5 + 1, this.speed);
        writeInt8(buffer, this.directions.length * 5 + 3, this.coordinateType);
        return buffer;
    }

    toBuffer(): Buffer {
        const buffer = Buffer.alloc(8);
        writeUint8(buffer, 0, 1);
        writeUint8(buffer, 1, this.direction);
        writeFloat(buffer, 2, this.distance);
        writeInt16(buffer, 6, this.speed);
        return buffer;
    }

    fromBuffer(buffer: Buffer) {
        this.direction = readUint8(buffer, 0) as MoveDirection;
        this.distance = readFloat(buffer, 1);
        return this;
    }
}
