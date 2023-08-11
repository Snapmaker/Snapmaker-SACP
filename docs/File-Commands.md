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

## 0xb0 0x10 Start Large File Transfer

| Command Set | Command ID |
|-------------|------------|
| 0xb0 | 0x10 | 

Request Payload:

| Payload | Data Type | Description | 
|---------|-----------|-------------|
| File Name | String | File name, or file path |
| File Length | UInt32 | total bytes |
| File Chunk Count | Uint32 | number of chunks |
| MD5 | String | file content MD5 |

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

## 0xb0 0x11 Request/Send for a file chunk

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

1. Software sends 0xb0 0x10 to start a large file transfer job
2. The controller sends 0xb0 0x11 to request file chunks, the software responses with 0xb0 0x11 ACK including file chunk data
3. The controller sends 0xb0 0x02 to notify file transfer result

