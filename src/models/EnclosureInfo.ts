import { readBool, readUint8, writeUint8 } from '@/helper';
import { Serializable } from '@/types';

class TestStatus implements Serializable {
    workType: number = 0;

    State: boolean = false;

    toBuffer(): Buffer {
        throw new Error('Method not implemented.');
    }

    fromBuffer(buffer: Buffer) {
        this.workType = readUint8(buffer, 0);
        this.State = readBool(buffer, 1);
        return this;
    }

    static parseArray(buffer: Buffer) {
        const result = [];
        const len = readUint8(buffer, 0);
        const elementBuffer = buffer.slice(1);
        for (let i = 0; i < len; i++) {
            const info = new TestStatus().fromBuffer(elementBuffer.slice(i * 2, i * 2 + 2));
            result.push(info);
        }
        return result;
    }
}

export default class EnclosureInfo implements Serializable {
    key: number = 0;

    moduleStatus: number = 0;

    ledValue: number = 0;

    testStatus: Array<TestStatus> = [];

    isDoorOpen: boolean = false;

    fanlevel: number = 0;

    constructor(key?: number) {
        this.key = key ?? 0;
    }

    toBuffer(): Buffer {
        const buffer = Buffer.alloc(1, 0);
        writeUint8(buffer, 0, this.key);
        return buffer;
    }

    fromBuffer(buffer: Buffer) {
        this.key = readUint8(buffer, 0);
        this.moduleStatus = readUint8(buffer, 1);
        this.ledValue = readUint8(buffer, 2);
        this.testStatus = TestStatus.parseArray(buffer.slice(3));
        const len = readUint8(buffer, 3);
        this.isDoorOpen = readBool(buffer, 2 * len + 4);
        this.fanlevel = readUint8(buffer, 2 * len + 5);
        return this;
    }
}
