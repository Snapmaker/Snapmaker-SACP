import assert from 'assert'
import chai from 'chai'
import spies from 'chai-spies'
import Communication from '../../SACP/communication/Communication'
import Packet from '../../SACP/communication/Packet'

chai.use(spies)

describe('communication', () => {
    let communication: Communication
    beforeEach(() => {
        communication = new Communication()
    })

    afterEach(() => {
        communication.dispose()
    })

    describe('#receive()', () => {
        it('a packet for a buffer', (done) => {
            const buf = Buffer.from([0xaa, 0x55, 0x0c, 0x00, 0x02, 0x01, 0x18, 0x02, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0xa0, 0xe8, 0x03, 0x5c, 0x13])
            communication.once('request', (packet: Packet) => {
                assert.deepEqual(buf, packet.toBuffer())
                done()
            })
            communication.receive(buf)
        })
        it('a packet for a redundant buffer', (done) => {
            const buf = Buffer.from([0xaa, 0x55, 0x08, 0x00, 0x02, 0x01, 0x40, 0x02, 0x00, 0x01, 0x00, 0x01, 0x20, 0xdf, 0xfb])
            const redundantBuf = Buffer.concat([Buffer.from([0xcc, 0xbb]), buf, Buffer.from([0x33, 0x11])])
            communication.once('request', (packet: Packet) => {
                assert.deepEqual(buf, packet.toBuffer())
                done()
            })
            communication.receive(redundantBuf)
        })
        it('a packet for multi buffer', (done) => {
            const buf1 = Buffer.from([0xaa, 0x55, 0x31, 0x00, 0x01, 0x01, 0x70, 0x01, 0x00, 0x01, 0x00, 0x01, 0x21, 0x00, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x08, 0x00, 0x32, 0x2e, 0x30, 0x2e, 0x39, 0x2e, 0x31, 0x00, 0x00, 0x00])
            const buf2 = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x71])
            communication.once('request', (packet: Packet) => {
                assert.deepEqual(Buffer.concat([buf1, buf2]), packet.toBuffer())
                done()
            })
            communication.receive(buf1)
            communication.receive(buf2)
        })
        it('incorrect buffer contains packet SOF', () => {
            communication.receive(Buffer.from([0xaa, 0x55, 0x00]))
            assert.deepEqual(Buffer.alloc(0), communication.getReceiveBuffer());
        })
    })

    describe('#getSequence()', () => {
        it('should be 1 when first call', () => {
            Communication.resetSequence()
            assert.equal(1, communication.getSequence())
        })
        it('should always increase', () => {
            assert.equal(true, communication.getSequence() < communication.getSequence())
        })
        it('should be 1 when reaching the top limit', () => {
            Communication.setInitialSequence(0xffff)
            assert.equal(1, communication.getSequence());
        })
    })

    describe('#send()', () => {
        it('should send correctly', () => {
            const connection = {
                write() {},
                read() {},
                end() {}
            }
            chai.spy.on(connection, ['write'])

            communication.setConnection(connection)
            communication.send(Buffer.alloc(15))
            chai.expect(connection.write).to.have.been.called()

            chai.spy.restore(connection)
        })
    })
})