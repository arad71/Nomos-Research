# # syntax=docker/dockerfile:1.7

# # --- Stage 1: Build ---
# FROM node:lts-bookworm AS builder

# WORKDIR /app

# # Copy only the dependency files first for better layer caching
# COPY package.json package-lock.json ./

# # Use Docker BuildKit secrets to read NPM token securely
# RUN --mount=type=secret,id=NPM_TOKEN \
#     if [ -f /run/secrets/NPM_TOKEN ]; then \
#         ACTUAL_TOKEN="$(cat /run/secrets/NPM_TOKEN)"; \
#         echo "@react-admin:registry=https://npm.react-admin-ee.marmelab.com" > .npmrc; \
#         echo "//npm.react-admin-ee.marmelab.com/:_authToken=${ACTUAL_TOKEN}" >> .npmrc; \
#         echo "//npm.react-admin-ee.marmelab.com/:always-auth=true" >> .npmrc; \
#     else \
#         echo "Error: NPM_TOKEN secret not found in /run/secrets/"; exit 1; \
#     fi && \
#     npm ci --prefer-offline --no-audit && \
#     rm .npmrc

# # Now copy the rest of your app and build
# COPY . .
# RUN npm run build

# # --- Stage 2: Production ---
# FROM node:lts-bookworm-slim

# WORKDIR /app

# # Only copy the final compiled assets, NOT node_modules or the token
# COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/run.sh ./run.sh

# # Ensure the script is executable
# RUN chmod +x /app/run.sh

# ENV NODE_ENV=production
# EXPOSE 8000

# ENTRYPOINT ["/bin/bash", "/app/run.sh"]
# CMD ["start"]


FROM node:lts

# TODO is this a security issues? Use multi-stage build?
ARG NPM_TOKEN
RUN test -n "$NPM_TOKEN" || (echo "\033[1;31mNPM_TOKEN not set\033[0m"; exit 1;)
COPY .npmrc.docker .npmrc
ADD package.json /package.json
ADD package-lock.json /package-lock.json

ENV NODE_ENV=$NODE_ENV
ENV NODE_PATH=/node_modules
ENV PATH=$PATH:/node_modules/.bin
RUN npm config set fetch-retry-mintimeout 20000
RUN npm config set fetch-retry-maxtimeout 180000
RUN npm ci --prefer-offline --no-audit
RUN rm -f .npmrc.docker

WORKDIR /app
ADD . /app

EXPOSE 8000
EXPOSE 35729

ENTRYPOINT ["/bin/bash", "/app/run.sh"]
CMD ["start"]
