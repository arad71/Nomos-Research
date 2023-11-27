.PHONY: build up down restart test_frontend test_backend upgrade_db logs autogenerate

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

# stop:		Stop the stack
stop:
	docker compose stop

# start:		Start the stack
start:
	docker compose start

# pause:		Pause the stack
pause:
	docker compose pause

# unpause:		Unpause the stack
unpause:
	docker compose unpause

# lint:		Run lint on backend
lint:
	scripts/lint.sh

# format:	Reformat code in the backend
format:
	scripts/format.sh

# update-locks:	Update lockfile pre-release
update-locks:
	scripts/update-locks.sh

# down:		Stop and remove Docker containers. Removes the containers but leaves *persistent* volumes intact. Use kill-it-with fire to remove everything.
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

dev:
	make
	make logs backend frontend

# logs:		View containers logs.
#		You can optionally pass an argument with the service name to limit logs
#		logs backend: View `backend` container logs.
#		logs nginx frontend: View `nginx` and `frontend` containers logs.
logs:
	@docker compose logs --tail 100 -f $(filter-out $@,$(MAKECMDGOALS))

# upgrade:	Upgrade database with migrations
upgrade:
	docker compose run --rm backend alembic upgrade head

# downgrade:	Downgrade database with migrations
downgrade:
	docker compose run --rm backend alembic downgrade -1

# autogenerate:	Generate a database migration from the code. eg `make autogenerate "Add New Field"`
autogenerate:
	docker compose run --rm backend alembic revision --autogenerate -m "$(MAKECMDGOALS)"

# calculate_names:	Calculate taxon name versions
calculate_names:
	docker compose run --rm backend app/tools/taxon_name_calculation.py

# shell:		Run bash in the backend
shell:
	@docker compose exec backend bash
