# snapmaker-sacp-sdk

SACP protocol implementation in TS.

## Installation

```bash
npm install -S @snapmaker/snapmaker-sacp-sdk
```

## Development

1) Install and link

```bash
npm install
npm link
```

2) In target project:

```
npm link @snapmaker/snapmaker-sacp-sdk
```

3) In SDK repo, run `npm run link` to keep watching file changes.


## Publish

Use `npm pack` to see preview of package.

### Alpha release

```
npm publish --tag alpha
```

### Official release

```
<!-- npm publish -->
npm publish --access public
```
