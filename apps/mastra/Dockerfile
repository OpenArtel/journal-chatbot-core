# syntax=docker/dockerfile:1.6

ARG APP=apps/mastra

# DEPS
FROM node:22-alpine AS deps
ARG APP

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY ${APP}/package.json ${APP}/package.json

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --filter ./${APP}... --prod --frozen-lockfile

# BUILDER
FROM deps AS builder
ARG APP

COPY ${APP}/ ${APP}/
WORKDIR /app/${APP}

RUN pnpm build


# RUNNER
FROM deps AS runner
ARG APP

ENV NODE_ENV=production

COPY --from=builder /app/${APP} /app/${APP}

WORKDIR /app/${APP}

CMD ["pnpm", "start"]
