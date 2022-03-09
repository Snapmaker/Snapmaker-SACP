import assert from 'assert'
import net from 'net'
import Communication from '../../SACP/communication/Communication';
import Packet from '../../SACP/communication/Packet';
import TCPConnection from '../../SACP/connection/TCPConnection';

xdescribe('communication', () => {
    let communication: Communication;
    let server: net.Server;
    let client: net.Socket;

    before((done) => {
        communication = new Communication()

        server = net.createServer((socket) => {
            const connection = new TCPConnection(communication, socket)
            communication.setConnection(connection);

            socket.on('data', (data) => {
                communication.receive(data)
            })
            socket.on('end', () => {
                communication.end()
            })
        })
        server.listen(3000, 'localhost', () => {
            client = net.createConnection({
                port: 3000,
                host: 'localhost'
            }, () => {
                done()
            })
        })

    })

    after(() => {
        communication.dispose()
        client.destroy()
        server.close()
    })

    it('should receive packet', () => {
        const buf = Buffer.from([0xaa, 0x55, 0x0c, 0x00, 0x02, 0x01, 0x18, 0x02, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0xa0, 0xe8, 0x03, 0x5c, 0x13])
        communication.once('request', (packet: Packet) => {
            assert.deepEqual(buf, packet.toBuffer(), 'receive wrong packet');
        })
        client.write(buf)
    })

    it('should send packet', () => {
        const buf = Buffer.from([0xaa, 0x55, 0x0c, 0x00, 0x02, 0x01, 0x18, 0x02, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0xa0, 0xe8, 0x03, 0x5c, 0x13])
        client.once('data', (data) => {
            assert.deepEqual(buf, data, 'send wrong buffer')
        })
        communication.send(buf)
    })
})