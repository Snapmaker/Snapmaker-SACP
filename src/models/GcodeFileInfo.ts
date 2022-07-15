import { readString, stringToBuffer } from '@/helper';
import { Serializable } from '@/types';

export default class GcodeFileInfo implements Serializable {
    md5: string;

    gcodeName: string;

    headType: number;

    constructor(md5: string = '', gcodeName: string = '', headType: number = 0) {
        this.md5 = md5;
        this.gcodeName = gcodeName;
        this.headType = headType;
    }

    toBuffer(): Buffer {
        return Buffer.concat([stringToBuffer(this.md5), stringToBuffer(this.gcodeName), Buffer.alloc(1, this.headType)]);
    }

    fromBuffer(buffer: Buffer) {
        const { nextOffset, result: md5 } = readString(buffer, 0);
        this.md5 = md5;
        this.gcodeName = readString(buffer, nextOffset).result;
        return this;
    }
}
