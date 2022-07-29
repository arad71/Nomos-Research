
FROM python:3.9
# If you're using a different user on your system other than the first user you'll have to change these
ARG USER_ID=1000
ARG GROUP_ID=1000

RUN mkdir /app /legacy_data

WORKDIR /app
COPY . .

RUN \
  addgroup --gid $GROUP_ID app && \
  adduser --disabled-password --gecos '' --uid $USER_ID --gid $GROUP_ID app && \
  apt-get update && \
  apt-get install -y postgresql-client wait-for-it && \
  chown -R app:app ./ && \
  chown -R app:app /legacy_data && \
  pip install --no-cache-dir --upgrade pip && \
  pip install poetry && \
  poetry config virtualenvs.create false  && \
  poetry install --no-dev

USER app
