# syntax=docker/dockerfile:1.6

########################################
# Stage 1: Dependencies (prod)
########################################
FROM node:lts AS deps
WORKDIR /app

# Only copy manifests first for better layer caching
COPY package.json package-lock.json ./

# Install production deps using a secret-provided token
RUN --mount=type=secret,id=npm_token \
    set -eu; \
    TOKEN="$(cat /run/secrets/npm_token)"; \
    printf "//registry.npmjs.org/:_authToken=%s\n" "$TOKEN" > /tmp/.npmrc; \
    NPM_CONFIG_USERCONFIG=/tmp/.npmrc \
    npm ci --omit=dev --no-audit --prefer-offline; \
    rm -f /tmp/.npmrc

########################################
# Stage 2: Build (if you have a frontend build step)
########################################
FROM node:lts AS build
WORKDIR /app
ENV NODE_ENV=production

# Copy source and reuse prod deps from deps stage
COPY --from=deps /app/node_modules /app/node_modules
COPY . .

# Run your build script (optional; e.g., bundling static assets)
# If you need private registry access during build too, mount secret here similarly
# RUN npm run build

########################################
# Stage 3: Runtime (lean)
########################################
FROM node:lts AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NODE_PATH=/app/node_modules \
    PATH=/app/node_modules/.bin:$PATH

# Copy only what's needed into final image
COPY --from=deps /app/node_modules /app/node_modules
COPY . .

# If your app produces build artifacts in Stage 2, copy them instead of raw sources:
# COPY --from=build /app/dist /app/dist

# Drop privileges (Node official image has 'node' user)
USER node

EXPOSE 8000
EXPOSE 35729

ENTRYPOINT ["/bin/bash", "/app/run.sh"]
CMD ["start"]
