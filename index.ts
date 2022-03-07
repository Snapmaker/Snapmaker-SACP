/**
 * documents:
 * https://snapmaker2.atlassian.net/wiki/spaces/SNAP/pages/1984824794
 * https://snapmaker2.atlassian.net/wiki/spaces/embedded/pages/1815840545/SACP+packet
 * https://snapmaker2.atlassian.net/wiki/spaces/SNAP/pages/1977492167/3.0-
 * https://snapmaker2.atlassian.net/wiki/spaces/XIEK/pages/2001404989/Luban+SACP+--
 */
import net from 'net'
import Business from './SACP/business/Business';

const server = net.createServer()
server
    .on('connection', (socket) => {
        const b = new Business('tcp', socket)
        b.setHandler(0x01, 0x00, (p) => {
            console.log('server handler')
            setInterval(() => {
                b.ack(0x01, 0xa0, Buffer.from([0x01, 0x00]));
            }, 1000)
        })
        socket.on('data', (buffer) => {
            console.log('server data', buffer)
            b.read(buffer);
        })
        socket.on('end', () => {
            console.log('server end')
            // b.end()
        })
    })
    .on('close', () => {})
    .on('error', console.log)
    .listen(8888, '127.0.0.1', () => {
        console.log('tcp server started')

        const socket1 = net.createConnection(8888, '127.0.0.1', () => {
            console.log('connected server\n')
            socket1.on('data', (buffer) => {
                console.log('client data', buffer)
                b1.read(buffer)
            })
            socket1.on('end', () => {
                console.log('client end')
            })

            const b1 = new Business('tcp', socket1);
            b1.subHeartbeat({
                interval: 1000
            }, (p) => {
                if (p) {
                    console.log('success', p.response.data)
                }
            })
            // b1.subHeartbeat({
            //     interval: 1000
            // }, console.log)
            // sacp1.on('request', ({ buffer }) => {
            //     console.log('sacp1 receive request', buffer)
            // })
            // sacp1.request(Buffer.from([0xaa, 0x55, 0x08, 0x00, 0x02, 0x01, 0x40, 0x02, 0x00, 0x01, 0x00, 0x01, 0x20, 0xdf, 0xfb])); // 获取模组信息
            // socket.write(Buffer.from([0xaa, 0x55, 0x08, 0x00, 0x02, 0x01, 0x40, 0x02, 0x00, 0x01, 0x00, 0x01, 0x20, 0xdf, 0xfb]));
            // socket.write(Buffer.from([0xaa, 0x55, 0x0c, 0x00, 0x02, 0x01, 0x18, 0x02, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0xa0, 0xe8, 0x03, 0x5c, 0x13])); // 心跳推送
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
