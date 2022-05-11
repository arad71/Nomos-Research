#!/bin/bash
set -x
# Exit in case of error
set -e

docker ps
docker-compose logs backend
docker-compose restart backend
# Run migrations
docker-compose run --rm backend alembic downgrade base
