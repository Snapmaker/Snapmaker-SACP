import { Serializable } from '../../Serializable';
import ZoneInfo from './ZoneInfo';
import { readUint8 } from '../../helper';

export default class BedInfo implements Serializable {
    key: number = 0;

    zoneInfo: ZoneInfo[] = [];

    toBuffer(): Buffer {
        // TODO
        const buffer = Buffer.alloc(0);
        return buffer;
    }

    fromBuffer(buffer: Buffer): any {
        this.key = readUint8(buffer, 0);
        const count = readUint8(buffer, 1);
        for (let i = 0; i < count; i++) {
            const zoneInfo = new ZoneInfo().fromBuffer(buffer.slice(2 + i * 7));
            this.zoneInfo.push(zoneInfo);
        }
        return this;
    }
}
