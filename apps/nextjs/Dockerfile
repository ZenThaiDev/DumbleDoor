FROM node:20 AS alpine

# Setup environment variables
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV TURBO_TELEMETRY_DISABLED=1
ENV CI=true
ENV SKIP_ENV_VALIDATION=true

# Setup pnpm on the alpine base
FROM alpine as base

# Enable corepack and install turbo
RUN corepack enable
RUN pnpm install turbo --global

# Builder
FROM base AS builder

# Install system dependencies
RUN apt update
RUN apt install -y build-essential

# Set working directory
WORKDIR /app
COPY . .
RUN turbo prune @dumbledoor/nextjs --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apt update
RUN apt install -y build-essential
WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN pnpm install

# Build the project
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# Enable remote caching
# ARG TURBO_TEAM
# ENV TURBO_TEAM=$TURBO_TEAM
# ARG TURBO_TOKEN
# ENV TURBO_TOKEN=$TURBO_TOKEN

# Generate the database and build types
RUN pnpm postinstall
RUN turbo run build --filter=@dumbledoor/log-db
RUN turbo run build --filter=@dumbledoor/user-db
RUN turbo run build --filter=@dumbledoor/access-db
RUN turbo run build --filter=@dumbledoor/door-db
RUN turbo run build --filter=@dumbledoor/card-db
RUN turbo run build --filter=@dumbledoor/alarm-db

RUN turbo run build --filter=@dumbledoor/nextjs

# Runner
FROM alpine AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer /app/apps/nextjs/next.config.js .
COPY --from=installer /app/apps/nextjs/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/nextjs/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/nextjs/.next/static ./apps/nextjs/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/nextjs/public ./apps/nextjs/public

CMD node apps/nextjs/server.js