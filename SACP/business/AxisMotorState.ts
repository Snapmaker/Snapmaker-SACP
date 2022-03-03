import { readBool, readUint8 } from '../helper';

enum Axis {
    X1, Y1, Z1, A1, B1, C1, X2, E1, E2
}

export default class AxisMotorState {
    axis: Axis;

    isOn: boolean;

    constructor(buffer: Buffer) {
        this.axis = readUint8(buffer, 0);
        this.isOn = readBool(buffer, 1);
    }
}
