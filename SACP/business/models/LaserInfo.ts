import { readFloat, readUint8 } from '../../helper';
import { Serializable } from '../../Serializable';

class LaserTubeState implements Serializable {
    currentPower: number = 0;

    targetPower: number = 0;

    toBuffer(): Buffer {
        throw new Error('Method not implemented.');
    }

    fromBuffer(buffer: Buffer) {
        this.currentPower = readFloat(buffer, 0);
        this.targetPower = readFloat(buffer, 4);
        return this;
    }
}

class FanInfo implements Serializable {
    index: number = 0;

    type: number = 0;

    toBuffer(): Buffer {
        throw new Error('Method not implemented.');
    }

    fromBuffer(buffer: Buffer) {
        this.index = readUint8(buffer, 0);
        this.type = readUint8(buffer, 1);
        return this;
    }

    static parseArray(buffer: Buffer) {
        const result = [];
        const len = readUint8(buffer, 0);
        const elementBuffer = buffer.slice(1);
        for (let i = 0; i < len; i++) {
            const info = new FanInfo().fromBuffer(elementBuffer.slice(i * 2, i * 2 + 2));
            result.push(info);
        }
        return result;
    }
}

export default class LaserInfo implements Serializable {
    key: number = 0;

    headStatus: number = 0;

    laserFocalLength: number = 0;

    laserTubeState: LaserTubeState = new LaserTubeState();

    fansList: Array<FanInfo> = [];

    toBuffer(): Buffer {
        throw new Error('Method not implemented.');
    }

    fromBuffer(buffer: Buffer) {
        this.key = readUint8(buffer, 0);
        this.headStatus = readUint8(buffer, 1);
        this.laserFocalLength = readFloat(buffer, 2);
        this.laserTubeState = new LaserTubeState().fromBuffer(buffer.slice(6));
        this.fansList = FanInfo.parseArray(buffer.slice(14));
        return this;
    }
}
