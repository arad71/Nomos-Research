# Stage 1: dependency installation
FROM node:lts AS deps

WORKDIR /install

COPY package.json package-lock.json .npmrc.docker ./

RUN --mount=type=secret,id=npm_token \
    export NPM_TOKEN=$(cat /run/secrets/npm_token) && \
    sed "s|NPM_TOKEN|${NPM_TOKEN}|g" .npmrc.docker > .npmrc && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 180000 && \
    npm ci --prefer-offline --no-audit && \
    rm -f .npmrc

# Stage 2: runtime image
FROM node:lts AS runtime

ENV NODE_PATH=/node_modules
ENV PATH=$PATH:/node_modules/.bin

COPY --from=deps /install/node_modules /node_modules

WORKDIR /app
COPY . /app

EXPOSE 8000
EXPOSE 35729

ENTRYPOINT ["/bin/bash", "/app/run.sh"]
CMD ["start"]
