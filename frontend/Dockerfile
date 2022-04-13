FROM node:lts

# TODO is this a security issues? Use multi-stage build?
ARG NPM_TOKEN
RUN test -n "$NPM_TOKEN" || (echo "\033[1;31mNPM_TOKEN not set\033[0m"; exit 1;)
COPY .npmrc.docker .npmrc
ADD package.json /package.json

ENV NODE_PATH=/node_modules
ENV PATH=$PATH:/node_modules/.bin
RUN npm install
RUN rm -f .npmrc.docker

WORKDIR /app
ADD . /app

EXPOSE 8000
EXPOSE 35729

ENTRYPOINT ["/bin/bash", "/app/run.sh"]
CMD ["start"]
