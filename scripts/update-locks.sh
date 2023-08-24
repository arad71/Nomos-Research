#!/usr/bin/env bash
set -x
# Exit in case of error
set -e
pushd backend
poetry install
popd
pushd frontend
npm install
popd
