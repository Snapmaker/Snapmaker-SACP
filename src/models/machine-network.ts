import { off } from 'process';
import { readString, readUint8, stringToBuffer } from '../helper';
import { Serializable } from '../types';

export enum NetworkMode {
    None = 0,
    Station = 1,
}

export enum IPObtain {
    DHCP = 0,
    Static = 1,
}

export interface NetworkOptions {
    networkMode?: NetworkMode;

    stationSSID?: string;
    stationPassword?: string;
    stationIPObtain?: IPObtain;
    stationIP?: string;

    // apSSID?: string;
}

export class NetworkConfiguration implements Serializable {
    public networkMode: NetworkMode;

    public stationSSID: string;
    public stationPassword: string;
    public stationIPObtain: IPObtain;
    public stationIP: string;

    public constructor(options?: NetworkOptions) {
        this.networkMode = options?.networkMode || NetworkMode.None;

        this.stationSSID = options?.stationSSID || '';
        this.stationIPObtain = options?.stationIPObtain || IPObtain.DHCP;
        this.stationIP = options?.stationIP || '';
        this.stationPassword = options?.stationPassword || '';
    }

    toBuffer(): Buffer {
        // throw new Error('Method not implemented.');
        const modeBuffer = Buffer.alloc(1, this.networkMode);
        const stationIPObtainBuffer = Buffer.alloc(1, this.stationIPObtain);

        const SSIDBuffer = (() => {
            if (this.networkMode === NetworkMode.Station) {
                return stringToBuffer(this.stationSSID);
            } else {
                return stringToBuffer('');
            }
        })();

        const passwordBuffer = (() => {
            if (this.networkMode === NetworkMode.Station) {
                return stringToBuffer(this.stationPassword);
            } else {
                return stringToBuffer('');
            }
        })();

        const ipBuffer = (() => {
            if (this.networkMode === NetworkMode.Station) {
                if (this.stationIPObtain === IPObtain.Static) {
                    return stringToBuffer(this.stationIP);
                } else {
                    return stringToBuffer('0.0.0.0'); // not specified, use '' will crash controller
                }
            } else {
                return stringToBuffer('');
            }
        })();

        return Buffer.concat([
            modeBuffer,
            stationIPObtainBuffer,
            SSIDBuffer,
            passwordBuffer,
            ipBuffer,
        ]);
    }

    fromBuffer(buffer: Buffer) {
        this.networkMode = readUint8(buffer, 0) as NetworkMode;

        if (this.networkMode === NetworkMode.Station) {
            this.stationIPObtain = readUint8(buffer, 1) as IPObtain;

            let offset = 2;
            let readStringResult;

            readStringResult = readString(buffer, offset);
            this.stationSSID = readStringResult.result;
            offset = readStringResult.nextOffset;

            readStringResult = readString(buffer, offset);
            this.stationIP = readStringResult.result;
            offset = readStringResult.nextOffset;
        } else {
            // Not Implemented
        }

        return this;
    }
}


enum StationState {
    Idle = 0,
    NotAvailable = 1,
    Scanned = 2,
    Connected = 3,
    ConnectionFailed = 4,
    ConnectionLost = 5,
    Disconnected = 6,
}

export class NetworkStationState implements Serializable {
    public stationState: StationState = StationState.Idle;
    public stationRSSI: number = 0;
    public stationIP: string = '';

    public toBuffer(): Buffer {
        throw new Error('Method not implemented.');
    }

    public fromBuffer(buffer: Buffer) {
        this.stationState = readUint8(buffer, 0) as StationState;
        this.stationRSSI = readUint8(buffer, 1);

        const readStringResult = readString(buffer, 2);
        this.stationIP = readStringResult.result;

        return this;
    }
}