#! /bin/bash
# npm version prerelease --preid=alpha -m ":package:	%s"
npm run build
npm publish --tag dev
git push --no-verify
