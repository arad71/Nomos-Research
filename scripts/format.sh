#!/usr/bin/env bash

set -x
set -e
function backend() {
    docker-compose run --rm backend "$@"
}
#backend autoflake --remove-all-unused-imports --recursive --remove-unused-variables --in-place app --exclude=__init__.py
backend black app
backend isort app