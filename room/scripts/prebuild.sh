#!/bin/bash
set -exo pipefail

BASEDIR=$(cd $(dirname "$0"); cd ../; pwd -P)

yarn run clean
mkdir dist
node scripts/svg2base64.js

cd dist
ln -s ../src/less less
