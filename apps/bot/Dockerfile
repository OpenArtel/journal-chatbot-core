# syntax=docker/dockerfile:1.6

FROM oven/bun:1 AS base

ARG APP=apps/bot

WORKDIR /app/${APP}

COPY /${APP}/package.json /${APP}/bun.lock ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --prod --frozen-lockfile

COPY ${APP}/ ./

CMD ["bun", "run", "start"]
