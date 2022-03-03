import Communication from "../communication/Communication";
import TCPConnection from "../connection/TCPConnection";
import SerialPortConnection from "../connection/SerialPortConnection";
import Packet from "../communication/Packet";
import Header from "../communication/Header";

export default class Business {
    communication: Communication;

    constructor(type: string, socket: any) {
        this.communication = new Communication();
        let connection;
        if (type === 'tcp') {
            connection = new TCPConnection(this.communication, socket);
        } else {
            connection = new SerialPortConnection(this.communication, socket);
        }
        this.communication.setConnection(connection);

        this.communication.on('request', this.handler);
    }

    handler(buffer: Buffer) {
        const packet = Packet.parse(buffer);
        const commandSet = packet.header.commandSet;
        const commandId = packet.header.commandId;
        const businessId = commandSet * 256 + commandId;
        switch (businessId) {
            case 0x0100: break; // subscribe
            case 0x0101: break; // unsubscribe
            case 0x01a0: break;
            case 0x0120: break;
            default: break;
        }
    }

    subscribe(commandSet: number, commandId: number, interval: number) {
      const intervalBuffer = Buffer.alloc(2);
      intervalBuffer.writeUint16LE(interval, 0)

      const payload = Buffer.concat([Buffer.from([commandSet, commandId]), intervalBuffer]);
      const header = new Header();
      header.length = payload.byteLength + 7;
      header.commandSet = 0x01;
      header.commandId = 0x00;
      header.updateBuffer();

      const packet = new Packet(header, payload);
      return this.communication.request(packet.toBuffer());
    }

    unsubscribe(commandSet: number, commandId: number) {
      const payload = Buffer.from([commandSet, commandId]);
      const header = new Header();
      header.length = payload.byteLength + 7;
      header.commandSet = 0x01;
      header.commandId = 0x01;
      header.updateBuffer();

      const packet = new Packet(header, payload);
      return this.communication.request(packet.toBuffer());
    }

    ack() {}
}
