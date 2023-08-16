#!/usr/bin/env bash
set -x
# Exit in case of error
set -e
pushd backend
poetry lock --no-update
popd
pushd frontend
npm install --package-lock-only
popd
