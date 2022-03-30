import assert from 'assert'
import SerialPort from 'serialport'
import Business from '../../SACP/business/Business'
import BatchBufferInfo from '../../SACP/business/models/BatchBufferInfo'
import PrintBatchGcode from '../../SACP/business/models/PrintBatchGcode'
import { RequestData, ResponseCallback } from '../../SACP/communication/Dispatcher'
import Response from '../../SACP/communication/Response'

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

    it('subscribe() & unsubscribe() should work', function(done) {
        const callback: ResponseCallback = ({ response, packet }) => {
            console.log('heartbeat...')
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
            }, 600)
        })
    })

    describe('query', () => {
        it('getModuleInfo() should work', (done) => {
            business.getModuleInfo().then(res => {
                assert.equal(res.response.result, 0)
                done()
            })
        })
    
        xit('getCurrentCoordinateInfo() should work', (done) => {
            business.getCurrentCoordinateInfo().then(res => {
                assert.equal(res.response.result, 0)
                done()
            })
        })
    
        it('getMachineInfo() should work', (done) => {
            business.getMachineInfo().then(res => {
                assert.equal(res.response.result, 0)
                done()
            })
        })
    })

    describe('print', () => {
        it('stopPrint() should work', function(done) {
            this.timeout(10000)
            business.stopPrint().then(({ response }) => {
                assert.equal(response.result, 0)
                done()
            })
        })
        it('requestHome() should work', function(done) {
            this.timeout(10000)
            business.requestHome().then(({ response }) => {
                assert.equal(response.result, 0)
                done()
            })
        })
        it('startPrint() should work', function(done) {
            this.timeout(10000)
            business.setHandler(0xac, 0x02, ({ param, packet }: RequestData) => {
                const batchBufferInfo = new BatchBufferInfo().fromBuffer(param);
                console.log(batchBufferInfo);
                let content = ''
                if (batchBufferInfo.lineNumber === 0) {
                    content = 'G28\n';
                }
                const printBatchGcode = new PrintBatchGcode(batchBufferInfo.lineNumber, batchBufferInfo.lineNumber, content);
                const res = new Response(0, printBatchGcode.toBuffer())
                business.ack(0xac, 0x02, packet, res.toBuffer());
                if (!content) {
                    done()
                }
            });
            business.startPrint('0511f187b7b572dc82d1323f660e5472', 'index.gcode')
            .then(({ response, batchBufferInfo }) => {
                console.log(response, batchBufferInfo)
                // assert.equal(response.result, 0)
            })
        })
    })

})