# TaxMan

[![Continuous Integration / Continuous Delivery](https://github.com/BIO-WA/BDRTaxMan/actions/workflows/cicd.yml/badge.svg)](https://github.com/BIO-WA/BDRTaxMan/actions/workflows/cicd.yml)

## Features

- **FastAPI** with Python 3.8
- **React 16** with Typescript, Redux, and react-router
- Postgres
- SqlAlchemy with Alembic for migrations
- Pytest for backend tests
- Jest for frontend tests
- Prettier/Eslint (with Airbnb style guide)
- Docker compose for easier development
- Nginx as a reverse proxy to allow backend and frontend on the same port

## Development

The only dependencies for this project should be docker and docker compose plugin. Get docker and the compose plugin
from
https://docs.docker.com/engine/install/ubuntu/.

### Setup

This project uses private packages, before building you will need to obtain your NPM token and add it to your
local `.env` file.

The following commands will allow you to login to the Marmelab registry which will store your token in `$HOME/.npmrc` (
on Window the directory is C:\Users\%USERNAME%)

```bash
```bash
npm config set @react-admin:registry https://registry.marmelab.com
npm login --registry=https://registry.marmelab.com
```

example .env

```bash
NPM_TOKEN="<Your token here>"
```

For more information see https://registry.marmelab.com

If you're using a different user on your system other than the first user you'll have to add these to your local `.env`
file.

```bash
USER_ID="<Your user id>"
GROUP_ID="<your group id>"
```

### Persistent data

Data for this application lives in a BIO DB instance:

| Environment | Server                                                                                                                                                                                       |
|-------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Staging     | [nomos-staging-db.postgres.database.azure.com](https://start.1password.com/open/i?a=NDOPYIX54ZELTLEXLCRF2UQINA&v=qv2jh4w2fasw37noy7d4jdeopi&i=zzgpz7s7ldvzc5eervj3oa5va4&h=my.1password.com) |
| Production  | [nomos-prod-db.postgres.database.azure.com](https://start.1password.com/open/i?a=NDOPYIX54ZELTLEXLCRF2UQINA&v=qv2jh4w2fasw37noy7d4jdeopi&i=72fvyio5crsu7p6klpb53fjyhq&h=my.1password.com)    |

### Quick Start

Starting the project

```bash
scripts/build.sh
```

This will start up your containers and create the superuser if it does not already exist.

And navigate to http://localhost:8000

_Note: If you see an Nginx error at first with a `502: Bad Gateway` page, you may have to wait for webpack to build the
development server (the nginx container builds much more quickly)._

Auto-generated docs will be at
http://localhost:8000/api/docs

You will be able to log into http://localhost:8000/admin using: username "admin@taxman.com" password "password"

### Makefile
There's a [Makefile](Makefile) included for the most common commands. To use it on ubuntu you need to have build-essential installed:
```shell
sudo apt install build-essential
```

Starting up the stack should be a matter of running:

```shell
make
```

Running `make help` will give you a list of possible commands:
```shell
 help:          Print commands help.
 build:         Build Docker containers
 up:            Up Docker containers
 stop:          Stop the stack
 start:         Start the stack
 pause:         Pause the stack
 unpause:       Unpause the stack
 lint:          Run lint on backend
 format:        Reformat code in the backend
 update-locks:  Update lockfile pre-release
 down:          Stop and remove Docker containers. Removes the containers but leaves *persistent* volumes intact. Use kill-it-with fire to remove everything.
 kill-it-with-fire: Delete everything
 restart:       Restart Docker containers
 test:          Run tests
 test_frontend: Test frontend
 test_backend:  Test backend
 restore:       Restore database snapshot and restart
 restore_db:    Restore database snapshot
 logs:          View containers logs.
                You can optionally pass an argument with the service name to limit logs
                logs backend: View `backend` container logs.
                logs nginx frontend: View `nginx` and `frontend` containers logs.
 upgrade:       Upgrade database with migrations
 downgrade:     Downgrade database with migrations
 autogenerate:  Generate a database migration from the code. eg `make autogenerate "Add New Field"`
 calculate_names: Calculate taxon name versions
 shell:         Run bash in the backend
```
### Sample data seed

There are snapshots of the production database
in https://drive.google.com/drive/u/1/folders/1uWIq2wpWmwLseFeAC6CFOfMkU1IrDKL8 the relevant (most recent) one and
download it. You can restore this into a local database called `taxman` using psql. Place this file
into the `backup` folder. Note that this will restore the most recent file.

```shell
docker compose exec backend restore
docker compose restart # generates users and runs database migrations
# or
make restore
```

Note that repeated errors at the end of the restore as follows can be safely ignored because these only exist in Azure
Cloud:

```
psql:/backup/taxman.sql:252493: ERROR:  role "azure_pg_admin" does not exist
psql:/backup/taxman.sql:252507: ERROR:  role "admin_main_" does not exist
```

### Legacy data import (Deprecated - use a database seed)

---

**Note**

this section is now deprecated although the import mechanism still works. Use a database seed as above.

Once you have set up the initial database you can import the data from WA Census data supply:

- Copy the **Raw data file URL**
  from https://dev.azure.com/BIO-WA/WA-BDR/_wiki/wikis/BDR-WA.wiki/19/WA-Herbarium-WACensus-DF
- Add it as `WACENSUS_DATA_FILE_URL` in your local .env file
- Run scripts/build.sh to ensure this setting is set
- Import data using:

```
docker compose run --rm backend python app/import.py
```

---

### Example data

Extracting example data can be performed using:

```bash
docker compose exec backend app/tools/extract_sample_data.py
```

The example data file [backend/nomos_sample_data.xlsx](backend/nomos_sample_data.xlsx) can then be uploaded to
[google drive](https://drive.google.com/drive/u/1/folders/1i5ID5i6yodmXkK5FjFZsXQJT_gfToIfL).

### Rebuilding containers:

```
docker compose build
# or
make build
```

### Restarting containers:

```
docker compose restart
# or
make restart
```

### Bringing containers down:

Note that this will delete the containers themselves

```
docker compose down
# or
make down
```


### Kill it with fire

In order to nuke your database and everything in it use:

```bash
docker compose down -v
# or
make kill-it-with-fire
```

### Logging

Logging is done using the excellent loguru:

```python
from loguru import logger

logger.info("The meaning of life: {}", 42)
```

For debugging local variables it's handy to use the [rich.console](https://rich.readthedocs.io/en/stable/console.html) functionality:

```python
from app.console import console
console.print({"some": "interesting", "data": "structure"})
console.log({"some": "interesting", "data": "structure"})
```

You can view logs using the docker logs as specified elsewhere in this file.

### Frontend Development

Alternatively to running inside docker, it can sometimes be easier
to use npm directly for quicker reloading. To run using npm:

```
cd frontend
npm install
npm start
```

This should redirect you to http://localhost:3000

### Frontend Tests

```
cd frontend
npm install
npm test
```

## Migrations

Migrations are run using alembic. To run all migrations:

```
docker compose run --rm backend alembic upgrade head
```

To create a new migration:

```
alembic revision -m "create users table"
```

And fill in `upgrade` and `downgrade` methods. For more information see
[Alembic's official documentation](https://alembic.sqlalchemy.org/en/latest/tutorial.html#create-a-migration-script).

To roll the database to a clean slate run

```bash
scripts/downgrade.sh
```

### Using `autogenerate`:

Alembic can view the status of the database and compare against the table metadata in the application, generating the
“obvious” migrations based on a comparison. This is achieved using the --autogenerate option to the alembic revision
command, which places so-called candidate migrations into our new migrations file. We review and modify these by hand as
needed, then proceed normally.

```
alembic revision --autogenerate -m "Data Model Updates."
```

_I've been working on a branch for a while and there are other migrations? How do I deal with this?_
This normally results in the error message:

> FAILED: Multiple head revisions are present for given argument 'head'; please specify a specific target
> revision, '<branchname>@head' to narrow to a specific head, or 'heads' for all heads

You can generally resolve this by merging the heads of your migrations:

```
 docker compose run --rm backend alembic merge heads --message "<Add your message here>"
```

Alternatively you can edit your migrations and change the `down_revision`

### Recreating migrations:

Up until we have data that we care about in the system:

In order to reset the clock on your db you need to do the following inside the backend container:

```bash
alembic downgrade base
rm app/alembic/versions/a61b3b720423_implement_data_model.py
alembic revision  --autogenerate -m "Implement Data Model." --rev-id a61b3b720423
```

Then run `scripts/format.sh`

## Testing

There is a helper script for both frontend and backend tests:

```
./scripts/test.sh
```

### Backend Tests

```
docker compose run backend pytest
```

any arguments to pytest can also be passed after this command

### Frontend Tests

```
docker compose run frontend test
```

This is the same as running npm test from within the frontend directory

### CI

Testing is run through the continuous integration pipeline [.github/workflows/cicd.yml](.github/workflows/cicd.yml) in
the `test` job.

## Linting

Code style is governed by the linters used in the project.
For details of those linters please look at the contents of the lint.sh and format.sh scripts.
There are two scripts which call the backend linters:

```bash
# Check code format against the code style
scripts/lint.sh

# Apply automated fixes to match the code style
scripts/format.sh
```

### CI

Linting is run through the continuous integration pipeline [.github/workflows/cicd.yml](.github/workflows/cicd.yml) in
the `lint` job.

## Logging

```
docker compose logs
```

Or for a specific service:

```
docker compose logs -f name_of_service # frontend|backend|db
```

## Deployment

The app is deployed using GitHub actions configured through [.github/workflows/cicd.yml](.github/workflows/cicd.yml).

## Creating a release

1. Get all merge requests relating to a release merged into the `develop` branch.
2. Change version numbers in:
    1. backend/pyproject.toml
    2. frontend/package.json
3. Update lock versions
   ```shell
   scripts/update-locks.sh
   ```
4. Commit changes to:
    1. backend/poetry.lock
    2. backend/pyproject.toml
    3. frontend/package.json
    4. frontend/package-lock.json
5. Push to github and merge into `develop`
6. Create a release tag in GitHub:
    1. https://github.com/BIO-WA/BDRTaxMan/releases
    2. Draft a new release
    3. Choose a tag
    4. enter new tag in format v1.x.x
    5. Click generate release notes
    6. Include a list of User Stories and tasks at the top of these release notes
       ```markdown
       ## User Stories
       * https://dev.azure.com/BIO-WA/Nomos/_workitems/edit/nnn

       ## Tasks
       * https://dev.azure.com/BIO-WA/Nomos/_workitems/edit/nnn
       ```
    7. Publish release
7. Post update into the
   Slack [staging-deployments](https://join.slack.com/share/enQtNTc0NDIxODE2MjUzMy1kZTkwNjdhNTk0YWVlY2Q0N2RmNGY1YWVmMjViZTMzMmFiNDdkODdkNjg2ZDZlMjk2YTY4ZWVhMmYzNjNmNTcw)
   channel including these release notes and get BIO technical team to run deployment into staging environment.

### Deployment Process

- Process captured in wiki: https://dev.azure.com/BIO-WA/WA-BDR/_wiki/wikis/BDR-WA.wiki/96/Developer-information

### Configuration

Environment specific configuration can be placed in a .env in the project directory on the deployment server.
Take a look at [.env.example](.env.example) for an example of how to configure the app.

#### Authentication providers

Two authentication providers are supported and can be switched between using the environment variable `AUTH_PROVIDER`

| Provider | Info                                                                                                                                                                                                           |
|----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| password | Use password based authentication. Enables password on the user edit form                                                                                                                                      |
| auth2    | Auth2 authentication is based on request headers set by the proxy https://dev.azure.com/BIO-WA/WA-BDR/_wiki/wikis/BDR-WA.wiki/70/Authentication. For local development the user details are set in nginx.conf. |

##### Testing other roles

If you want to test with other roles you can switch your auth provider to 'password' and then log in using one of the
test role based user accounts.

Alternatively when using the auth2 (default) authentication provider you need to edit the headers
in [nginx.conf](nginx/nginx.conf) to one of the other role specific users.

Here are the credentials you should use. See commented out lines in nginx.conf for examples:

| email                            | first\_name          | last\_name | role                 |
|:---------------------------------|:---------------------|:-----------|:---------------------|
| READER@example.com               | READER               | Demo User  | READER               |
| OFFICER@example.com              | OFFICER              | Demo User  | OFFICER              |
| MANAGER@example.com              | MANAGER              | Demo User  | MANAGER              |
| APPLICATION\_SUPPORT@example.com | APPLICATION\_SUPPORT | Demo User  | APPLICATION\_SUPPORT |
| SUPER\_ADMIN@example.com         | SUPER\_ADMIN         | Demo User  | SUPER\_ADMIN         |

### Environments

In order to deploy to the **staging** environment push code to the `staging` branch via a pull request into **staging**.
This calls a script (action.bash) which fetches the latest code for that branch and builds the stack.

## Project Layout

```
backend
└── app
    ├── alembic
    │   └── versions # where migrations are located
    ├── api
    │   └── api_v1
    │       └── endpoints
    ├── core    # config
    ├── db      # db models
    ├── tests   # pytest
    └── main.py # entrypoint to backend

frontend
└── public
└── src
    ├── components
    │   └── Home.tsx
    ├── config
    │   └── index.tsx   # constants
    ├── __tests__
    │   └── test_home.tsx
    ├── index.tsx   # entrypoint
    └── App.tsx     # handles routing
```
