#!/bin/bash
set -x
# Exit in case of error
set -e

# Build and run containers
docker-compose pull
docker-compose up --detach --remove-orphans --build
