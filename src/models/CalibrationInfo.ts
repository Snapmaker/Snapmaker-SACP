import { readFloat, readUint8, writeFloat, writeUint8 } from '@/helper';
import { Serializable } from '@/types';

export type Point = {
    x: number;
    y: number;
}
const pointSize = 8;

export default class CalibrationInfo implements Serializable {
    points: Array<Point>;

    corners: Array<Point>;

    constructor(points?: Array<Point>, corners?: Array<Point>) {
        this.points = points ?? [];
        this.corners = corners ?? [];
    }

    toBuffer(): Buffer {
        const pointsBuffer = Buffer.alloc(1 + pointSize * 4, 0);
        let nextOffset = 0;
        nextOffset = writeUint8(pointsBuffer, nextOffset, 4);
        this.points.forEach(point => {
            nextOffset = writeFloat(pointsBuffer, nextOffset, point.x);
            nextOffset = writeFloat(pointsBuffer, nextOffset, point.y);
        });

        nextOffset = 0;
        const cornersBuffer = Buffer.alloc(1 + pointSize * 4, 0);
        nextOffset = writeUint8(cornersBuffer, nextOffset, 4);
        this.corners.forEach(point => {
            nextOffset = writeFloat(cornersBuffer, nextOffset, point.x);
            nextOffset = writeFloat(cornersBuffer, nextOffset, point.y);
        });

        return Buffer.concat([pointsBuffer, cornersBuffer]);
    }

    fromBuffer(buffer: Buffer) {
        this.points = [];
        const arrLength = readUint8(buffer, 0);
        const targetBuffer = buffer.slice(1, 4 * pointSize + 1);
        for (let i = 0; i < arrLength; i++) {
            const info = targetBuffer.slice(i * pointSize, (i + 1) * pointSize);
            this.points.push({
                x: readFloat(info, 0),
                y: readFloat(info, 4)
            });
        }

        this.corners = [];
        const buffer1 = buffer.slice(4 * pointSize + 1);
        const arrLength1 = readUint8(buffer1, 0);
        const targetBuffer1 = buffer1.slice(1, 4 * pointSize + 1);
        for (let i = 0; i < arrLength1; i++) {
            const info = targetBuffer1.slice(i * pointSize, (i + 1) * pointSize);
            this.corners.push({
                x: readFloat(info, 0),
                y: readFloat(info, 4)
            });
        }
        return this;
    }
}
