import dgram from 'dgram';

import ConnectionInterface from "./ConnectionInterface";
import SACP from '../communication/Communication';

interface UDPConnectionOptions {
    socket: dgram.Socket;
    host: string;
    port: number;
}

class UDPConnection implements ConnectionInterface {
    private socket: dgram.Socket;

    private sacp: SACP;

    private host: string;
    private port: number;

    public constructor(sacp: SACP, options: UDPConnectionOptions) {
        this.sacp = sacp;

        this.socket = options.socket;
        this.host = options.host;
        this.port = options.port;
        // this.socket.bind(this.port, this.host);
    }

    public read(buffer: Buffer): void {
        this.sacp.receive(buffer);
    }

    public end(): void {
        this.sacp.end();
    }

    public write(buffer: Buffer): void {
        this.socket.send(buffer, this.port, this.host);
    }
}

export default UDPConnection;
