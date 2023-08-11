# SACP Packet

## Packet Format

| Byte(s) | Data Type | Description |
| ------- | --------- | ----------- |
| 0 - 1 | fixed bytes | SOF, it's always 0xAA 0x55 |
| 2 - 3 | UInt16 | N - 7, which is total bytes from byte 7 to byte N |
| 4 | UInt8 | Version of protocol, defaults to 0x01 |
| 5 | UInt8 | Receiver ID |
| 6 | UInt8 | CRC8 checksum of bytes 0-5 |
| 7 | UInt8 | Sender ID |
| 8 | UInt8 | Attribute |
| 9 - 10 | UInt16 | Sequence |
| 11 | UInt8 | Command Set |
| 12 | UInt8 | Command ID |
| 13 - (N - 2) | vary | Payload |
| (N-1) - N | UInt16 | TCP/IP checksum of byte 7 to byte (N - 2) |

SACP has a 13-byte header and variable length of payload.

### Byte 0 - Byte 1: SOF

SACP uses `0xAA 0x55` as its SOF, which indicates the start of an packet.

### Byte 2 - Byte 3: N - 7

SACP has a CRC8 checksum on byte 0 to byte 6, which means first 7 bytes of the packet can detectmine if received buffer is a SACP packet or not.

Once checksum is validated, then later bytes (from byte 7 to byte N) can be determined from the length.

### Byte 4: Version

Protocol version, now we only uses 0x01.

### Byte 5: Receiver ID

| Peer ID | Peer |
|---------| -----|
| 0 | Software |
| 1 | Controller |
| 2 | Screen (Snapmaker J1 & Artisan) |


### Byte 6: CRC8 checksum of byte 0 to byte 5

CRC8 checksum, see https://en.wikipedia.org/wiki/Cyclic_redundancy_check

### Byte 7: Sender ID

See Byte 5.

### Byte 8: Attribute

type: UInt8

* 0 - Request
* 1 - ACK

### Byte 9 - Byte 10: Sequence

type: UInt16

Unique number of sequence (reuse circularly), response will have the same sequence number as the request. This makes it possible to identify the 1 - 1 relation of request and response.

In our implementation, we have a internal counter, every time we are sending a new request packet, we increase the counter as the new sequence.

### Byte 11: Command Set

type: UInt8

Command set the command belongs to.

We group related commands into the same command set.

### Byte 12: Command ID

type: UInt8

Command ID the command has.

By unique command set and commnad ID, we specify a command.

### Byte 13 - Byte (N - 2): Payload

Payload format is defined by specific command.

### Byte (N - 1) - Byte N: Checksum

type: UInt16

TCP/IP checksum of byte 7 to byte (N - 2), see https://locklessinc.com/articles/tcp_checksum/