# System Commands

## 0x01 0x02 Execute G-code

| Command Set | Command ID |
|-------------|------------|
| 0x01 | 0x02 | 

Request Payload:

| Payload | Data Type | Description | 
|---------|-----------|-------------|
| G-code | String | G-code to be executed |

ACK Payload:

| Payload | Data Type | Description |
|---------|-----------|-------------|
| Result | UInt8 | result = 0 means success |


## 0x01 0x20 Get Module Info List

| Command Set | Command ID |
|-------------|------------|
| 0x01 | 0x20 | 

Request Payload:

| Payload | Data Type | Description | 
|---------|-----------|-------------|
| - | - | - |

ACK Payload:

| Payload | Data Type | Description |
|---------|-----------|-------------|
| Result | UInt8 | result = 0 means success |
| module info list | Array<ModuleInfo> | an array of all modules |

Brief structure of `class ModuleInfo`:

- key: UInt8, unique module key
- moduleId: UInt16, Indicate which kind of module it is
- moduleIndex: UInt8
- moduleState: UInt8
- serialNumber: UInt32
- hardwareVersion: UInt8
- firmwareVersion: String

Checkout [Modules](./Modules) for all available module IDs.

## 0x01 0x21 Get Machine Info

| Command Set | Command ID |
|-------------|------------|
| 0x01 | 0x21 | 

Request Payload:

| Payload | Data Type | Description | 
|---------|-----------|-------------|
| - | - | - |

ACK Payload:

| Payload | Data Type | Description |
|---------|-----------|-------------|
| Result | UInt8 | result = 0 means success |
| Machine Model ID | UInt8 | See machine model ID list below |
| Hardware Version | UInt8 | hardware version |
| Hardware Serial Number | UInt32 | machine serial number (internal use) |
| Firmware Version | String | firmware version |
| Serial Number | String | machine serial number (SN Code) for warrenty support |

Machine Modal IDs:

- 0: Snapmaker A150
- 1: Snapmaker A250
- 2: Snapmaker A350
- 3: Snapmaker Artisan
- 4: Snapmaker J1
- 5: Snapmaker Ray

