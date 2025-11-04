FROM oven/bun:1 AS base
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

RUN bun run build
RUN bun build:migrations

FROM oven/bun:1 AS release
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

COPY --from=base /app/.dist ./.dist

COPY --from=base /app/drizzle ./drizzle
COPY --from=base /app/drizzle.config.js ./drizzle.config.js

EXPOSE 3000

ENTRYPOINT ["bun", "run", ".dist/index.js"]