#!/bin/bash
set -exo pipefail

BASEDIR=$(cd $(dirname "$0"); cd ../; pwd -P)
cd $BASEDIR

node scripts/svg2base64.js