import { readFloat, readUint16, readUint8 } from '../../helper';

enum MoveDirection {
    X1, Y1, Z1, A1, B1, C1, X2
}

export default class MovementInstruction {
    direction: MoveDirection;

    distance: number;

    speed: number;

    constructor(buffer: Buffer) {
        this.direction = readUint8(buffer, 0) as MoveDirection;
        this.distance = readFloat(buffer, 1);
        this.speed = readUint16(buffer, 5);
    }
}
