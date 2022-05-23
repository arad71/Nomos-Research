# TaxMan

[![Continuous Integration / Continuous Delivery](https://github.com/BIO-WA/BDRTaxMan/actions/workflows/cicd.yml/badge.svg)](https://github.com/BIO-WA/BDRTaxMan/actions/workflows/cicd.yml)

## Features

- **FastAPI** with Python 3.8
- **React 16** with Typescript, Redux, and react-router
- Postgres
- SqlAlchemy with Alembic for migrations
- Pytest for backend tests
- Jest for frontend tests
- Perttier/Eslint (with Airbnb style guide)
- Docker compose for easier development
- Nginx as a reverse proxy to allow backend and frontend on the same port

## Development

The only dependencies for this project should be docker and docker-compose.


### Setup

This project uses private packages, before building you will need to obtain your NPM token and add it to your local `.env` file.

The following commands will allow you to login to the marmelab registry which will store your token in `$HOME/.npmrc`
```bash
npm config set @react-admin:registry https://registry.marmelab.com
npm login --registry=https://registry.marmelab.com
```

example .env
```bash
NPM_TOKEN="<Your token here>"
```
For more information see https://registry.marmelab.com

If you're using a different user on your system other than the first user you'll have to add these to your local `.env` file.
```bash
USER_ID="<Your user id>"
GROUP_ID="<your group id>"
```

### Quick Start

Starting the project

```bash
scripts/build.sh
```
This will start up your containers and create the super user if it does not already exist.

And navigate to http://localhost:8000

_Note: If you see an Nginx error at first with a `502: Bad Gateway` page, you may have to wait for webpack to build the development server (the nginx container builds much more quickly)._

Auto-generated docs will be at
http://localhost:8000/api/docs

You will be able to log into http://localhost:8000/admin using: username "admin@taxman.com" password "password"

### Initial data load
Once you have set up the initial database you can import the data from WA Census data supply:

* Copy the **Raw data file URL** from https://dev.azure.com/BIO-WA/WA-BDR/_wiki/wikis/BDR-WA.wiki/19/WA-Herbarium-WACensus-DF
* Add it as `WACENSUS_DATA_FILE_URL` in your local .env file
* Run scripts/build.sh to ensure this setting is set
* Import data using:
```
docker-compose run --rm backend python app/import.py
```

### Example data

Extracting example data can be performed using:

```bash
docker-compose exec backend app/tools/extract_sample_data.py
```

The example data file [backend/nomos_sample_data.xlsx](backend/nomos_sample_data.xlsx) can then be uploaded to
[google drive](https://drive.google.com/drive/u/1/folders/1i5ID5i6yodmXkK5FjFZsXQJT_gfToIfL).



### Rebuilding containers:

```
docker-compose build
```

### Restarting containers:

```
docker-compose restart
```

### Bringing containers down:

Note that this will delete the containers themselves
```
docker-compose down
```

### Kill it with fire
In order to nuke your database and everythign in it use:

```bash
docker-compose down -v
scripts/build.sh
```

### Logging

Logging is done using the excellent loguru:

```python
from loguru import logger

logger.info("The meaning of life: {}", 42)
```
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
docker-compose run --rm backend alembic upgrade head
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

Alembic can view the status of the database and compare against the table metadata in the application, generating the “obvious” migrations based on a comparison. This is achieved using the --autogenerate option to the alembic revision command, which places so-called candidate migrations into our new migrations file. We review and modify these by hand as needed, then proceed normally.
```
alembic revision  --autogenerate -m "Data Model Updates."
```

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
docker-compose run backend pytest
```

any arguments to pytest can also be passed after this command

### Frontend Tests

```
docker-compose run frontend test
```

This is the same as running npm test from within the frontend directory

### CI

Testing is run through the continuous integration pipeline [.github/workflows/cicd.yml](.github/workflows/cicd.yml) in the `test` job.

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

Linting is run through the continuous integration pipeline [.github/workflows/cicd.yml](.github/workflows/cicd.yml) in the `lint` job.

## Logging

```
docker-compose logs
```

Or for a specific service:

```
docker-compose logs -f name_of_service # frontend|backend|db
```

## Deployment

The app is deployed using GitHub actions configured through [.github/workflows/cicd.yml](.github/workflows/cicd.yml).
### Deployment Process
* Process captured in wiki: https://dev.azure.com/BIO-WA/WA-BDR/_wiki/wikis/BDR-WA.wiki/96/Developer-information

### Configuration
Environment specific configuration can be placed in a .env in the project directory on the deployment server.
Take a look at [.env.default](.env.default) for an example of how to configure the app.

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
