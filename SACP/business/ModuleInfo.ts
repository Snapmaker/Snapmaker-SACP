// https://snapmaker2.atlassian.net/wiki/spaces/SNAP/pages/1984824794/Re?focusedCommentId=2001966795#Data-Format.1

import { readString, readUint16, readUint32, readUint8 } from '../helper';

enum FMDIndex {
    LEFT, RIGHT
}

enum LinearModuleIndex {
    X1 = 1, Y1, Z1, X2, Y2, Z2
}

enum ModuleState {
    NORMAL, UPGRADING, UNAVAIL, UPGRAD_FAIL, OTHER
}

type ModuleIndex = FMDIndex | LinearModuleIndex;
export default class ModuleInfo {
    key: number;

    moduleId: number;

    moduleIndex: ModuleIndex;

    moduleState: ModuleState;

    serialNumber: number;

    hardwareVersion: number;

    moduleFirmwareVersion: string;

    constructor(buffer: Buffer) {
        this.key = readUint8(buffer, 0);
        this.moduleId = readUint16(buffer, 1);
        this.moduleIndex = readUint8(buffer, 3) as ModuleIndex;
        this.moduleState = readUint8(buffer, 4) as ModuleState;
        this.serialNumber = readUint32(buffer, 5);
        this.hardwareVersion = readUint8(buffer, 9);
        this.moduleFirmwareVersion = readString(buffer, 10);
    }
}
