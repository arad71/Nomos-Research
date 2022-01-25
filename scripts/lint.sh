#!/usr/bin/env bash

set -x
set -e
function backend() {
    docker-compose run --rm backend "$@"
}
#backend mypy app
backend black app --check
#backend isort --check-only app
        # stop the build if there are Python syntax errors or undefined names
backend flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
        # exit-zero treats all errors as warnings. The GitHub editor is 127 chars wide
backend flake8 . --count --exit-zero --max-complexity=10 --statistics