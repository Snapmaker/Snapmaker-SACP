import Request, { Callback } from '../communication/Request';
import BatchBufferInfo from './models/BatchBufferInfo';
import CoordinateSystemInfo from './models/CoordinateSystemInfo';
import GcodeFileInfo from './models/GcodeFileInfo';
import MachineInfo from './models/MachineInfo';
import MachineSize from './models/MachineSize';
import ModuleInfo from './models/ModuleInfo';
import fs from 'fs'

export default class Business extends Request {
    constructor(type: string, socket: any) {
        super(type, socket);
    }

    subscribeHeartbeat({ interval = 1000 }, callback: Callback) {
        return this.subscribe(0x01, 0xa0, interval, callback);
    }

    unsubscribeHeartbeat(callback: Callback) {
        return this.unsubscribe(0x01, 0xa0, callback);
    }

    getModuleInfo() {
        return this.send(0x01, 0x20, Buffer.alloc(0)).then(({ response, packet }) => {
            console.log(packet?.payload)
            fs.writeFileSync('./a.txt', packet?.payload!)
            const moduleInfo = new ModuleInfo();
            // const moduleInfo = ModuleInfo.parseArray(response.data);
            return { response, packet, moduleInfo };
        });
    }

    getMachineInfo() {
        return this.send(0x01, 0x21, Buffer.alloc(0)).then(({ response, packet }) => {
            const machineInfo = new MachineInfo().fromBuffer(response.data);
            return { response, packet, machineInfo };
        });
    }

    // unimplemented by master control
    getMachineSize() {
        return this.send(0x01, 0x22, Buffer.alloc(0)).then(({ response, packet }) => {
            const machineSize = new MachineSize().fromBuffer(response.data);
            return { response, packet, machineSize };
        });
    }

    // refactored by master control, wait for its update
    getCurrentCoordinateInfo() {
        return this.send(0x01, 0x30, Buffer.alloc(0)).then(({ response, packet }) => {
            const coordinateSystemInfo = new CoordinateSystemInfo().fromBuffer(response.data);
            return { response, packet, coordinateSystemInfo };
        });
    }

    startPrint(md5: string, gcodeName: string) {
        const info = new GcodeFileInfo(md5, gcodeName);
        return this.send(0xac, 0x03, info.toBuffer()).then(({ response, packet }) => {
            const batchBufferInfo = new BatchBufferInfo().fromBuffer(response.data);
            return { response, packet, batchBufferInfo };
        })
    }
}
