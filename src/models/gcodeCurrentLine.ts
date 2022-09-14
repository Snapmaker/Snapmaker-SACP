import { readUint32 } from "../helper";
import { Serializable } from '../types';

export default class GcodeCurrentLine implements Serializable {
    currentLine: number;

    constructor(currentLine?: number) {
        this.currentLine = currentLine ?? 0;
    }

    toBuffer(): Buffer {
        throw new Error('Method not implemented.');
    }

    fromBuffer(buffer: Buffer) {
        this.currentLine = readUint32(buffer, 0);
        return this;
    }
}