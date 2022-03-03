import { readString, readUint32, readUint8 } from '../helper';

enum MachineType {
    A150, A250, A350, A400, J1
}

export default class MachineInfo {
    type: MachineType;

    masterControlHardwareVersion: number;

    masterControlSerialNumber: number;

    masterControlFirmwareVersion: string;

    constructor(buffer: Buffer) {
        this.type = readUint8(buffer, 0);
        this.masterControlHardwareVersion = readUint8(buffer, 1);
        this.masterControlSerialNumber = readUint32(buffer, 2);
        this.masterControlFirmwareVersion = readString(buffer, 6);
    }
}
