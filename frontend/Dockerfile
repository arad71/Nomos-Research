# syntax=docker/dockerfile:1.7
# Use ^ BuildKit frontend to enable RUN --mount features

FROM node:20-alpine AS deps
WORKDIR /app

# Copy only manifest files to leverage caching
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# Use a secret at build time; do NOT use ARG/ENV for tokens
# Create a temporary .npmrc that uses the secret, install deps, then remove it
RUN --mount=type=secret,id=npm_token \
    set -eux; \
    TOKEN="$(cat /run/secrets/npm_token)"; \
    printf "//registry.npmjs.org/:_authToken=%s\n" "$TOKEN" > .npmrc; \
    npm ci --ignore-scripts --no-audit; \
    rm -f .npmrc

FROM node:20-alpine AS build
WORKDIR /app

# Optional: define NODE_ENV with a default to remove the warning
# If you don't actually need it, you can omit both ARG and ENV lines
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Bring in node_modules from deps for deterministic builds
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Copy built app only, minimize final image
COPY --from=build /app/dist ./dist
COPY package*.json ./

# Install only prod dependencies in final image (no token needed here)
RUN npm ci --omit=dev --ignore-scripts --no-audit

EXPOSE 3000
CMD ["node", "dist/server.js"]
