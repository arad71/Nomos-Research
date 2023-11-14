.PHONY: build up down restart test_frontend test_backend upgrade_db logs

default: up

# help:		Print commands help.
help : Makefile
	@sed -n 's/^#//p' $<

# build:		Build Docker containers
build:
	docker compose build

# up:		Up Docker containers
up:
	scripts/build.sh

# down:		Down Docker containers
down:
	docker compose down

# kill-it-with-fire: Delete everything
kill-it-with-fire:
	docker compose down -v

# restart:	Restart Docker containers
restart:
	docker compose restart

# test:		Run tests
test: test_backend test_frontend

# test_frontend: Test frontend
test_frontend:
	docker compose run frontend test

# test_backend:	Test backend
test_backend:
	docker compose run backend pytest

# restore:	Restore database snapshot and restart
restore: restore_db restart

# restore_db:	Restore database snapshot
restore_db:
	docker compose run --rm backend restore

# logs:		View containers logs.
#		You can optionally pass an argument with the service name to limit logs
#		logs backend: View `backend` container logs.
#		logs nginx frontend: View `nginx` and `frontend` containers logs.
logs:
	@docker compose logs --tail 100 -f $(filter-out $@,$(MAKECMDGOALS))

# upgrade:	Upgrade database with migrations
upgrade:
	docker compose run --rm backend alembic upgrade head

# shell:		Run bash in the backend
shell:
	@docker compose exec backend bash
