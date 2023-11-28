#! /usr/bin/env bash

# Exit in case of error
set -e
env
docker compose run backend env
docker compose run backend pytest
docker compose run frontend test
