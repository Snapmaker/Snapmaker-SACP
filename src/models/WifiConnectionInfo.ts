import { stringToBuffer } from '../helper';
import { Serializable } from '../types';

export default class WifiConnectionInfo implements Serializable {
    hostName: string;

    clientName: string = 'Luban';

    token: string = '';

    constructor(hostName: string, clientName: string = 'Luban', token: string = '') {
        this.hostName = hostName;
        this.clientName = clientName;
        this.token = token;
    }

    toBuffer(): Buffer {
        let buffer = Buffer.alloc(0);
        buffer = Buffer.concat([buffer, stringToBuffer(this.hostName)]);
        buffer = Buffer.concat([buffer, stringToBuffer(this.clientName)]);
        buffer = Buffer.concat([buffer, stringToBuffer(this.token)]);
        return buffer;
    }

    fromBuffer(buffer: Buffer) {
        throw new Error('Method not implemented.');
    }
}
