#!/bin/bash
set -exo pipefail

BASEDIR=$(cd $(dirname "$0"); cd ../; pwd -P)

yarn run clean
mkdir dist

cd dist
ln -s ../src/assets assets
ln -s ../src/less less
