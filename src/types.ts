import Packet from "./communication/Packet";
import Response from "./communication/Response";

export type ResponseData = {
    response: Response;
    packet: Packet;
    data?: Buffer;
}

export type RequestData = {
    param: Buffer,
    packet: Packet
}

export type ResponseCallback = (data: ResponseData) => void;
export type RequestCallback = (data: RequestData) => void;

export interface Serializable {
    toBuffer(): Buffer;

    fromBuffer(buffer: Buffer): any;
}
