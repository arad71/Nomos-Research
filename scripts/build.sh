#!/bin/bash
set -x
# Exit in case of error
# set -e

# Build and run containers
docker compose pull --ignore-buildable --ignore-pull-failures
docker compose build
docker compose up --detach --remove-orphans
