# syntax=docker/dockerfile:1.7

# --- Stage 1: Build ---
FROM node:lts-bookworm AS builder

WORKDIR /app

# Copy only the dependency files first for better layer caching
COPY package.json package-lock.json ./

# Use Docker BuildKit secrets to read NPM token securely
RUN --mount=type=secret,id=NPM_TOKEN \
    if [ -f /run/secrets/NPM_TOKEN ]; then \
        ACTUAL_TOKEN="$(cat /run/secrets/NPM_TOKEN)"; \
        echo "@react-admin:registry=https://npm.react-admin-ee.marmelab.com" > .npmrc; \
        echo "//npm.react-admin-ee.marmelab.com/:_authToken=${ACTUAL_TOKEN}" >> .npmrc; \
        echo "//npm.react-admin-ee.marmelab.com/:always-auth=true" >> .npmrc; \
    else \
        echo "Error: NPM_TOKEN secret not found in /run/secrets/"; exit 1; \
    fi && \
    npm ci --prefer-offline --no-audit && \
    rm .npmrc

# Now copy the rest of your app and build
COPY . .
RUN npm run build

# --- Stage 2: Production ---
FROM node:lts-bookworm-slim

WORKDIR /app

# Only copy the final compiled assets, NOT node_modules or the token
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/run.sh ./run.sh

# Ensure the script is executable
RUN chmod +x /app/run.sh

ENV NODE_ENV=production
EXPOSE 8000

ENTRYPOINT ["/bin/bash", "/app/run.sh"]
CMD ["start"]
