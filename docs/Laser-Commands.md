# Laser Commands


## 0x12 0x01 Get Laser Module Info

| Command Set | Command ID |
|-------------|------------|
| 0x12 | 0x01 | 

Request Payload:

| Payload | Data Type | Description |
|---------|-----------|-------------|
| key | UInt8 | module key |

ACK Payload:

| Payload | Data Type | Description |
|---------|-----------|-------------|
| Result | UInt8 | result = 0 received |
| Laser Tool Head Info | see `class LaserToolHeadInfo` | Current state of specified laser module |


Brief info of `class LaserToolHeadInfo`
```
LaserToolHeadInfo:

- key: UInt8
- headStatus: UInt8, TODO
- laserFocalLength: Float, focal length of the laser
- platformHeight: Float, z position when the laser head touches the platform
- axisCenterHeight: Float, z position of rotary module
- laserTubeState: Float * 2, current power and target power
```

Note: You probably don't need to know laser info.


## 0x12 0x02 Set Laser Power

| Command Set | Command ID |
|-------------|------------|
| 0x12 | 0x02 | 

Request Payload:

| Payload | Data Type | Description |
|---------|-----------|-------------|
| key | UInt8 | module key |
| power | Float | target power value (0-100) |

ACK Payload:

| Payload | Data Type | Description |
|---------|-----------|-------------|
| Result | UInt8 | result = 0 received |


## 0x12 0x04 Set Laser Focal Length

| Command Set | Command ID |
|-------------|------------|
| 0x12 | 0x04 | 

Request Payload:

| Payload | Data Type | Description |
|---------|-----------|-------------|
| key | UInt8 | module key |
| focal length| Float | Set focal length |

ACK Payload:

| Payload | Data Type | Description |
|---------|-----------|-------------|
| Result | UInt8 | result = 0 received |


## 0x12 0x08 Set Platform Height

| Command Set | Command ID |
|-------------|------------|
| 0x12 | 0x08 | 

Request Payload:

| Payload | Data Type | Description |
|---------|-----------|-------------|
| key | UInt8 | module key |
| platform height | Float | Set platform height |

ACK Payload:

| Payload | Data Type | Description |
|---------|-----------|-------------|
| Result | UInt8 | result = 0 received |

