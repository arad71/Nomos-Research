
FROM python:3.9
# If you're using a different user on your system other than the first user you'll have to change these
ARG USER_ID=1000
ARG GROUP_ID=1000

RUN mkdir -p /app/log /legacy_data
WORKDIR /app

RUN \
  addgroup --gid $GROUP_ID app && \
  adduser --disabled-password --gecos '' --uid $USER_ID --gid $GROUP_ID app && \
  apt update && \
  apt install -y postgresql-client wait-for-it && \
  pip install --no-cache-dir --upgrade pip && \
  pip install poetry && \
  poetry config virtualenvs.create false

COPY poetry.lock pyproject.toml ./
COPY app/__init__.py ./app/__init__.py

RUN \
  chown -R app:app ./ && \
  chown -R app:app /legacy_data && \
  poetry install --no-dev

USER app
COPY . .
RUN mkdir -p /app/log
ENV PATH="$PATH:/app/bin"
