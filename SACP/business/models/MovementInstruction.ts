import { readFloat, readUint8, writeFloat, writeUint8} from '../../helper';
import { Serializable } from '../../Serializable';

export enum MoveDirection {
    X1, Y1, Z1, A1, B1, C1, X2
}

export default class MovementInstruction implements Serializable {
    direction: MoveDirection;

    distance: number;

    constructor(direction?: MoveDirection, distance?: number) {
        this.direction = direction ?? 0;
        this.distance = distance ?? 0;
    }

    toBuffer(): Buffer {
        // const buffer = Buffer.alloc(1 + 1 + 4 + 2, 0);
        // writeUint8(buffer, 0, 1);
        // writeUint8(buffer, 1, this.direction);
        // writeFloat(buffer, 2, this.distance);
        // console.log('nextOffset', buffer);
        const buffer = Buffer.alloc(5);
        writeUint8(buffer, 0, this.direction);
        writeFloat(buffer, 1, this.distance);
        return buffer;
    }

    fromBuffer(buffer: Buffer) {
        this.direction = readUint8(buffer, 0) as MoveDirection;
        this.distance = readFloat(buffer, 1);
        return this;
    }
}
