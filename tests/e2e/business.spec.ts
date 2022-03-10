import assert from 'assert'
import SerialPort from 'serialport'
import Business from '../../SACP/business/Business'
import BatchBufferInfo from '../../SACP/business/models/BatchBufferInfo'
import PrintBatchGcode from '../../SACP/business/models/PrintBatchGcode'
import { Callback } from '../../SACP/communication/Request'

describe('business', () => {
    let serialport: SerialPort
    let business: Business
    before(async () => {
        const availPorts = await SerialPort.list()
        if (availPorts.length > 0) {
            serialport = new SerialPort(availPorts[0].path, {
                autoOpen: true,
                baudRate: 115200
            })
            business = new Business('serialport', serialport);
            serialport.on('data', (data) => {
                business.read(data)
            })
        }
    })
    after(() => {
        serialport?.close()
        serialport?.destroy()
        business?.dispose()
    })

    it('initialize should be correct', () => {
        assert.notEqual(serialport, undefined)
        assert.notEqual(business, undefined)
    })

    xit('subscribe() & unsubscribe() should work', function(done) {
        const callback: Callback = ({ response, packet }) => {
            assert.equal(response.result, 0)
            const systemStatus = response.data.readUint8(0)
            assert.equal(systemStatus, 0) // idle
        }

        business.subscribeHeartbeat({
            interval: 500
        }, callback)
        .then(({ response }) => {
            assert.equal(response.result, 0)
        })
        .then(() => {
            setTimeout(() => {
                business.unsubscribeHeartbeat(callback).then(({ response }) => {
                    assert.equal(response.result, 0)
                    done()
                })
            }, 1000)
        })
    })

    it('getModuleInfo() should work', (done) => {
        business.getModuleInfo().then(res => {
            assert.equal(res.response.result, 0)
            console.log(res.moduleInfo)
            done()
        })
    })

    xit('getCurrentCoordinateInfo() should work', (done) => {
        business.getCurrentCoordinateInfo().then(res => {
            assert.equal(res.response.result, 0)
            console.log(res.coordinateSystemInfo)
            done()
        })
    })

    xit('getMachineInfo() should work', (done) => {
        business.getMachineInfo().then(res => {
            assert.equal(res.response.result, 0)
            // console.log(res.machineInfo)
            done()
        })
    })

    xit('startPrint() should work', () => {
        business.setHandler(0xac, 0x02, ({ response }) => {
            const batchBufferInfo = new BatchBufferInfo().fromBuffer(response.data);
            console.log(batchBufferInfo);

            const printBatchGcode = new PrintBatchGcode(0, 1, 'G28\n');
            business.ack(0xac, 0x02, printBatchGcode.toBuffer());
            assert.equal(response.result, 0)
        });
        business.startPrint('0511f187b7b572dc82d1323f660e5472', 'index.ts')
        .then(({ response }) => {
            assert.equal(response.result, 0)
        })
    })
})