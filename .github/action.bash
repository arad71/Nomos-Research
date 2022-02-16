#!/usr/bin/env bash
# Copy this file into the correct location referenced by workflows/cicd.yml and make it executable
set -x
set -e
set -u
cd /home/azureuser/bdr/BDRTaxMan
git checkout staging
git pull
# ignore docker-compose.override.yml using env variable
COMPOSE_FILE=docker-compose.yml scripts/build.sh