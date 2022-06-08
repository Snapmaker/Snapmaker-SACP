import { readUint16, readUint8 } from '../../helper';
import { Serializable } from '../../Serializable';

export default class ClearExceptionInfo implements Serializable {
    ExceptionInfo: number[];

    MachineBehaviorState: number[];


    constructor(ExceptionInfo?: number[], MachineBehaviorState?: number[]) {
        this.ExceptionInfo = ExceptionInfo ?? [];
        this.MachineBehaviorState = MachineBehaviorState ?? [];
    }

    toBuffer(): Buffer {
        throw new Error('Method not implemented.');
    }

    fromBuffer(buffer: Buffer) {
        const exceptionInfoLen = readUint8(buffer, 0);
        const bytesLen = 4;
        for (let i = 0; i < exceptionInfoLen; i++) {
            const result: any = {};
            const exceptionInfo = buffer.slice(bytesLen * i + 1, bytesLen * (i + 1) + 1);
            result.level = readUint8(exceptionInfo, 0);
            result.owner = readUint16(exceptionInfo, 1);
            result.value = readUint8(exceptionInfo, 3);
            this.ExceptionInfo.push(result);
        }
        const machineBehaviorStateLen = readUint8(buffer, 4);
        for (let i = 0; i < machineBehaviorStateLen; i++) {
            const behavior = readUint8(buffer, 5 + i);
            this.MachineBehaviorState.push(behavior);
        }
        return this;
    }
}
