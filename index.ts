/**
 * documents:
 * https://snapmaker2.atlassian.net/wiki/spaces/SNAP/pages/1984824794
 * https://snapmaker2.atlassian.net/wiki/spaces/embedded/pages/1815840545/SACP+packet
 * https://snapmaker2.atlassian.net/wiki/spaces/SNAP/pages/1977492167/3.0-
 * https://snapmaker2.atlassian.net/wiki/spaces/XIEK/pages/2001404989/Luban+SACP+--
 */
import net from 'net'
import SACP from './SACP/communication/SACP'
import TCPConnections from './SACP/connection/TCPConnection';

const sacp = new SACP();
sacp.on('request', ({ buffer }) => {
    console.log('sacp receive request', buffer)
})

const server = net.createServer()
server
    .on('connection', (socket) => {
        const connection = new TCPConnections(sacp, socket);
        sacp.setConnection(connection);

        socket.on('data', (buffer) => {
            console.log('server data', buffer)
            connection.read(buffer);
        })
        socket.on('end', () => {
            console.log('server end')
            connection.end()
        })
    })
    .on('close', () => {})
    .on('error', console.log)
    .listen(8888, '127.0.0.1', () => {
        console.log('tcp server started')

        const socket = net.createConnection(8888, '127.0.0.1', () => {
            console.log('connected server\n')
            socket.on('data', (buffer) => {
                console.log('client data', buffer)
            })
            socket.on('end', () => {
                console.log('client end')
            })

            const sacp1 = new SACP();
            const connection = new TCPConnections(sacp1, socket);
            sacp1.setConnection(connection);

            sacp1.on('request', ({ buffer }) => {
                console.log('sacp1 receive request', buffer)
            })
            sacp1.request(Buffer.from([0xaa, 0x55, 0x08, 0x00, 0x02, 0x01, 0x40, 0x02, 0x00, 0x01, 0x00, 0x01, 0x20, 0xdf, 0xfb]));
            // socket.write(Buffer.from([0xaa, 0x55, 0x08, 0x00, 0x02, 0x01, 0x40, 0x02, 0x00, 0x01, 0x00, 0x01, 0x20, 0xdf, 0xfb]));
            // socket.write(Buffer.from([0xaa, 0x55, 0x0c, 0x00, 0x02, 0x01, 0x18, 0x02, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0xa0, 0xe8, 0x03, 0x5c, 0x13]));
            // socket.end();
        })
    })

// const sacp1 = new SACP();
// sacp1.on('request', ({ buffer }) => {
//     console.log('sacp1 receive request', buffer)
// })

// const server1 = net.createServer()
// server1
//     .on('connection', (socket) => {
//         const connection = new TCPConnections(sacp, socket);
//         sacp.setConnection(connection);

//         socket.on('data', (buffer) => {
//             console.log('server1 data', buffer)
//             connection.read(buffer);
//         })
//         socket.on('end', () => {
//             console.log('server1 end')
//             connection.end()
//         })
//     })
//     .on('close', () => {})
//     .on('error', console.log)
//     .listen(8889, '127.0.0.1', () => {
//         console.log('tcp server1 started')
//     })
