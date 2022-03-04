function calcChecksum(buffer, offset, length) {
    // TCP/IP checksum
    // https://locklessinc.com/articles/tcp_checksum/
    let sum = 0;
    for (let i = 0; i < length - 1; i += 2) {
        sum += (buffer[offset + i] & 0xFF) * 0x100 + (buffer[offset + i + 1] & 0xFF);
    }
    if ((length & 1) > 0) {
        sum += (buffer[offset + length - 1] & 0xFF);
    }
    while ((sum >> 16) > 0) {
        sum = (sum & 0xFFFF) + (sum >> 16);
    }
    return ((~sum) & 0xFFFF);
}

function calcCRC8(buffer, offset, length) {
    let crc = 0x00;
    const poly = 0x07;
    for (let i = offset; i < offset + length; i++) {
        for (let j = 0; j < 8; j++) {
            const bit = ((buffer[i] >> (7 - j) & 1) === 1);
            const c07 = ((crc >> 7 & 1) === 1);
            crc <<= 1;
            if (c07 !== bit) {
                crc ^= poly;
            }
        }
    }
    crc &= 0xff;
    return crc;
}

function validateChecksum(buffer) {
    const checksum = calcChecksum(buffer, 7, buffer.byteLength - 9);
    if (checksum === buffer.readUInt16LE(buffer.byteLength - 2)) {
        return true;
    }
    return false;
}

let receiving = false, remainLength = 0, receiveBuffer = Buffer.alloc(0);

function receive(buffer) {
    if (!receiving) {
        for (let i = 0; i < buffer.byteLength - 1; i++) {
            if (buffer[i] === 0xaa && buffer[i + 1] === 0x55) {
                const crc8 = calcCRC8(buffer, i, 6);
                if (crc8 === buffer[i + 6]) {
                    receiving = true;
                    const length = buffer.readUInt16LE(i + 2);
                    if (i + 7 + length <= buffer.byteLength) {
                        receiveBuffer = Buffer.concat([receiveBuffer, buffer.slice(i, i + 7 + length)]);
                        remainLength = 0;
                        receiving = false;
                        const result = validateChecksum(receiveBuffer);
                        if (result) {
                            // console.log(result);
                            // emit('')
                            // new Packet().parse(buffer);
                        }
                    } else {
                        remainLength = length - (buffer.byteLength - i);
                        receiveBuffer = Buffer.concat([receiveBuffer, buffer.slice(i, buffer.byteLength)])
                    }
                }
            }
        }
    } else {
        if (remainLength >= buffer.byteLength) {
            receiveBuffer = Buffer.concat([receiveBuffer, buffer.slice(0, buffer.byteLength)]);
            remainLength -= buffer.byteLength;
        } else {
            receiveBuffer = Buffer.concat([receiveBuffer, buffer.slice(0, remainLength)]);
            remainLength = 0;
            receiving = false;
        }
    }
}

// receive(Buffer.from([0xaa, 0x55, 0x0c, 0x00, 0x02, 0x01, 0x18, 0x02, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0xa0, 0xe8, 0x03, 0x5c, 0x13]));
receive(Buffer.from([0xaa, 0x55, 0x08, 0x00, 0x02, 0x01, 0x40, 0x02, 0x00, 0x01, 0x00, 0x01, 0x20, 0xdf, 0xfb]));
