import { readUint16, readUint8 } from '../../helper';
import { Serializable } from '../../Serializable';

export default class ReportExceptionInfo implements Serializable {
    level: number;

    owner: number;

    value: number;

    MachineBehaviorState: number[];


    constructor(level?: number, owner?: number, value?: number, MachineBehaviorState?: number[]) {
        this.level = level ?? 0;
        this.owner = owner ?? 0;
        this.value = value ?? 0;
        this.MachineBehaviorState = MachineBehaviorState ?? [];
    }

    toBuffer(): Buffer {
        throw new Error('Method not implemented.');
    }

    fromBuffer(buffer: Buffer) {
        this.level = readUint8(buffer, 0);
        this.owner = readUint16(buffer, 1);
        this.value = readUint8(buffer, 3);
        const len = readUint8(buffer, 4);
        for (let i = 0; i < len; i++) {
            const behavior = readUint8(buffer, 5 + i);
            this.MachineBehaviorState.push(behavior);
        }
        return this;
    }
}
