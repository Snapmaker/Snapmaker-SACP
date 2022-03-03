import ConnectionInterface from './ConnectionInterface';

export default class SerialPortConnections implements ConnectionInterface {
    read(buffer: Buffer) {
        console.log('read', buffer);
    }

    write(buffer: Buffer) {
        console.log('write', buffer);
    }
}
