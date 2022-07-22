#! /bin/bash
npm version '0.0.'$(date +%Y%m%d%H%M)
npm run build
npm publish --tag dev ./dist/
git push --no-verify