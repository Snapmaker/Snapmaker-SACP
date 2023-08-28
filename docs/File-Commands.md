# File Commands

## 0xb0 0x02 File Transfer Result

| Command Set | Command ID |
|-------------|------------|
| 0xb0 | 0x10 | 

Request Payload:

| Payload | Data Type | Description |
|---------|-----------|-------------|
| Result | UInt8 | result = 0 means success |

ACK Payload:

| Payload | Data Type | Description |
|---------|-----------|-------------|
| Result | UInt8 | result = 0 received |

results:

- 0: file transfer completed
- 1: failed to validate the file
- 2: timeout
- 12: hardware error

Usually, the Controller/Screen peer uses 0xb0 0x02 to notify software that file transfer has been done. The software only needs to receive the message and send ACK back.

## 0xb0 0x10 Start Compressed File Transfer

This command starts a compressed file transfer, ususally used by client to notify controller a large file transfer begins.

We use standard zlib deflate algorithm to compresss the file content. In Python, it's `zlib.compress()`; in Node.js, it's `zlib.deflate()`.

| Command Set | Command ID |
|-------------|------------|
| 0xb0 | 0x10 | 

Request Payload:

| Payload | Data Type | Description | 
|---------|-----------|-------------|
| File Name | String | File name, or file path |
| File Length | UInt32 | total bytes of original file |
| File Chunk Count | Uint32 | number of chunks of compressed file |
| MD5 | String | file content MD5 of compressed file |

ACK Payload:

| Payload | Data Type | Description |
|---------|-----------|-------------|
| Result | UInt8 | result = 0 means success |


results:

- 0: Ok, starts file transfer
- 6: Wrong parameters
- 9: Resource unavailable (maybe file size too big)
- 12: Hardware error
- 13: Machine state unavailable (current machine state forbits file transfer)

## 0xb0 0x11 Request for/Send a compressed file chunk

This is used by controller to request for a compressed file chunk (by index), and for the client to send (ack) a compressed file chunk.

| Command Set | Command ID |
|-------------|------------|
| 0xb0 | 0x11 | 

Request Payload:

| Payload | Data Type | Description | 
|---------|-----------|-------------|
| reserved field | String | reserved feild, unused |
| Chunk Index | UInt32 | chunk index, starts from 0 |

ACK Payload:

| Payload | Data Type | Description |
|---------|-----------|-------------|
| MD5 | String | MD5 of that chunk (optional) |
| Chunk Index | UInt32 | chunk index, starts from 0 |
| Chunk Content | String | chunk content |

## Note: Procedure of file transfer

1. Software sends 0xb0 0x10 to start a compressed file transfer job
2. The controller sends 0xb0 0x11 to request file chunks, the software responses with 0xb0 0x11 ACK including file chunk data
3. The controller sends 0xb0 0x02 to notify file transfer result

