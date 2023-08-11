# Overview

## Background

G-code (RS-274) is widely used in CNC and 3D printing. As G-code is a plaintext protocol, it compromises some flexibility in exchange for readability.

We drafted a protocol "SACP" for our use throughout Snapmaker products, which provides:

- Sequence Number: When receiving a response, you can know which request it responses to. This is G-code can not provide.
- Subscription: Be able to subscribe to machine status, receiving periodical heartbeats from the machine.
- Multiple Peers: Besides the software and machine, there could be other peers act as communcation end.
- Active Messages: The controller can report error messsages actively, without a request from software side. 

## Discovery of Snapmaker machines

We use two approaches to discover networked Snapmaker machines:

| Machine | Broadcast | mDNS |
|---------|-----------|------|
| Snapmaker 2.0 series | yes | no |
| Snapmaker J1 | yes | no |
| Snapmaker Artisan | yes | no |
| Snapmaker Ray | no | yes |


- Broadcast: send 'discover' to broadcast address, machines will response with format '{Name}@{IP}|model:{model}|SACP:{SACP version}'

    - model values: "Snapmaker A150", "Snapmaker A250", "Snapmaker A350", "Snapmaker J1", "Snapmaker Artisan"
    - [source code](https://github.com/Snapmaker/Luban/blob/main/src/server/services/machine/network-discover/BroadcastMachineFinder.ts)

- mDNS: Use "PTR" queries to discover services with `service_type = "printer"` and `proto = udp & proto = tcp`.

    - Note that, with mDNS service discover, we may not know about what machine model is when we discover a "printer" service.
    - all available [services types](http://www.dns-sd.org/serviceTypes.html)
    - [source code](https://github.com/Snapmaker/Luban/blob/main/src/server/services/machine/network-discover/MulticastDNSMachineFinder.ts)


## Supported protocols of Snapmaker machines

With serial port connection:

| Machine | G-code (plaintext) | SACP |
|---------|--------------------|------|
| Snapmaker 2.0 series | yes | no |
| Snapmaker J1 | yes | no |
| Snapmaker Artisan | yes | yes |
| Snapmaker Ray | partial | yes |

With networked connection

| Machine | HTTP | SACP (over TCP) | SACP (over UDP) |
|---------|------|-----------------|-----------------|
| Snapmaker 2.0 series | yes | no | no |
| Snapmaker J1 | no | yes | no |
| Snapmaker Artisan | no | yes | no |
| Snapmaker Ray | no | no | yes |


## SACP (Snapmaker Application Communication Protocol)

There are two implementation of SACP, one over TCP connection, another over UDP packats.

- SACP over TCP: Establish a TCP long-lived connection, and send/receive SACP packets over the connection. Uses port 8888.
- SACP over UDP: Without connection establish, send/receive SACP packets via UDP packets. Users port 2016 (temporarily)
 
SACP defines as follows:

- [Data Types](Types.md) defines basic data types.
- [SACP Packet](Packet.md) defines a SACP packet should look like.

Avaible commands (editing):

- [System Commands](System-Commands.md)
- [File Commands](File-Commands.md)
- 3D printing commands (TODO)
- Laser commands (TODO)
- CNC commands (TODO)