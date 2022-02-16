#!/usr/bin/env bash
set -x
set -e
set -u
cd /home/azureuser/bdr/BDRTaxMan
git checkout staging
git pull
# ignore docker-compose.override.yml using env variable
COMPOSE_FILE=docker-compose.yml scripts/build.sh