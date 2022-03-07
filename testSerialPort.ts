import SerialPort from 'serialport'
import SACPBusiness, { HandlerResponse } from './SACP/business/Business'

(async function() {
    // console.log(SerialPort)
    const ports = await SerialPort.list()
    console.log(ports)
    // return;
    if (ports && ports.length) {
        const sp = new SerialPort(ports[0].path, { autoOpen: false, baudRate: 115200 })
        // console.log(sp)
        const b = new SACPBusiness('serialport', sp);
        sp.on('data', (data) => {
            console.log('from sp', data)
            b.communication.receive(data)
        })
        sp.open();


        function cb(p: HandlerResponse) {
            console.log(
                new Date(),
                'receive heartbeat from ', p.packet.header.senderId,
                '\nresult is ', p.response.result,
                '\nsystem state ', p.response.data
            )
        }

        // b.subHeartbeat({
        //     interval: 1000
        // }, cb)
        // setTimeout(() => {
        //     b.unsubscribe(0x01, 0xa0, cb).then(() => {
        //         console.log('unsubscribed heartbeat')
        //     })
        // }, 5000);
        
        b.send(0x01, 0x21, Buffer.alloc(0)).then(console.log)
        // b.send(0xac, 0x03, ) // 开始打印
    }
})()