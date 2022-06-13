import { Serializable } from '../../Serializable';
import { readBool, readFloat, readUint8 } from '../../helper';

export default class BedInfo implements Serializable {
    key: number = 0;

    isHome: boolean = false;

    status: boolean = false;

    isOpen: boolean = false;

    lead: number = 0;

    toBuffer(): Buffer {
        throw new Error('Method not implemented.');
    }

    fromBuffer(buffer: Buffer): any {
        this.key = readUint8(buffer, 0);
        this.isHome = readBool(buffer, 1);
        this.status = readBool(buffer, 2);
        this.isOpen = readBool(buffer, 3);
        this.lead = readFloat(buffer, 4);
        return this;
    }
}
