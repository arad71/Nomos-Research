#!/bin/bash
set -x
# Exit in case of error
set -e

# Run migrations
docker-compose run --rm backend alembic downgrade base
