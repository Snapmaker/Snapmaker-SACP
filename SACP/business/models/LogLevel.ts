import { readString, readUint8 } from '../../helper';
import { Serializable } from '../../Serializable';

export default class LogLevel implements Serializable {
    logLevel: number;

    logContent: string;


    constructor(logLevel?: number, logContent?: string) {
        this.logLevel = logLevel ?? 0;
        this.logContent = logContent ?? '';
    }

    toBuffer(): Buffer {
        const buffer = Buffer.alloc(1, this.logLevel);
        return buffer;
    }

    fromBuffer(buffer: Buffer) {
        this.logLevel = readUint8(buffer, 0);
        const result = readString(buffer, 1);
        this.logContent = result.result;
        return this;
    }
}
