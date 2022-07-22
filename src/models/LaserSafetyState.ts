import { readFloat, readUint8 } from '../helper';
import { Serializable } from '../types';

export default class LaserSafetyState implements Serializable {
    key: number;

    state: number;

    laserTubeTemperature: number;

    roll: number;

    pitch: number;


    constructor(key?: number, state?: number, laserTubeTemperature?: number, roll?: number, pitch?: number) {
        this.key = key ?? 0;
        this.state = state ?? 0;
        this.laserTubeTemperature = laserTubeTemperature ?? 0;
        this.roll = roll ?? 0;
        this.pitch = pitch ?? 0;
    }

    toBuffer(): Buffer {
        throw new Error('Method not implemented.');
    }

    fromBuffer(buffer: Buffer) {
        this.key = readUint8(buffer, 0);
        this.state = readUint8(buffer, 1);
        this.laserTubeTemperature = readFloat(buffer, 2);
        this.roll = readFloat(buffer, 6);
        this.pitch = readFloat(buffer, 10);
        return this;
    }
}
