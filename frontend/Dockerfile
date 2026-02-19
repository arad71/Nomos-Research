# --- Stage 1: Build ---
FROM node:lts-bookworm AS builder

# using Docker Secrets to handle the token securely during the build process
RUN --mount=type=secret,id=NPM_TOKEN \
    export NPM_TOKEN=$(cat /run/secrets/NPM_TOKEN) && \
    # Create the temporary .npmrc inside the build stage
    echo "@react-admin:registry=https://npm.react-admin-ee.marmelab.com" > .npmrc && \
    echo "//://npm.react-admin-ee.marmelab.com{NPM_TOKEN}" >> .npmrc && \
    npm ci --prefer-offline --no-audit && \
    rm .npmrc

WORKDIR /app
COPY . .
RUN npm run build

# --- Stage 2: Production ---
FROM node:lts-bookworm-slim

WORKDIR /app
# Only copy the final compiled assets, NOT the node_modules or the token
COPY --from=builder /app/dist ./dist
# If you use a custom runner/script
COPY --from=builder /app/run.sh ./run.sh

ENV NODE_ENV=production
EXPOSE 8000

ENTRYPOINT ["/bin/bash", "/app/run.sh"]
CMD ["start"]