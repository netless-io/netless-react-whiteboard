#!/bin/bash
set -exo pipefail

BASEDIR=$(cd $(dirname "$0"); cd ../; pwd -P)

yarn run clean

lessc src/less/index.less dist/index.css
node scripts/svg2base64.js
