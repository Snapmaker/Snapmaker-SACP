import Dispatcher, { ResponseCallback } from '../communication/Dispatcher';
import BatchBufferInfo from './models/BatchBufferInfo';
import CoordinateSystemInfo from './models/CoordinateSystemInfo';
import GcodeFileInfo from './models/GcodeFileInfo';
import MachineInfo from './models/MachineInfo';
import MachineSize from './models/MachineSize';
import ModuleInfo from './models/ModuleInfo';
import MovementInstruction, { MoveDirection } from './models/MovementInstruction'
import LaserCalibration from './models/LaserCalibration'
import SetLaserPower from './models/SetLaserPower';

import { readString, readUint32, stringToBuffer, writeFloat, writeInt16, writeInt8, writeUint32, writeUint8 } from '../helper';
import Laserinfo from './models/LaserInfo'
import FDMInfo from './models/FDMInfo'
import GetHotBed from './models/GetHotBed'
import ExtruderOffset from './models/ExtruderOffset'
import ExtruderMovement from './models/ExtruderMovement'
import { Console, dir } from 'console';

export default class Business extends Dispatcher {
    subscribeHeartbeat({ interval = 1000 }, callback: ResponseCallback) {
        return this.subscribe(0x01, 0xa0, interval, callback);
    }

    unsubscribeHeartbeat(callback: ResponseCallback) {
        return this.unsubscribe(0x01, 0xa0, callback);
    }

    getModuleInfo() {
        return this.send(0x01, 0x20, Buffer.alloc(0)).then(({ response, packet }) => {
            const moduleInfo = ModuleInfo.parseArray(response.data);
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

    movementInstruction(direction: MoveDirection, distance: number) {
        const info = new MovementInstruction(direction, distance)
        return this.send(0x01, 0x34, info.toBuffer()).then(({ response, packet }) => {
            return { response, packet };
        });
    }

    requestHome(number: number) {
        return this.send(0x01, 0x35, Buffer.alloc(1, number)).then(({ response, packet }) => {
            return { response, packet };
        });
    }

    startPrint(md5: string, gcodeName: string, headType: number) {
        const info = new GcodeFileInfo(md5, gcodeName, headType);
        return this.send(0xac, 0x03, info.toBuffer()).then(({ response, packet }) => {
            return { response, packet }
        });
    }

    stopPrint() {
        return this.send(0xac, 0x06, Buffer.alloc(0)).then(({ response, packet }) => {
            return { response, packet };
        });
    }

    pausePrint() {
        return this.send(0xac, 0x04, Buffer.alloc(0)).then(({ response, packet }) => {
            return { response, packet }
        });
    }

    resumePrint() {
        return this.send(0xac, 0x05, Buffer.alloc(0)).then(({ response, packet }) => {
            return { response, packet }
        });
    }

    getGocdeFile(){
        return this.send(0xac, 0x00, Buffer.alloc(0)).then(({ response, packet }) => {
            const gcodeFileInfo = new GcodeFileInfo().fromBuffer(response.data);
            return { response, packet, gcodeFileInfo };
        });
    }

    laserCalibration(calibrationMode: number){
        const info = new LaserCalibration(calibrationMode);
        return this.send(0xa8, 0x02, info.toBuffer()).then(({ response, packet }) => {
            return { response, packet };
        });
    }

    laserCalibrationSave(type: number){
        return this.send(0xa8, 0x03, Buffer.alloc(1, type)).then(({ response, packet }) => {
            return { response, packet };
        });
    }

    getLaserInfo(key: number){
        const info = new Laserinfo(key)
        return this.send(0x12, 0x01, info.toBuffer()).then(({response, packet}) =>{
            const LaserInfo = new Laserinfo().fromBuffer(response.data)
            return {response, packet, LaserInfo}
        })
    }

    SetLaserPower(key: number, power: number){
        const info = new SetLaserPower(key, power)
        return this.send(0x12, 0x02, info.toBuffer()).then(({ response, packet }) => {
            return { response, packet };
        });
    }

    SetBrightness(key: number, brightness: number){
        const tobuffer = Buffer.alloc(1 + 1, 0);
        writeUint8(tobuffer, 0, key);
        writeUint8(tobuffer, 1, brightness);
        return this.send(0x12, 0x03, tobuffer).then(({ response, packet }) => {
            return { response, packet };
        });
    }

    SetFocalLength(key: number, focalLength: number){
        const tobuffer = Buffer.alloc(1 + 1, 0);
        writeUint8(tobuffer, 0, key);
        writeUint8(tobuffer, 1, focalLength);
        return this.send(0x12, 0x04, tobuffer).then(({ response, packet }) => {
            return { response, packet };
        });
    }

    TemperatureProtect(key: number, protectTemperature: number, recoverTemperature: number){
        const tobuffer = Buffer.alloc(1 + 1 + 1, 0);
        writeUint8(tobuffer, 0, key);
        writeUint8(tobuffer, 1, protectTemperature);
        writeInt8(tobuffer, 2, recoverTemperature);
        return this.send(0x12, 0x05, tobuffer).then(({ response, packet }) => {
            return { response, packet };
        });
    }

    //主控主控设置到ESP32的蓝牙mac给屏幕未实现

    SetLaserLock(key: number, lockStatus: number){
        const tobuffer = Buffer.alloc(1 + 1 , 0);
        writeUint8(tobuffer, 0, key);
        writeUint8(tobuffer, 1, lockStatus);
        return this.send(0x12, 0x07, tobuffer).then(({ response, packet }) => {
            return { response, packet };
        });
    }

    //调试中。。。
    GetFDMInfo(key: number){
        const info = new FDMInfo(key)
        return this.send(0x10, 0x01, info.toBuffer()).then(({response, packet}) =>{
            // console.log('FDM',info.toBuffer,response,packet)
            const getFDMInfo = new FDMInfo().fromBuffer(response.data)
            return {response, packet, getFDMInfo}
        }) 
    }
    
    GetHotBed(key: number){
        const info = new GetHotBed(key)
        return this.send(0x14, 0x01, info.toBuffer()).then(({ response, packet }) => {
            const hotBedInfo = new GetHotBed().fromBuffer(response.data)
            return {response, packet, hotBedInfo}
        });
    }

    SetExtruderTemperature(key: number, extruderIndex: number, temperature: number){
        const tobuffer = Buffer.alloc(1 + 1 + 2, 0);
        writeUint8(tobuffer, 0, key);
        writeUint8(tobuffer, 1, extruderIndex);
        writeInt16(tobuffer, 2, temperature);
        return this.send(0x10, 0x02, tobuffer).then(({ response, packet }) => {
            return { response, packet };
        });
    }
 
    SetFilamentstatus(key: number, extruderIndex: number, filamentstatus: number){
        const tobuffer = Buffer.alloc(1 + 1 + 1, 0);
        writeUint8(tobuffer, 0, key);
        writeUint8(tobuffer, 1, extruderIndex);
        writeUint8(tobuffer, 2, filamentstatus);
        return this.send(0x10, 0x04, tobuffer).then(({ response, packet }) => {
            return { response, packet };
        });
    }

    SwitchExtruder(key: number, extruderIndex: number){
        const tobuffer = Buffer.alloc(1 + 1, 0);
        writeUint8(tobuffer, 0, key);
        writeUint8(tobuffer, 1, extruderIndex);
        return this.send(0x10, 0x05, tobuffer).then(({ response, packet }) => {
            return { response, packet };
        });
    }

    SetExtruderSpeed(key: number, fansIndex: number, speedLevel: number){
        const tobuffer = Buffer.alloc(1 + 1 + 1);
        writeUint8(tobuffer, 0, key);
        writeUint8(tobuffer, 1, fansIndex);
        writeUint8(tobuffer, 2, speedLevel);
        return this.send(0x10, 0x06, tobuffer).then(({ response, packet }) => {
            return { response, packet };
        });
    }

    SetExtruderOffset(key: number, index: number, direction: number, distance: number){
        const info = new ExtruderOffset(key, index, direction, distance);
        return this.send(0x10, 0x07, info.toBuffer()).then(({response, packet}) =>{
            return {response, packet}
        }) 
    }

    GetExtruderOffset(key: number){
        return this.send(0x10, 0x08, Buffer.alloc(1, key)).then(({response, packet}) =>{
            const ExtruderOffsetInfo = new ExtruderOffset().fromBuffer(response.data)
            return {response, packet, ExtruderOffsetInfo}
        }) 
    }

    ExtruderMovement(key: number, movementType: number, lengthIn: number, speedIn: number, lengthOut: number, speedOut: number){
        const info = new ExtruderMovement(key, movementType, lengthIn, speedIn, lengthOut, speedOut)
        return this.send(0x10, 0x09, info.toBuffer()).then(({response, packet}) =>{
            return {response, packet}
        }) 
    }    
}
