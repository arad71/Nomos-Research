#!/usr/bin/env bash

set -x
set -e
function backend() {
    docker-compose run --rm backend "$@"
}
# Check whitespace for better diffs
backend black app --diff --check
# Sort imports
backend isort --check-only app
# stop the build if there are Python syntax errors or undefined names
backend flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
# exit-zero treats all errors as warnings.
backend flake8 . --count --exit-zero --max-complexity=10 --statistics