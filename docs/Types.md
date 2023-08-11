# Data Types

Note: We use little endian as the byte order.

## Boolean

Size: 1 Byte
Values: 0 or 1, 1 for true, 0 for false

## UInt8, UInt16, UInt32

Unsigned intergers in Little Endian.

## Int8, Int16, Int32

Signed intergers in Little Endian.

Used when a negative value is required.

## Float

Floating number, store value * 1000 in UInt32 format.

## String

length in UInt16 format, then followed by the string content.

| Byte 0 - Byte 1 | Byte 2 - Byte N |
| ----------------| ----------------|
| length in UInt16 | string content |
