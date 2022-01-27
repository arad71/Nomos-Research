  
FROM python:3.10
# If you're using a different user on your system other than the first user you'll have to change these
ARG USER_ID=1000
ARG GROUP_ID=1000
ARG USER_NAME=app
ARG GROUP_NAME=app

RUN mkdir /app
WORKDIR /app

COPY requirements.txt ./
RUN \
  addgroup --gid $GROUP_ID app && \
  adduser --disabled-password --gecos '' --uid $USER_ID --gid $GROUP_ID app && \
  apt update && \
  apt install -y postgresql-client && \
  chown -R app:app ./ && \
  pip install --no-cache-dir --upgrade pip && \
  pip install --no-cache-dir --upgrade -r requirements.txt

USER app
COPY . .