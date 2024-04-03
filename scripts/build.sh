#!/bin/bash
set -x
# Exit in case of error
# set -e

# Build and run containers
docker compose pull || echo "There were some pull failures. This is probably because images were waiting to be built and is probably OK."
docker compose build
docker compose up --detach --remove-orphans
